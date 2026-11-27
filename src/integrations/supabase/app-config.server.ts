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

// Now bound to Lovable Cloud via the platform-managed SUPABASE_* vars.
export function appSupabaseUrl(): string {
  return process.env['SUPABASE_URL']!;
}

export function appSupabasePublishableKey(): string {
  return process.env['SUPABASE_PUBLISHABLE_KEY']!;
}

export function appSupabaseServiceRoleKey(): string {
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing.');
  return key;
}
