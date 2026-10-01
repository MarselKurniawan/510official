import { createMiddleware } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import {
  appSupabaseFetch,
  appSupabasePublishableKey,
  appSupabaseUrl,
} from './app-config.server';

// Same contract as the generated requireSupabaseAuth, but bound to the
// project's own Supabase instance (APP_SUPABASE_* secrets).
export const requireAppAuth = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const url = appSupabaseUrl();
  const key = appSupabasePublishableKey();

  const request = getRequest();
  const authHeader = request?.headers?.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: missing bearer token');
  }
  const token = authHeader.slice('Bearer '.length);
  if (token.split('.').length !== 3) {
    throw new Error('Unauthorized: Invalid token');
  }

  const supabase = createClient<Database>(url, key, {
    global: {
      fetch: appSupabaseFetch(key),
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    throw new Error('Unauthorized: Invalid token');
  }

  return next({
    context: { supabase, userId: data.claims.sub, claims: data.claims },
  });
});
