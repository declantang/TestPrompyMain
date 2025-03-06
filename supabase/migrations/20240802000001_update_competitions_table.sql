-- Add status and winner_id columns to competitions table
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS winner_id TEXT;

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for submissions
alter publication supabase_realtime add table submissions;
