const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Explicitly load .env from backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_SECRET_KEY;

// Check if credentials exist and are not default placeholder strings
const isConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.trim() !== '' &&
    supabaseAnonKey.trim() !== '' &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your_supabase_anon_key')
);

let supabase = null;
const inMemorySessions = [];

if (isConfigured) {
  try {
    supabase = createClient(supabaseUrl.trim(), supabaseAnonKey.trim(), {
      auth: { persistSession: false },
    });
    console.log(`[GapLens Database] Supabase client initialized for: ${supabaseUrl}`);
  } catch (error) {
    console.warn(
      `[GapLens Database Warning] Failed to initialize Supabase client (${error.message}). Using In-Memory Fallback Store.`
    );
    supabase = null;
  }
} else {
  console.log('Supabase credentials not found — using In-Memory Fallback Store');
}

const isSupabaseConfigured = Boolean(supabase);

module.exports = {
  supabase,
  isSupabaseConfigured,
  inMemorySessions,
};
