const EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_DIM = 768;

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
}

export async function embedKnowledgeText(text, taskType = 'RETRIEVAL_DOCUMENT') {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY missing');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`;
  const body = JSON.stringify({
    model: `models/${EMBEDDING_MODEL}`,
    content: {
      parts: [{ text: String(text).slice(0, 20000) }]
    },
    taskType,
    outputDimensionality: EMBEDDING_DIM
  });

  const maxAttempts = 4;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(30000)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(
          data?.error?.message || `Embedding API error ${response.status}`
        );

        if (response.status !== 429 && response.status < 500) {
          throw error;
        }

        if (attempt === maxAttempts) throw error;

        console.warn(
          `Embedding API HTTP ${response.status}; retry ${attempt}/${maxAttempts}`
        );
      } else {
        const values = data?.embedding?.values;

        if (!Array.isArray(values) || values.length !== EMBEDDING_DIM) {
          throw new Error('Invalid embedding response or dimension');
        }

        return values;
      }
    } catch (error) {
      const retryable =
        error.name === 'AbortError' ||
        error.name === 'TimeoutError' ||
        error.name === 'TypeError' ||
        /fetch failed|ECONNRESET|ETIMEDOUT|ECONNREFUSED|EAI_AGAIN/i.test(error.message);

      if (!retryable || attempt === maxAttempts) {
        throw error;
      }

      console.warn(
        `Embedding network error; retry ${attempt}/${maxAttempts}: ${error.message}`
      );
    }

    await new Promise(resolve => setTimeout(resolve, attempt * 2000));
  }

  throw new Error('Embedding failed after all retry attempts');
}
async function embedCloudflareKnowledgeText(text, mode = 'document', title = '') {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  if (!account || !token) {
    throw new Error('Cloudflare embedding credentials missing');
  }

  const input = mode === 'query'
    ? `task: search result | query: ${String(text).slice(0, 20000)}`
    : `title: ${String(title || 'Knowledge').slice(0, 500)} | text: ${String(text).slice(0, 20000)}`;

  const url = `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/@cf/google/embeddinggemma-2`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ input: [input] }),
    signal: AbortSignal.timeout(30000)
  });

  const data = await response.json().catch(() => ({}));
  const values = data?.result?.data?.[0]?.embedding;

  if (!response.ok || !Array.isArray(values) || values.length !== EMBEDDING_DIM) {
    throw new Error(
      data?.errors?.[0]?.message || `Cloudflare embedding error ${response.status}`
    );
  }

  return values;
}

export async function initKnowledgeBase(pool) {
  if (!pool) throw new Error('PostgreSQL pool is required');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.sk_knowledge_chunks (
      id BIGSERIAL PRIMARY KEY,
      source TEXT NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      chunk_index INTEGER DEFAULT 0,
      metadata JSONB DEFAULT '{}'::jsonb,
      embedding VECTOR(768),
      cloudflare_embedding VECTOR(768),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE public.sk_knowledge_chunks
    ADD COLUMN IF NOT EXISTS cloudflare_embedding VECTOR(768)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS sk_knowledge_source_idx
    ON public.sk_knowledge_chunks(source)
  `);

  return true;
}

function splitIntoChunks(input, size = 1800, overlap = 200) {
  const text = String(input || '').replace(/\s+/g, ' ').trim();
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= text.length) break;
    start = end - overlap;
  }

  return chunks;
}

export async function ingestKnowledgeText(pool, {
  source,
  title = '',
  content,
  metadata = {}
}) {
  if (!pool) throw new Error('PostgreSQL pool is required');
  if (!source || !String(content || '').trim()) {
    throw new Error('source and content are required');
  }

  const chunks = splitIntoChunks(content);
  let inserted = 0;

  for (let i = 0; i < chunks.length; i++) {
    let vector = null;
    let cloudflareVector = null;

    try {
      const embedding = await embedKnowledgeText(chunks[i]);
      vector = `[${embedding.join(',')}]`;
    } catch (geminiError) {
      console.warn('GEMINI EMBEDDING FAILED; trying CLOUDFLARE:', geminiError.message);

      try {
        const embedding = await embedCloudflareKnowledgeText(
          chunks[i],
          'document',
          title
        );
        cloudflareVector = `[${embedding.join(',')}]`;
      } catch (cloudflareError) {
        console.error(
          'BOTH EMBEDDING PROVIDERS FAILED:',
          cloudflareError.message
        );
      }
    }

    await pool.query(
      `INSERT INTO public.sk_knowledge_chunks
       (source, title, content, chunk_index, metadata,
        embedding, cloudflare_embedding)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::vector, $7::vector)`,
      [
        String(source).slice(0, 300),
        String(title).slice(0, 500),
        chunks[i],
        i,
        JSON.stringify(metadata),
        vector,
        cloudflareVector
      ]
    );
    inserted++;
  }

  return { inserted, chunks: chunks.length };
}

export async function searchKnowledge(pool, question, limit = 5) {
  if (!pool) throw new Error('PostgreSQL pool is required');

  const query = String(question || '').trim();
  if (!query) return [];

  const safeLimit = Math.max(1, Math.min(Number(limit) || 5, 10));

  async function searchWithProvider(column, embedding, provider) {
    const vector = `[${embedding.join(',')}]`;

    const result = await pool.query(
      `SELECT id, source, title, content, metadata,
              1 - (${column} <=> $1::vector) AS similarity,
              CASE
                WHEN source = 'Hugging Face Tamil QA'
                 AND content ILIKE '%' || $2 || '%'
                THEN 1
                ELSE 0
              END AS exact_match
       FROM public.sk_knowledge_chunks
       WHERE ${column} IS NOT NULL
       ORDER BY exact_match DESC, ${column} <=> $1::vector
       LIMIT $3`,
      [vector, query, safeLimit]
    );

    return result.rows.map(row => ({ ...row, embedding_provider: provider }));
  }

  const attempts = await Promise.allSettled([
    (async () => searchWithProvider(
      'embedding',
      await embedKnowledgeText(query, 'RETRIEVAL_QUERY'),
      'gemini'
    ))(),
    (async () => searchWithProvider(
      'cloudflare_embedding',
      await embedCloudflareKnowledgeText(query, 'query'),
      'cloudflare'
    ))()
  ]);

  const successful = attempts
    .filter(item => item.status === 'fulfilled')
    .map(item => item.value);

  if (!successful.length) {
    const errors = attempts
      .filter(item => item.status === 'rejected')
      .map(item => item.reason?.message || 'Unknown embedding error');
    throw new Error(`All embedding searches failed: ${errors.join(' | ')}`);
  }

  // Reciprocal-rank fusion combines results without assuming
  // that similarity scores from different models are directly comparable.
  const merged = new Map();

  for (const rows of successful) {
    rows.forEach((row, index) => {
      const contribution = 1 / (60 + index + 1);
      const existing = merged.get(String(row.id));

      if (existing) {
        existing.fusion_score += contribution;
        if (Number(row.exact_match) > Number(existing.exact_match)) {
          existing.exact_match = row.exact_match;
        }
      } else {
        merged.set(String(row.id), {
          ...row,
          fusion_score: contribution
        });
      }
    });
  }

  return [...merged.values()]
    .sort((a, b) =>
      Number(b.exact_match) - Number(a.exact_match) ||
      b.fusion_score - a.fusion_score
    )
    .slice(0, safeLimit);
}

export async function getKnowledgeStats(pool) {
  const result = await pool.query(`
    SELECT source, COUNT(*)::integer AS chunks
    FROM public.sk_knowledge_chunks
    GROUP BY source
    ORDER BY source
  `);
  return result.rows;
}
