const EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_DIM = 768;

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
}

export async function embedKnowledgeText(text, taskType = 'RETRIEVAL_DOCUMENT') {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY missing');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: {
          parts: [{ text: String(text).slice(0, 20000) }]
        },
        taskType,
        outputDimensionality: EMBEDDING_DIM
      }),
      signal: AbortSignal.timeout(30000)
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `Embedding API error ${response.status}`);
  }

  const values = data?.embedding?.values;
  if (!Array.isArray(values) || values.length !== EMBEDDING_DIM) {
    throw new Error('Invalid embedding response or dimension');
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
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
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
    const embedding = await embedKnowledgeText(chunks[i]);
    const vector = `[${embedding.join(',')}]`;

    await pool.query(
      `INSERT INTO public.sk_knowledge_chunks
       (source, title, content, chunk_index, metadata, embedding)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::vector)`,
      [
        String(source).slice(0, 300),
        String(title).slice(0, 500),
        chunks[i],
        i,
        JSON.stringify(metadata),
        vector
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

  const embedding = await embedKnowledgeText(
    query,
    'RETRIEVAL_QUERY'
  );

  const vector = `[${embedding.join(',')}]`;
  const safeLimit = Math.max(1, Math.min(Number(limit) || 5, 10));

  const result = await pool.query(
    `SELECT id, source, title, content, metadata,
            1 - (embedding <=> $1::vector) AS similarity,
            CASE
              WHEN source = 'Hugging Face Tamil QA'
               AND content ILIKE '%' || $2 || '%'
              THEN 1
              ELSE 0
            END AS exact_match
     FROM public.sk_knowledge_chunks
     WHERE embedding IS NOT NULL
     ORDER BY exact_match DESC,
              embedding <=> $1::vector
     LIMIT $3`,
    [vector, query, safeLimit]
  );

  return result.rows;
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
