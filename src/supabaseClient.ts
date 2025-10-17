import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface Memory {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  output_type: 'image' | 'video';
  output_url: string;
  thumbnail_url: string;
  user_image_url: string;
  their_image_url: string;
  is_favorite: boolean;
  edit_settings: {
    filter: 'none' | 'sepia' | 'grayscale' | 'vintage';
    brightness: number;
    warmth: number;
    textOverlay: string;
  };
  created_at: string;
  updated_at: string;
}
