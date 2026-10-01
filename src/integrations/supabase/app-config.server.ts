// Server-side Supabase config for the project's OWN Supabase instance.
// Platform-managed SUPABASE_* vars point at Lovable Cloud, so prefer the
// APP_SUPABASE_* secrets and only fall back to the managed ones.

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

export function appSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }
    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }
    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

// The project's own Supabase instance (publishable values are safe in code).
const APP_URL = 'https://bnezwcsiscshivwlsehq.supabase.co';
const APP_PUBLISHABLE_KEY = 'sb_publishable_jRGXMxnbQqKcU6Lb-aqZqA_qvG7LdFq';
const APP_REF = 'bnezwcsiscshivwlsehq';

// Only honour the secret when it really points at this project, so a stale
// Lovable Cloud value can't desync the server from the browser client.
export function appSupabaseUrl(): string {
  const fromSecret = process.env['APP_SUPABASE_URL'];
  return fromSecret && fromSecret.includes(APP_REF) ? fromSecret : APP_URL;
}

export function appSupabasePublishableKey(): string {
  const fromSecret = process.env['APP_SUPABASE_PUBLISHABLE_KEY'];
  return fromSecret && fromSecret !== process.env['SUPABASE_PUBLISHABLE_KEY']
    ? fromSecret
    : APP_PUBLISHABLE_KEY;
}

export function appSupabaseServiceRoleKey(): string {
  const key = process.env['APP_SUPABASE_SERVICE_ROLE_KEY'];
  if (!key || key === process.env['SUPABASE_SERVICE_ROLE_KEY']) {
    throw new Error(
      'APP_SUPABASE_SERVICE_ROLE_KEY belum diisi dengan service role key project bnezwcsiscshivwlsehq.',
    );
  }
  return key;
}
