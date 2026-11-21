const DATAGOV_BASE_URL = 'https://api.gsa.gov/technology/datagov/v4';

export async function searchDataGov({
  query,
  perPage = 10,
  after = ''
} = {}) {
  const apiKey = process.env.DATAGOV_API_KEY;

  if (!apiKey) {
    throw new Error('DATAGOV_API_KEY is missing');
  }

  if (!query || !String(query).trim()) {
    throw new Error('Search query is required');
  }

  const params = new URLSearchParams({
    q: String(query).trim(),
    per_page: String(Math.min(Math.max(Number(perPage) || 10, 1), 100))
  });

  if (after) {
    params.set('after', String(after));
  }

  const response = await fetch(
    `${DATAGOV_BASE_URL}/search?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        Accept: 'application/json'
      },
      signal: AbortSignal.timeout(20000)
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `Data.gov API error: HTTP ${response.status}`
    );
  }

  const results = Array.isArray(data.results) ? data.results : [];

  return {
    success: true,
    query: String(query).trim(),
    count: results.length,
    datasets: results.map(item => ({
      title: item.title || '',
      identifier: item.identifier || '',
      publisher: item.publisher || '',
      description: item.description || '',
      modified: item.modified || '',
      landingPage: item.landingPage || '',
      type: item.type || ''
    })),
    nextCursor: data.after || null,
    hasMore: Boolean(data.after)
  };
}
