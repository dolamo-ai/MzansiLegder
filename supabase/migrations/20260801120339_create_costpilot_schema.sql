/*
# CostPilot AI — core schema

1. Purpose
   Single-tenant financial dashboard. No sign-in screen, so the anon-key frontend
   must be able to read and write its own data. All tables are intentionally shared
   (one workspace), hence `TO anon, authenticated` with `USING (true)`.

2. New Tables
   - `transactions`: AI-extracted expenses/income rows from receipts, invoices, CSV.
     Columns: id, vendor, date, amount, vat, category, status, source, confidence,
     duplicate_of, notes, created_at.
   - `invoices`: vendor invoices tracked for payment.
     Columns: id, vendor, date, amount, status, due, created_at.
   - `goals`: spending/savings targets.
     Columns: id, name, target, current, deadline, category, created_at.
   - `ai_chats`: stored copilot conversations (role + content) for history.
     Columns: id, role, content, created_at.

3. Security
   - RLS enabled on every table.
   - Policies allow anon + authenticated full CRUD (intentionally shared workspace).
*/

CREATE TABLE IF NOT EXISTS transactions (
  id text PRIMARY KEY,
  vendor text NOT NULL,
  date date NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  vat numeric NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'Software',
  status text NOT NULL DEFAULT 'pending',
  source text NOT NULL DEFAULT 'manual',
  confidence numeric NOT NULL DEFAULT 1.0,
  duplicate_of text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_transactions" ON transactions;
CREATE POLICY "anon_select_transactions" ON transactions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_transactions" ON transactions;
CREATE POLICY "anon_insert_transactions" ON transactions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_transactions" ON transactions;
CREATE POLICY "anon_update_transactions" ON transactions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_transactions" ON transactions;
CREATE POLICY "anon_delete_transactions" ON transactions FOR DELETE
  TO anon, authenticated USING (true);


CREATE TABLE IF NOT EXISTS invoices (
  id text PRIMARY KEY,
  vendor text NOT NULL,
  date date NOT NULL DEFAULT now(),
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  due date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_invoices" ON invoices;
CREATE POLICY "anon_select_invoices" ON invoices FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_invoices" ON invoices;
CREATE POLICY "anon_insert_invoices" ON invoices FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_invoices" ON invoices;
CREATE POLICY "anon_update_invoices" ON invoices FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_invoices" ON invoices;
CREATE POLICY "anon_delete_invoices" ON invoices FOR DELETE
  TO anon, authenticated USING (true);


CREATE TABLE IF NOT EXISTS goals (
  id text PRIMARY KEY,
  name text NOT NULL,
  target numeric NOT NULL DEFAULT 0,
  current numeric NOT NULL DEFAULT 0,
  deadline date,
  category text NOT NULL DEFAULT 'Software',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_goals" ON goals;
CREATE POLICY "anon_select_goals" ON goals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_goals" ON goals;
CREATE POLICY "anon_insert_goals" ON goals FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_goals" ON goals;
CREATE POLICY "anon_update_goals" ON goals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_goals" ON goals;
CREATE POLICY "anon_delete_goals" ON goals FOR DELETE
  TO anon, authenticated USING (true);


CREATE TABLE IF NOT EXISTS ai_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ai_chats" ON ai_chats;
CREATE POLICY "anon_select_ai_chats" ON ai_chats FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_ai_chats" ON ai_chats;
CREATE POLICY "anon_insert_ai_chats" ON ai_chats FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_ai_chats" ON ai_chats;
CREATE POLICY "anon_delete_ai_chats" ON ai_chats FOR DELETE
  TO anon, authenticated USING (true);


-- Seed sample data so the app is populated on first load
INSERT INTO transactions (id, vendor, date, amount, vat, category, status, source, confidence, duplicate_of) VALUES
  ('TX-10421','Figma, Inc.','2026-07-29',2400,480,'Software','reviewed','invoice',0.98,NULL),
  ('TX-10422','WeWork','2026-07-28',3200,640,'Office','reviewed','invoice',0.95,NULL),
  ('TX-10423','Google Ads','2026-07-27',1850,370,'Marketing','pending','csv',0.82,NULL),
  ('TX-10424','United Airlines','2026-07-26',1240,248,'Travel','flagged','receipt',0.71,NULL),
  ('TX-10425','AWS','2026-07-25',4120,824,'Software','reviewed','invoice',0.99,NULL),
  ('TX-10426','Staples','2026-07-24',320,64,'Office','pending','receipt',0.88,NULL),
  ('TX-10427','Google Ads','2026-07-24',1850,370,'Marketing','duplicate','csv',0.9,'TX-10423'),
  ('TX-10428','Pacific Gas & Electric','2026-07-23',640,128,'Utilities','reviewed','invoice',0.96,NULL),
  ('TX-10429','Gusto','2026-07-22',12800,0,'Payroll','reviewed','invoice',0.99,NULL),
  ('TX-10430','Cooley LLP','2026-07-21',4500,900,'Legal','pending','invoice',0.84,NULL),
  ('TX-10431','Dell Technologies','2026-07-20',3200,640,'Hardware','reviewed','invoice',0.97,NULL),
  ('TX-10432','Slack','2026-07-19',720,144,'Software','reviewed','invoice',0.98,NULL),
  ('TX-10433','Lyft Business','2026-07-18',210,42,'Travel','flagged','receipt',0.66,NULL),
  ('TX-10434','Notion Labs','2026-07-17',960,192,'Software','reviewed','invoice',0.97,NULL),
  ('TX-10435','HubSpot','2026-07-16',3600,720,'Marketing','pending','invoice',0.89,NULL),
  ('TX-10436','Verizon Business','2026-07-15',410,82,'Utilities','reviewed','invoice',0.95,NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO invoices (id, vendor, date, amount, status, due) VALUES
  ('INV-10421','Figma, Inc.','2026-07-29',2400,'reviewed','2026-08-15'),
  ('INV-10422','WeWork','2026-07-28',3200,'reviewed','2026-08-15'),
  ('INV-10425','AWS','2026-07-25',4120,'reviewed','2026-08-15'),
  ('INV-10429','Gusto','2026-07-22',12800,'reviewed','2026-08-15'),
  ('INV-10430','Cooley LLP','2026-07-21',4500,'pending','2026-08-15'),
  ('INV-10431','Dell Technologies','2026-07-20',3200,'reviewed','2026-08-15'),
  ('INV-10432','Slack','2026-07-19',720,'reviewed','2026-08-15'),
  ('INV-10434','Notion Labs','2026-07-17',960,'reviewed','2026-08-15'),
  ('INV-10435','HubSpot','2026-07-16',3600,'pending','2026-08-15'),
  ('INV-10436','Verizon Business','2026-07-15',410,'reviewed','2026-08-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO goals (id, name, target, current, deadline, category) VALUES
  ('G1','Reduce software spend',40000,38400,'2026-12-31','Software'),
  ('G2','Keep travel under budget',8000,6400,'2026-12-31','Travel'),
  ('G3','Marketing cap',20000,21600,'2026-12-31','Marketing')
ON CONFLICT (id) DO NOTHING;
