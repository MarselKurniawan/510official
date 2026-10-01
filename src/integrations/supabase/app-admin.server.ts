import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import {
  appSupabaseFetch,
  appSupabaseServiceRoleKey,
  appSupabaseUrl,
} from './app-config.server';

// Service-role client for the project's OWN Supabase instance.
export function createAppAdminClient() {
  const key = appSupabaseServiceRoleKey();
  return createClient<Database>(appSupabaseUrl(), key, {
    global: { fetch: appSupabaseFetch(key) },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}
