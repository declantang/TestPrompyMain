-- Add status field to competitions table
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS status TEXT;

-- Add winner_id field to competitions table
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS winner_id UUID;

-- Enable realtime for competitions table
alter publication supabase_realtime add table competitions;
