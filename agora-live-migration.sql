BEGIN;

CREATE TABLE IF NOT EXISTS public.agora_live_rooms (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  share_id TEXT NOT NULL UNIQUE,
  channel_name VARCHAR(64) NOT NULL UNIQUE,
  host_user_id BIGINT NOT NULL
    REFERENCES public.users(id) ON DELETE CASCADE,
  host_username TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'ended')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS agora_live_rooms_status_started_idx
  ON public.agora_live_rooms (status, started_at DESC);

CREATE INDEX IF NOT EXISTS agora_live_rooms_host_idx
  ON public.agora_live_rooms (host_user_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS agora_live_one_active_per_host_idx
  ON public.agora_live_rooms (host_user_id)
  WHERE status = 'active';

COMMIT;
