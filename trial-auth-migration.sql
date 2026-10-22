BEGIN;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS referral_id TEXT,
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unlimited_posting BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.auth_sessions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx
  ON public.auth_sessions(user_id);

CREATE TABLE IF NOT EXISTS public.purchase_verifications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  purchase_reference TEXT,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by BIGINT REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    NULLIF(TRIM(purchase_reference), '') IS NOT NULL
    OR NULLIF(TRIM(proof_url), '') IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS purchase_verifications_user_id_idx
  ON public.purchase_verifications(user_id);

CREATE INDEX IF NOT EXISTS purchase_verifications_status_idx
  ON public.purchase_verifications(status);

COMMIT;
