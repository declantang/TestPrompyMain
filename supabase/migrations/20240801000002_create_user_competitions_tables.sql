-- Create saved_competitions table to track competitions saved by users
CREATE TABLE IF NOT EXISTS saved_competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, competition_id)
);

-- Create competition_participants table to track user participation in competitions
CREATE TABLE IF NOT EXISTS competition_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, submitted, reviewing, completed
  submission_data JSONB,
  progress INTEGER DEFAULT 0,
  result VARCHAR(50), -- winner, runner-up, participant, disqualified
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, competition_id)
);

-- Create user_achievements table to track user achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) NOT NULL,
  progress INTEGER DEFAULT 0,
  unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Add RLS policies
ALTER TABLE saved_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Saved competitions policies
DROP POLICY IF EXISTS "Users can view their own saved competitions" ON saved_competitions;
CREATE POLICY "Users can view their own saved competitions"
  ON saved_competitions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own saved competitions" ON saved_competitions;
CREATE POLICY "Users can insert their own saved competitions"
  ON saved_competitions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved competitions" ON saved_competitions;
CREATE POLICY "Users can delete their own saved competitions"
  ON saved_competitions FOR DELETE
  USING (auth.uid() = user_id);

-- Competition participants policies
DROP POLICY IF EXISTS "Users can view their own participations" ON competition_participants;
CREATE POLICY "Users can view their own participations"
  ON competition_participants FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own participations" ON competition_participants;
CREATE POLICY "Users can insert their own participations"
  ON competition_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own participations" ON competition_participants;
CREATE POLICY "Users can update their own participations"
  ON competition_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- User achievements policies
DROP POLICY IF EXISTS "Users can view their own achievements" ON user_achievements;
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- Enable realtime for all tables
alter publication supabase_realtime add table saved_competitions;
alter publication supabase_realtime add table competition_participants;
alter publication supabase_realtime add table user_achievements;