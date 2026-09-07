import { createClient } from '@supabase/supabase-js';
import { ENV } from '../../config/env';

// Initialize the Supabase client
export const supabase = createClient(
  ENV.SUPABASE_URL || 'https://ylwndikdsjqinmxxgcsn.supabase.co',
  ENV.SUPABASE_ANON_KEY || 'sb_publishable_yIbGv5AVb3z6Jyf72lPx4Q_g7yicFNn'
);

export const isSupabaseConfigured = ENV.IS_CONFIGURED;
