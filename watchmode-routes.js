const BASE_URL = 'https://api.watchmode.com/v1';

export function registerWatchmodeRoutes(app) {
  const responseCache = new Map();
  const inFlight = new Map();

  const CACHE_TTL_MS = 5 * 60 * 1000;
  const MAX_CACHE_ENTRIES = 500;

  // Maximum 60 uncached Watchmode API requests per minute per instance.
  const RATE_LIMIT = 60;
  const RATE_WINDOW_MS = 60 * 1000;
  let rateWindowStartedAt = Date.now();
  let rateCount = 0;

  function allowWatchmodeRequest() {
    const now = Date.now();

    if (now - rateWindowStartedAt >= RATE_WINDOW_MS) {
      rateWindowStartedAt = now;
      rateCount = 0;
    }

    if (rateCount >= RATE_LIMIT) return false;

    rateCount++;
    return true;
  }

  async function watchmodeRequest(endpoint, params = {}) {
    const apiKey = process.env.WATCHMODE_API_KEY;

    if (!apiKey) {
      throw new Error('WATCHMODE_API_KEY is missing');
    }

    const sortedParams = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .sort(([a], [b]) => a.localeCompare(b));

    const cacheKey = JSON.stringify([endpoint, sortedParams]);
    const now = Date.now();

    const cached = responseCache.get(cacheKey);

    if (cached && now < cached.expiresAt) {
      return cached.data;
    }

    if (cached) responseCache.delete(cacheKey);

    // Combine simultaneous identical requests.
    if (inFlight.has(cacheKey)) {
      return inFlight.get(cacheKey);
    }

    if (!allowWatchmodeRequest()) {
      const error = new Error('Watchmode rate limit reached');
      error.statusCode = 429;
      throw error;
    }

    const requestPromise = (async () => {
      const url = new URL(`${BASE_URL}${endpoint}`);
      url.searchParams.set('apiKey', apiKey);

      for (const [key, value] of sortedParams) {
        url.searchParams.set(key, String(value));
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(`Watchmode API error: ${response.status}`);
        }

        // Remove expired entries before adding new data.
        for (const [key, entry] of responseCache) {
          if (Date.now() >= entry.expiresAt) {
            responseCache.delete(key);
          }
        }

        // Keep cache size bounded.
        if (responseCache.size >= MAX_CACHE_ENTRIES) {
          const oldestKey = responseCache.keys().next().value;
          if (oldestKey !== undefined) {
            responseCache.delete(oldestKey);
          }
        }

        responseCache.set(cacheKey, {
          data,
          expiresAt: Date.now() + CACHE_TTL_MS
        });

        return data;
      } finally {
        clearTimeout(timeout);
      }
    })();

    inFlight.set(cacheKey, requestPromise);

    try {
      return await requestPromise;
    } finally {
      inFlight.delete(cacheKey);
    }
  }

  function sendRouteError(res, error, label, fallbackMessage) {
    console.error(label, error.message);

    if (error.statusCode === 429) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again in a minute.'
      });
    }

    return res.status(502).json({
      success: false,
      error: fallbackMessage
    });
  }

  // TV status
  app.get('/api/tv/watchmode/status', (req, res) => {
    res.set('Cache-Control', 'no-store');

    res.json({
      success: true,
      service: 'SASIKUMAR AI TV',
      provider: 'Watchmode',
      configured: Boolean(process.env.WATCHMODE_API_KEY)
    });
  });

  // Movie and TV search
  app.get('/api/tv/watchmode/search', async (req, res) => {
    try {
      const query = String(req.query.q || '').trim();

      if (!query || query.length > 150) {
        return res.status(400).json({
          success: false,
          error: 'Enter a valid movie or TV show name'
        });
      }

      const data = await watchmodeRequest('/search/', {
        search_field: 'name',
        search_value: query
      });

      res.json({
        success: true,
        service: 'SASIKUMAR AI TV',
        query,
        results: data.title_results || [],
        people: data.people_results || []
      });
    } catch (error) {
      return sendRouteError(
        res,
        error,
        '[WATCHMODE SEARCH]',
        'Movie search temporarily unavailable'
      );
    }
  });

  // Movie / TV details
  app.get('/api/tv/watchmode/details/:id', async (req, res) => {
    try {
      const id = String(req.params.id);

      if (!/^[a-zA-Z0-9_-]{1,40}$/.test(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid title ID'
        });
      }

      const data = await watchmodeRequest(
        `/title/${encodeURIComponent(id)}/details/`
      );

      res.json({
        success: true,
        details: data
      });
    } catch (error) {
      return sendRouteError(
        res,
        error,
        '[WATCHMODE DETAILS]',
        'Title details unavailable'
      );
    }
  });

  // Streaming availability
  app.get('/api/tv/watchmode/sources/:id', async (req, res) => {
    try {
      const id = String(req.params.id);

      if (!/^[a-zA-Z0-9_-]{1,40}$/.test(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid title ID'
        });
      }

      const region = String(req.query.region || 'IN').toUpperCase();

      if (!/^[A-Z]{2}$/.test(region)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid country code'
        });
      }

      const data = await watchmodeRequest(
        `/title/${encodeURIComponent(id)}/sources/`,
        { regions: region }
      );

      res.json({
        success: true,
        region,
        sources: data
      });
    } catch (error) {
      return sendRouteError(
        res,
        error,
        '[WATCHMODE SOURCES]',
        'Streaming availability unavailable'
      );
    }
  });

  console.log('📺 SASIKUMAR AI TV - Watchmode routes registered with cache and rate limit');
}
