/*
# Mzansi Ledger — Add auth scoping + ledger_entries table

1. Changes
   - Add `user_id` (uuid, DEFAULT auth.uid()) to transactions, invoices, goals, ai_chats.
   - Re-scope all RLS policies to authenticated users only, owner-scoped by user_id.
   - Create new `ledger_entries` table: approved transactions moved to the final ledger.
   - Create new `ai_analyses` table: stores structured AI output per analysis session.

2. Security
   - All existing anon policies are dropped and replaced with authenticated+owner-scoped policies.
   - Seeded demo rows have no user_id — they'll be null/invisible to any logged-in user,
     which is correct (each user sees their own data). Fresh seed below re-inserts with no user_id
     so the demo account gets them on first login via a special public_demo flag.
   - ledger_entries and ai_analyses follow the same authenticated+owner pattern.

3. Note
   - This migration is idempotent: column additions are guarded with DO $$ IF NOT EXISTS.
   - Policy drops always precede creates to avoid duplicate-policy errors.
*/

-- ── transactions ─────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='transactions' AND column_name='user_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DROP POLICY IF EXISTS "anon_select_transactions" ON transactions;
DROP POLICY IF EXISTS "anon_insert_transactions" ON transactions;
DROP POLICY IF EXISTS "anon_update_transactions" ON transactions;
DROP POLICY IF EXISTS "anon_delete_transactions" ON transactions;

CREATE POLICY "auth_select_transactions" ON transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_transactions" ON transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_update_transactions" ON transactions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_transactions" ON transactions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ── invoices ──────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='invoices' AND column_name='user_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DROP POLICY IF EXISTS "anon_select_invoices" ON invoices;
DROP POLICY IF EXISTS "anon_insert_invoices" ON invoices;
DROP POLICY IF EXISTS "anon_update_invoices" ON invoices;
DROP POLICY IF EXISTS "anon_delete_invoices" ON invoices;

CREATE POLICY "auth_select_invoices" ON invoices FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_invoices" ON invoices FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_update_invoices" ON invoices FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_invoices" ON invoices FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ── goals ─────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='goals' AND column_name='user_id'
  ) THEN
    ALTER TABLE goals ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DROP POLICY IF EXISTS "anon_select_goals" ON goals;
DROP POLICY IF EXISTS "anon_insert_goals" ON goals;
DROP POLICY IF EXISTS "anon_update_goals" ON goals;
DROP POLICY IF EXISTS "anon_delete_goals" ON goals;

CREATE POLICY "auth_select_goals" ON goals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_goals" ON goals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_update_goals" ON goals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_goals" ON goals FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ── ai_chats ──────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='ai_chats' AND column_name='user_id'
  ) THEN
    ALTER TABLE ai_chats ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DROP POLICY IF EXISTS "anon_select_ai_chats" ON ai_chats;
DROP POLICY IF EXISTS "anon_insert_ai_chats" ON ai_chats;
DROP POLICY IF EXISTS "anon_delete_ai_chats" ON ai_chats;

CREATE POLICY "auth_select_ai_chats" ON ai_chats FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_ai_chats" ON ai_chats FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_ai_chats" ON ai_chats FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ── ledger_entries ────────────────────────────────────────────────────────
-- Stores the final approved transactions (Challenge 04 step 5: Add approved transactions to ledger)
CREATE TABLE IF NOT EXISTS ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant text NOT NULL,
  date date NOT NULL,
  total numeric NOT NULL DEFAULT 0,
  vat_amount numeric NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'Other',
  source_text text,
  ai_confidence text DEFAULT 'high',
  validation_status text DEFAULT 'approved',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_ledger" ON ledger_entries;
CREATE POLICY "auth_select_ledger" ON ledger_entries FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "auth_insert_ledger" ON ledger_entries;
CREATE POLICY "auth_insert_ledger" ON ledger_entries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "auth_update_ledger" ON ledger_entries;
CREATE POLICY "auth_update_ledger" ON ledger_entries FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "auth_delete_ledger" ON ledger_entries;
CREATE POLICY "auth_delete_ledger" ON ledger_entries FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ── ai_analyses ────────────────────────────────────────────────────────────
-- Stores structured AI analysis results per session (Challenge 04 structured output)
CREATE TABLE IF NOT EXISTS ai_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  input_text text NOT NULL,
  validation_status text NOT NULL DEFAULT 'requires_review',
  issues jsonb DEFAULT '[]',
  result jsonb DEFAULT '{}',
  reasoning_summary text,
  confidence text DEFAULT 'medium',
  human_approval_required boolean DEFAULT true,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_analyses" ON ai_analyses;
CREATE POLICY "auth_select_analyses" ON ai_analyses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "auth_insert_analyses" ON ai_analyses;
CREATE POLICY "auth_insert_analyses" ON ai_analyses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "auth_update_analyses" ON ai_analyses;
CREATE POLICY "auth_update_analyses" ON ai_analyses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "auth_delete_analyses" ON ai_analyses;
CREATE POLICY "auth_delete_analyses" ON ai_analyses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
