const BASE_URL = 'https://api.watchmode.com/v1';

export function registerWatchmodeRoutes(app) {

  async function watchmodeRequest(endpoint, params = {}) {
    const apiKey = process.env.WATCHMODE_API_KEY;

    if (!apiKey) {
      throw new Error('WATCHMODE_API_KEY is missing');
    }

    const url = new URL(`${BASE_URL}${endpoint}`);

    url.searchParams.set('apiKey', apiKey);

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
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

      return data;
    } finally {
      clearTimeout(timeout);
    }
  }

  // TV status
  app.get('/api/tv/watchmode/status', (req, res) => {
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
      console.error('[WATCHMODE SEARCH]', error.message);

      res.status(502).json({
        success: false,
        error: 'Movie search temporarily unavailable'
      });
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
      console.error('[WATCHMODE DETAILS]', error.message);

      res.status(502).json({
        success: false,
        error: 'Title details unavailable'
      });
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
      console.error('[WATCHMODE SOURCES]', error.message);

      res.status(502).json({
        success: false,
        error: 'Streaming availability unavailable'
      });
    }
  });

  console.log('📺 SASIKUMAR AI TV - Watchmode routes registered');
}
