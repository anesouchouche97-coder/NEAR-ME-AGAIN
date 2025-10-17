/*
  # Create Near Me Again Database Schema

  ## Overview
  This migration creates the complete database structure for the Near Me Again application,
  enabling users to save, manage, and retrieve their memory creations.

  ## New Tables

  ### `profiles`
  - `id` (uuid, primary key) - References auth.users
  - `email` (text, unique) - User's email address
  - `full_name` (text) - User's full name
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update timestamp

  ### `memories`
  - `id` (uuid, primary key) - Unique memory identifier
  - `user_id` (uuid, foreign key) - References profiles.id
  - `title` (text) - Memory title/name
  - `prompt` (text) - Description used to generate the memory
  - `output_type` (text) - Type of output: 'image' or 'video'
  - `output_url` (text) - URL to the generated content (stored in Supabase Storage)
  - `thumbnail_url` (text) - Thumbnail preview URL
  - `user_image_url` (text) - Original user photo URL
  - `their_image_url` (text) - Original loved one photo URL
  - `is_favorite` (boolean) - Whether user marked as favorite
  - `edit_settings` (jsonb) - Stores filter, brightness, warmth, text overlay settings
  - `created_at` (timestamptz) - Memory creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### `user_sessions`
  - `id` (uuid, primary key) - Session identifier
  - `user_id` (uuid, foreign key) - References profiles.id
  - `last_activity` (timestamptz) - Last activity timestamp
  - `created_at` (timestamptz) - Session start timestamp

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with the following policies:

  #### `profiles` table:
  1. Users can view their own profile
  2. Users can insert their own profile (during sign up)
  3. Users can update their own profile
  4. Users cannot delete profiles (handled by admin only)

  #### `memories` table:
  1. Users can view only their own memories
  2. Users can insert their own memories
  3. Users can update only their own memories
  4. Users can delete only their own memories

  #### `user_sessions` table:
  1. Users can view only their own sessions
  2. Users can insert their own sessions
  3. Users can update only their own sessions
  4. Users can delete only their own sessions

  ## Storage Buckets
  - `user-photos` - For uploaded user and loved one photos (private)
  - `memories` - For generated images and videos (private)
  - `thumbnails` - For memory thumbnails (private)

  ## Notes
  - All timestamps use `timestamptz` for timezone awareness
  - Foreign keys use CASCADE on delete to maintain referential integrity
  - Default values ensure data consistency
  - JSONB used for flexible edit settings storage
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text DEFAULT 'Untitled Memory' NOT NULL,
  prompt text NOT NULL,
  output_type text CHECK (output_type IN ('image', 'video')) NOT NULL,
  output_url text NOT NULL,
  thumbnail_url text DEFAULT '',
  user_image_url text DEFAULT '',
  their_image_url text DEFAULT '',
  is_favorite boolean DEFAULT false NOT NULL,
  edit_settings jsonb DEFAULT '{"filter": "none", "brightness": 100, "warmth": 0, "textOverlay": ""}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS memories_user_id_idx ON memories(user_id);
CREATE INDEX IF NOT EXISTS memories_created_at_idx ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS memories_is_favorite_idx ON memories(is_favorite) WHERE is_favorite = true;

-- Enable RLS on memories
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Memories policies
CREATE POLICY "Users can view own memories"
  ON memories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories"
  ON memories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories"
  ON memories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories"
  ON memories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  last_activity timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create index on user_id for sessions
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id);

-- Enable RLS on user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- User sessions policies
CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON user_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON user_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON user_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_memories_updated_at ON memories;
CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();