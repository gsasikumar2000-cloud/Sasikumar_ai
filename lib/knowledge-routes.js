import {
  searchKnowledge,
  getKnowledgeStats
} from './knowledge-base.js';

export function registerKnowledgeRoutes(app, pool) {
  if (!app || !pool) {
    throw new Error('Express app and PostgreSQL pool are required');
  }

  app.get('/api/knowledge/health', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT COUNT(*)::integer AS chunks
        FROM public.sk_knowledge_chunks
      `);

      res.json({
        status: 'OK',
        knowledgeBase: true,
        chunks: result.rows[0].chunks
      });
    } catch (error) {
      res.status(500).json({
        status: 'ERROR',
        message: error.message
      });
    }
  });

  app.post('/api/knowledge/search', async (req, res) => {
    try {
      const question = String(req.body?.question || '').trim();

      if (!question) {
        return res.status(400).json({
          error: 'Question is required'
        });
      }

      if (question.length > 3000) {
        return res.status(413).json({
          error: 'Question is too long'
        });
      }

      const results = await searchKnowledge(pool, question, 5);

      res.json({
        success: true,
        count: results.length,
        results
      });
    } catch (error) {
      console.error('[Knowledge Search]', error.message);
      res.status(500).json({
        success: false,
        error: 'Knowledge search failed'
      });
    }
  });

  app.get('/api/knowledge/stats', async (req, res) => {
    try {
      const stats = await getKnowledgeStats(pool);
      res.json({
        success: true,
        sources: stats
      });
    } catch (error) {
      console.error('[Knowledge Stats]', error.message);
      res.status(500).json({
        success: false,
        error: 'Knowledge stats unavailable'
      });
    }
  });
}
