import { randomInt, randomUUID } from 'node:crypto';
import agora from 'agora-token';

const { RtcTokenBuilder, RtcRole } = agora;
const TOKEN_TTL = 2 * 60 * 60;

function createRtcToken(appId, certificate, channel, uid, role) {
  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL;

  return RtcTokenBuilder.buildTokenWithUid(
    appId,
    certificate,
    channel,
    uid,
    role,
    expiresAt
  );
}

export function registerAgoraLiveRoutes(app, { pool, auth }) {
  const config = () => ({
    appId: process.env.AGORA_APP_ID,
    certificate: process.env.AGORA_APP_CERTIFICATE
  });

  const shareUrl = (req, shareId) => {
    const base = process.env.PUBLIC_BASE_URL;
    if (base) {
      return `${base.replace(/\/+$/, '')}/live-media.html?live=${encodeURIComponent(shareId)}`;
    }
    const forwarded = req.get('x-forwarded-proto');
    const protocol = forwarded
      ? forwarded.split(',')[0].trim()
      : req.protocol;
    return `${protocol}://${req.get('host')}/live-media.html?live=${encodeURIComponent(shareId)}`;
  };

  app.post('/api/agora/live/start', auth.requireAuth, async (req, res) => {
    res.set('Cache-Control', 'no-store');

    if (!pool) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const { appId, certificate } = config();
    if (!appId || !certificate) {
      return res.status(503).json({ error: 'Agora service is not configured.' });
    }

    const hostId = req.authUser.id;
    const hostUsername = String(req.authUser.username || 'Host').slice(0, 100);

    try {
      const existing = await pool.query(
        `SELECT share_id FROM public.agora_live_rooms
         WHERE host_user_id = $1 AND status = 'active' LIMIT 1`,
        [hostId]
      );

      if (existing.rowCount) {
        return res.status(409).json({
          error: 'You already have an active live.',
          shareId: existing.rows[0].share_id
        });
      }

      const shareId = randomUUID();
      const channelName = `sklive_${randomUUID().replace(/-/g, '')}`;
      const uid = randomInt(1, 2147483647);
      const token = createRtcToken(
        appId, certificate, channelName, uid, RtcRole.PUBLISHER
      );

      await pool.query(
        `INSERT INTO public.agora_live_rooms
         (share_id, channel_name, host_user_id, host_username)
         VALUES ($1, $2, $3, $4)`,
        [shareId, channelName, hostId, hostUsername]
      );

      return res.status(201).json({
        ok: true,
        appId,
        shareId,
        channelName,
        uid,
        token,
        expiresIn: TOKEN_TTL,
        shareUrl: shareUrl(req, shareId)
      });
    } catch (error) {
      if (error.code === '23505' &&
          error.constraint === 'agora_live_one_active_per_host_idx') {
        try {
          const current = await pool.query(
            `SELECT share_id FROM public.agora_live_rooms
             WHERE host_user_id = $1 AND status = 'active' LIMIT 1`,
            [hostId]
          );
          if (current.rowCount) {
            return res.status(409).json({
              error: 'You already have an active live.',
              shareId: current.rows[0].share_id
            });
          }
        } catch (lookupError) {
          console.error('Agora active live lookup:', lookupError.message);
        }
      }

      console.error('Agora live start:', error.message);
      return res.status(500).json({ error: 'Unable to start live.' });
    }
  });

  app.get('/api/agora/live/:shareId', async (req, res) => {
    res.set('Cache-Control', 'no-store');

    if (!pool) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    try {
      const result = await pool.query(
        `SELECT share_id, channel_name, host_username, status, started_at
         FROM public.agora_live_rooms
         WHERE share_id = $1 LIMIT 1`,
        [req.params.shareId]
      );

      if (!result.rowCount) {
        return res.status(404).json({ error: 'Live not found.' });
      }

      return res.json({ ok: true, live: result.rows[0] });
    } catch (error) {
      console.error('Agora live status:', error.message);
      return res.status(500).json({ error: 'Unable to check live status.' });
    }
  });

  app.post('/api/agora/live/:shareId/token', async (req, res) => {
    res.set('Cache-Control', 'no-store');

    if (!pool) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const { appId, certificate } = config();
    if (!appId || !certificate) {
      return res.status(503).json({ error: 'Agora service is not configured.' });
    }

    try {
      const result = await pool.query(
        `SELECT channel_name, status
         FROM public.agora_live_rooms
         WHERE share_id = $1 LIMIT 1`,
        [req.params.shareId]
      );

      if (!result.rowCount || result.rows[0].status !== 'active') {
        return res.status(404).json({ error: 'This live is not active.' });
      }

      const uid = randomInt(1, 2147483647);
      const token = createRtcToken(
        appId,
        certificate,
        result.rows[0].channel_name,
        uid,
        RtcRole.SUBSCRIBER
      );

      return res.json({
        ok: true,
        appId,
        channelName: result.rows[0].channel_name,
        uid,
        token,
        expiresIn: TOKEN_TTL
      });
    } catch (error) {
      console.error('Agora viewer token:', error.message);
      return res.status(500).json({ error: 'Unable to create viewer token.' });
    }
  });

  app.post('/api/agora/live/:shareId/end', auth.requireAuth, async (req, res) => {
    res.set('Cache-Control', 'no-store');

    if (!pool) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    try {
      const result = await pool.query(
        `UPDATE public.agora_live_rooms
         SET status = 'ended', ended_at = NOW()
         WHERE share_id = $1
           AND host_user_id = $2
           AND status = 'active'
         RETURNING share_id`,
        [req.params.shareId, req.authUser.id]
      );

      if (!result.rowCount) {
        return res.status(403).json({
          error: 'Live not found, already ended, or you are not the host.'
        });
      }

      return res.json({ ok: true, ended: true });
    } catch (error) {
      console.error('Agora live end:', error.message);
      return res.status(500).json({ error: 'Unable to end live.' });
    }
  });
}
