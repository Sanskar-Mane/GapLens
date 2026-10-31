-- ====================================================================
-- GapLens: Supabase Row Level Security (RLS) & User Data Isolation
-- Shinchan Online Hackathon 2026 - Problem Statement: Digital Dark Spot
-- ====================================================================

-- 1. Ensure user_id column exists and references auth.users
ALTER TABLE research_sessions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Create index on user_id for high-performance scoped lookups
CREATE INDEX IF NOT EXISTS idx_research_sessions_user_id ON research_sessions(user_id);

-- 3. Enable Row Level Security on research_sessions
ALTER TABLE research_sessions ENABLE ROW LEVEL SECURITY;

-- 4. SELECT Policy: Users can only read their own sessions
DROP POLICY IF EXISTS "Users can only view their own sessions" ON research_sessions;
CREATE POLICY "Users can only view their own sessions"
ON research_sessions FOR SELECT
USING (auth.uid() = user_id);

-- 5. INSERT Policy: Users can only insert rows linked to their own uid
DROP POLICY IF EXISTS "Users can only insert their own sessions" ON research_sessions;
CREATE POLICY "Users can only insert their own sessions"
ON research_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 6. UPDATE Policy: Users can only update their own sessions
DROP POLICY IF EXISTS "Users can only update their own sessions" ON research_sessions;
CREATE POLICY "Users can only update their own sessions"
ON research_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- 7. DELETE Policy: Users can only delete their own sessions
DROP POLICY IF EXISTS "Users can only delete their own sessions" ON research_sessions;
CREATE POLICY "Users can only delete their own sessions"
ON research_sessions FOR DELETE
USING (auth.uid() = user_id);

