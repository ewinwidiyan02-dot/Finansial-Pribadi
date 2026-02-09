-- Enable RLS on all tables to be safe/consistent
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for public access (since no auth is implemented yet)
-- Note: 'IF NOT EXISTS' is not supported for policies in all Postgres versions directly like tables, 
-- but these commands will fail safely if policies exist or you can drop them first.

DROP POLICY IF EXISTS "Public Access Wallets" ON wallets;
CREATE POLICY "Public Access Wallets" ON wallets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access Categories" ON categories;
CREATE POLICY "Public Access Categories" ON categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access Transactions" ON transactions;
CREATE POLICY "Public Access Transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
