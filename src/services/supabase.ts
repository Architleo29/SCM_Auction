import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_STORAGE_URL_KEY = 'scm_supabase_url';
const SUPABASE_STORAGE_KEY_KEY = 'scm_supabase_anon_key';

// Cross-browser safe localStorage access
function safeGetItem(key: string): string {
  try {
    return typeof window !== 'undefined' && window.localStorage ? (window.localStorage.getItem(key) || '') : '';
  } catch (e) {
    return '';
  }
}

function safeSetItem(key: string, value: string) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {}
}

function safeRemoveItem(key: string) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {}
}

// Check environment variables first, then localStorage
export function getSavedSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = safeGetItem(SUPABASE_STORAGE_URL_KEY);
  const localKey = safeGetItem(SUPABASE_STORAGE_KEY_KEY);

  return {
    url: localUrl || envUrl,
    anonKey: localKey || envKey
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  safeSetItem(SUPABASE_STORAGE_URL_KEY, url.trim());
  safeSetItem(SUPABASE_STORAGE_KEY_KEY, anonKey.trim());
}

export function clearSupabaseConfig() {
  safeRemoveItem(SUPABASE_STORAGE_URL_KEY);
  safeRemoveItem(SUPABASE_STORAGE_KEY_KEY);
}

let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSavedSupabaseConfig();
  if (!url || !anonKey || url === 'https://your-project-id.supabase.co') {
    return null;
  }

  if (!supabaseClientInstance) {
    try {
      supabaseClientInstance = createClient(url, anonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseClientInstance;
}

export function resetSupabaseClient() {
  supabaseClientInstance = null;
}
