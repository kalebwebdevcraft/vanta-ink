import { createClient } from '@supabase/supabase-js';

// These two values come from your .env file (see the setup steps).
// The publishable key is safe in the browser: Row Level Security in the
// database decides what visitors can and cannot do.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;
export const hasBackend = Boolean(supabase);