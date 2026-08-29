import { createClient } from '@supabase/supabase-js';
import { ENV } from '../../config/env';

// Initialize the Supabase client
export const supabase = createClient(
  ENV.SUPABASE_URL || 'https://placeholder-project.supabase.co',
  ENV.SUPABASE_ANON_KEY || 'placeholder-anon-key'
);

export const isSupabaseConfigured = ENV.IS_CONFIGURED;
