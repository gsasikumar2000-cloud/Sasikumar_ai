import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

const SESSION_DAYS = 30;
const TRIAL_DAYS = 30;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function newToken() {
  return crypto.randomBytes(32).toString('hex');
}

function newReferralId() {
  return 'SK-' + crypto.randomBytes(8).toString('hex').toUpperCase();
}

function readCookie(req, name) {
  const cookieHeader = req.headers.cookie || '';

  for (const item of cookieHeader.split(';')) {
    const part = item.trim();
    const separator = part.indexOf('=');

    if (separator < 0) continue;

    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();

    if (key === name) {
      try {
        return decodeURIComponent(value);
      } catch {
        return '';
      }
    }
  }

  return '';
}

function setSessionCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    `sk_ai_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    'sk_ai_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
  );
}

export function createAuthMiddleware(pool) {
  async function requireAuth(req, res, next) {
    try {
      if (!pool) {
        return res.status(503).json({
          ok: false,
          message: 'Database is not configured.'
        });
      }

      const token = readCookie(req, 'sk_ai_session');

      if (!token || !/^[a-f0-9]{64}$/.test(token)) {
        return res.status(401).json({
          ok: false,
          message: 'Please login.'
        });
      }

      const result = await pool.query(
        `SELECT u.id, u.username, u.role, u.referral_id,
                u.trial_started_at, u.trial_ends_at,
                u.unlimited_posting, s.id AS session_id
         FROM public.auth_sessions s
         JOIN public.users u ON u.id = s.user_id
         WHERE s.token_hash = $1
           AND s.expires_at > NOW()
         LIMIT 1`,
        [hashToken(token)]
      );

      if (!result.rows.length) {
        clearSessionCookie(res);
        return res.status(401).json({
          ok: false,
          message: 'Session expired. Please login again.'
        });
      }

      req.authUser = result.rows[0];
      next();
    } catch (error) {
      console.error('[Auth middleware]', error.message);
      return res.status(500).json({
        ok: false,
        message: 'Authentication check failed.'
      });
    }
  }

  async function requireActiveTrial(req, res, next) {
    return requireAuth(req, res, async () => {
      try {
        const user = req.authUser;

        if (user.unlimited_posting === true) {
          return next();
        }

        if (
          user.trial_ends_at &&
          new Date(user.trial_ends_at).getTime() > Date.now()
        ) {
          return next();
        }

        return res.status(403).json({
          ok: false,
          code: 'TRIAL_EXPIRED',
          message: 'Your free trial has expired. Please get approval to continue posting.'
        });
      } catch (error) {
        console.error('[Trial middleware]', error.message);
        return res.status(500).json({
          ok: false,
          message: 'Trial check failed.'
        });
      }
    });
  }

  return { requireAuth, requireActiveTrial };
}

export function registerAuthRoutes(app, pool, auth) {
  app.post('/api/signup', async (req, res) => {
    try {
      if (!pool) {
        return res.status(503).json({
          ok: false,
          message: 'Database is not configured.'
        });
      }

      const username = String(req.body?.username || '').trim();
      const password = String(req.body?.password || '');

      if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username)) {
        return res.status(400).json({
          ok: false,
          message: 'Username must be 3-30 characters and use letters, numbers, dot, underscore or hyphen.'
        });
      }

      if (password.length < 6 || password.length > 128) {
        return res.status(400).json({
          ok: false,
          message: 'Password must be 6-128 characters.'
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      for (let attempt = 0; attempt < 3; attempt++) {
        const referralId = newReferralId();

        try {
          const result = await pool.query(
            `INSERT INTO public.users
               (id, username, password_hash, role, created_at,
                referral_id, trial_started_at, trial_ends_at,
                unlimited_posting)
             VALUES (
               nextval(pg_get_serial_sequence('public.users', 'id'))::bigint,
               $1, $2, 'user', NOW(), $3, NOW(),
               NOW() + INTERVAL '30 days', FALSE
             )
             RETURNING id, username, role, referral_id,
                       trial_started_at, trial_ends_at`,
            [username, passwordHash, referralId]
          );

          const user = result.rows[0];

          res.set('Cache-Control', 'no-store');

          return res.status(201).json({
            ok: true,
            message: 'Account created. Your 30-day free trial has started. Please login.',
            username: user.username,
            role: user.role,
            referral_id: user.referral_id,
            trial_started_at: user.trial_started_at,
            trial_ends_at: user.trial_ends_at
          });
        } catch (error) {
          if (error.code === '23505') {
            if (error.constraint === 'users_username_key') {
              return res.status(409).json({
                ok: false,
                message: 'That username is already registered.'
              });
            }

            if (attempt < 2) continue;
          }

          throw error;
        }
      }

      return res.status(500).json({
        ok: false,
        message: 'Could not create a unique referral ID. Please try again.'
      });
    } catch (error) {
      console.error('[Signup]', error.message);
      return res.status(500).json({
        ok: false,
        message: 'Signup failed. Please try again.'
      });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      if (!pool) {
        return res.status(503).json({
          ok: false,
          message: 'Database is not configured.'
        });
      }

      const username = String(req.body?.username || '').trim();
      const password = String(req.body?.password || '');

      if (!username || !password || password.length > 128) {
        return res.status(400).json({
          ok: false,
          message: 'Enter a valid username and password.'
        });
      }

      const result = await pool.query(
        `SELECT id, username, password_hash, role,
                referral_id, trial_started_at, trial_ends_at,
                unlimited_posting
         FROM public.users
         WHERE username = $1
         LIMIT 1`,
        [username]
      );

      let user = result.rows[0];

      // Restore legacy environment-admin login without changing
      // an existing account's password or role.
      if (
        !user &&
        process.env.ADMIN_USERNAME &&
        process.env.ADMIN_PASSWORD &&
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
      ) {
        const passwordHash = await bcrypt.hash(password, 12);
        const referralId = newReferralId();

        try {
          const created = await pool.query(
            `INSERT INTO public.users
               (id, username, password_hash, role, created_at,
                referral_id, trial_started_at, trial_ends_at,
                unlimited_posting)
             VALUES (
               nextval(pg_get_serial_sequence('public.users', 'id'))::bigint,
               $1, $2, 'admin', NOW(), $3, NOW(),
               NOW() + INTERVAL '30 days', FALSE
             )
             RETURNING id, username, password_hash, role,
                       referral_id, trial_started_at, trial_ends_at,
                       unlimited_posting`,
            [username, passwordHash, referralId]
          );

          user = created.rows[0];
        } catch (error) {
          if (error.code !== '23505') throw error;

          const retry = await pool.query(
            `SELECT id, username, password_hash, role,
                    referral_id, trial_started_at, trial_ends_at,
                    unlimited_posting
             FROM public.users
             WHERE username = $1
             LIMIT 1`,
            [username]
          );

          user = retry.rows[0];
        }
      }

      const passwordMatches = user
        ? (
            user.role === 'admin' &&
            username === process.env.ADMIN_USERNAME &&
            password === process.env.ADMIN_PASSWORD
          ) || await bcrypt.compare(password, user.password_hash)
        : false;

      if (!passwordMatches) {
        return res.status(401).json({
          ok: false,
          message: 'Invalid username or password.'
        });
      }

      // Existing accounts with no trial dates receive their trial
      // only at their first successful login after this feature is added.
      const trialResult = await pool.query(
        `UPDATE public.users
         SET trial_started_at = NOW(),
             trial_ends_at = NOW() + INTERVAL '30 days'
         WHERE id = $1
           AND trial_started_at IS NULL
           AND trial_ends_at IS NULL
         RETURNING trial_started_at, trial_ends_at`,
        [user.id]
      );

      if (trialResult.rows.length) {
        user.trial_started_at = trialResult.rows[0].trial_started_at;
        user.trial_ends_at = trialResult.rows[0].trial_ends_at;
      } else {
        const currentTrial = await pool.query(
          `SELECT trial_started_at, trial_ends_at
           FROM public.users WHERE id = $1`,
          [user.id]
        );

        user.trial_started_at = currentTrial.rows[0]?.trial_started_at ?? null;
        user.trial_ends_at = currentTrial.rows[0]?.trial_ends_at ?? null;
      }

      const token = newToken();

      await pool.query(
        `INSERT INTO public.auth_sessions
           (user_id, token_hash, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
        [user.id, hashToken(token)]
      );

      setSessionCookie(res, token);
      res.set('Cache-Control', 'no-store');

      return res.json({
        ok: true,
        username: user.username,
        role: user.role,
        referral_id: user.referral_id,
        trial_started_at: user.trial_started_at,
        trial_ends_at: user.trial_ends_at,
        unlimited_posting: user.unlimited_posting === true
      });
    } catch (error) {
      console.error('[Login]', error.message);
      return res.status(500).json({
        ok: false,
        message: 'Login failed. Please try again.'
      });
    }
  });

  app.post('/api/logout', auth.requireAuth, async (req, res) => {
    try {
      const token = readCookie(req, 'sk_ai_session');

      if (token) {
        await pool.query(
          'DELETE FROM public.auth_sessions WHERE token_hash = $1',
          [hashToken(token)]
        );
      }

      clearSessionCookie(res);
      res.set('Cache-Control', 'no-store');

      return res.json({ ok: true, message: 'Logged out successfully.' });
    } catch (error) {
      console.error('[Logout]', error.message);
      return res.status(500).json({
        ok: false,
        message: 'Logout failed.'
      });
    }
  });

  app.get('/api/auth/me', auth.requireAuth, (req, res) => {
    const user = req.authUser;
    res.set('Cache-Control', 'no-store');

    return res.json({
      ok: true,
      username: user.username,
      role: user.role,
      referral_id: user.referral_id,
      trial_started_at: user.trial_started_at,
      trial_ends_at: user.trial_ends_at,
      unlimited_posting: user.unlimited_posting === true
    });
  });

  app.get('/api/trial/status', auth.requireAuth, (req, res) => {
    const user = req.authUser;
    const endsAt = user.trial_ends_at
      ? new Date(user.trial_ends_at)
      : null;

    const active = user.unlimited_posting === true ||
      (endsAt !== null && endsAt.getTime() > Date.now());

    res.set('Cache-Control', 'no-store');

    return res.json({
      ok: true,
      trial_started_at: user.trial_started_at,
      trial_ends_at: user.trial_ends_at,
      trial_active: active,
      unlimited_posting: user.unlimited_posting === true,
      posting_allowed: active
    });
  });
}
