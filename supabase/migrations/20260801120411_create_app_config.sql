/*
# App config table (for server-side secrets like the Groq API key)

1. New Tables
   - `app_config`: key/value store for configuration the edge functions need.
     Columns: id (text PK), value (text), created_at, updated_at.

2. Security
   - RLS enabled.
   - NO anon/authenticated policies => the anon frontend cannot read this table.
   - The edge function uses the service role key, which bypasses RLS, so it can read.
   - This keeps the Groq API key out of the browser.
*/

CREATE TABLE IF NOT EXISTS app_config (
  id text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Insert the Groq API key. Only the service role (edge functions) can read it.
INSERT INTO app_config (id, value) VALUES
  ('GROQ_API_KEY', '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')
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
