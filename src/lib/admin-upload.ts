import { supabase } from "@/integrations/supabase/app-client";
import { compressImage } from "./image-compress";

export type MediaBucket = "gallery" | "music-bg" | "press" | "merch";

const SIGNED_URL_TTL = 60 * 60 * 24 * 365; // 1 year

export async function uploadMedia(bucket: MediaBucket, file: File): Promise<string> {
  const compressed = await compressImage(file);
  const ext = compressed.name.split(".").pop() ?? "bin";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, compressed, {
    cacheControl: "31536000",
    upsert: false,
    contentType: compressed.type,
  });
  if (error) throw error;
  return `${bucket}/${path}`;
}

const CACHE_KEY = "media-url-cache-v1";
const memCache = new Map<string, { url: string; exp: number }>();

function loadCache() {
  if (typeof window === "undefined" || memCache.size) return;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, { url: string; exp: number }>;
    const now = Date.now();
    for (const [k, v] of Object.entries(parsed)) if (v.exp > now) memCache.set(k, v);
  } catch {
    /* ignore */
  }
}

function persistCache() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(memCache)));
  } catch {
    /* ignore */
  }
}

/** True when a stored reference lives on the free CDN (zero Cloud egress). */
export function isCdnRef(ref: string | null | undefined): boolean {
  if (!ref) return false;
  return ref.startsWith("/") || /^https?:\/\//i.test(ref);
}

// Cache signed URLs for ~11 months (signature is valid for 1 year)
const CACHE_TTL = 1000 * 60 * 60 * 24 * 330;

type Pending = {
  refs: Map<string, { resolve: (v: string | null) => void }[]>;
  timer: ReturnType<typeof setTimeout> | null;
};
const pendingByBucket = new Map<string, Pending>();

function flush(bucket: string) {
  const pending = pendingByBucket.get(bucket);
  if (!pending) return;
  pendingByBucket.delete(bucket);
  if (pending.timer) clearTimeout(pending.timer);

  const refs = [...pending.refs.keys()];
  const paths = refs.map((r) => r.slice(bucket.length + 1));

  void (async () => {
    let urls: (string | null)[] = [];
    try {
      const { data } = await supabase.storage.from(bucket).createSignedUrls(paths, SIGNED_URL_TTL);
      urls = paths.map((p) => data?.find((d) => d.path === p)?.signedUrl ?? null);
    } catch {
      urls = paths.map(() => null);
    }
    let changed = false;
    refs.forEach((ref, i) => {
      const url = urls[i] ?? null;
      if (url) {
        memCache.set(ref, { url, exp: Date.now() + CACHE_TTL });
        changed = true;
      }
      for (const waiter of pending.refs.get(ref) ?? []) waiter.resolve(url);
    });
    if (changed) persistCache();
  })();
}

/**
 * Convert a stored `bucket/path` reference to a signed URL for display.
 * Requests made in the same tick are batched into a single signing call per
 * bucket, and results are cached (memory + localStorage) so repeat renders and
 * later visits never hit Cloud again. Absolute/CDN refs pass straight through.
 */
export function resolveMediaUrl(ref: string | null | undefined): Promise<string | null> {
  if (!ref) return Promise.resolve(null);
  // Already a URL or CDN-hosted asset (zero Cloud egress) — use as-is
  if (isCdnRef(ref)) return Promise.resolve(ref);
  loadCache();
  const hit = memCache.get(ref);
  if (hit && hit.exp > Date.now()) return Promise.resolve(hit.url);

  const slash = ref.indexOf("/");
  if (slash <= 0 || slash === ref.length - 1) return Promise.resolve(null);
  const bucket = ref.slice(0, slash);

  return new Promise<string | null>((resolve) => {
    let pending = pendingByBucket.get(bucket);
    if (!pending) {
      pending = { refs: new Map(), timer: null };
      pendingByBucket.set(bucket, pending);
      pending.timer = setTimeout(() => flush(bucket), 16);
    }
    const waiters = pending.refs.get(ref);
    if (waiters) waiters.push({ resolve });
    else pending.refs.set(ref, [{ resolve }]);
  });
}


export async function deleteMedia(ref: string | null | undefined): Promise<void> {
  if (!ref || /^https?:\/\//i.test(ref)) return;
  const [bucket, ...rest] = ref.split("/");
  const path = rest.join("/");
  if (!bucket || !path) return;
  await supabase.storage.from(bucket as MediaBucket).remove([path]);
}
