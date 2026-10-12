const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const url = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
 
export const supabase = url && key ? createClient(url, key) : null;
export const hasBackend = Boolean(supabase);
 
