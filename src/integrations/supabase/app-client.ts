// Browser + SSR client for the project's OWN Supabase instance.
// The platform-managed .env keeps pointing at Lovable Cloud, so the URL and
// publishable key (safe to ship) are pinned here instead.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const APP_URL = "https://bnezwcsiscshivwlsehq.supabase.co";
const APP_PUBLISHABLE_KEY = "sb_publishable_jRGXMxnbQqKcU6Lb-aqZqA_qvG7LdFq";

function appFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

function create() {
  return createClient<Database>(APP_URL, APP_PUBLISHABLE_KEY, {
    global: { fetch: appFetch(APP_PUBLISHABLE_KEY) },
    auth: {
      storageKey: "sb-bnezwcsiscshivwlsehq-auth-token",
      persistSession: typeof window !== "undefined",
      autoRefreshToken: typeof window !== "undefined",
    },
  });
}

let _client: ReturnType<typeof create> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof create>, {
  get(_, prop, receiver) {
    if (!_client) _client = create();
    return Reflect.get(_client, prop, receiver);
  },
});
