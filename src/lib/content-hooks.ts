import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/app-client";
import { getBandsintownEvents } from "@/lib/bandsintown.functions";

const ORDER = { column: "sort_order", ascending: true } as const;

export function useMusicTracks() {
  return useQuery({
    queryKey: ["public", "music"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("music")
        .select("id,title,youtube_url,sort_order,is_active")
        .eq("is_active", true)
        .order(ORDER.column, { ascending: ORDER.ascending });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMusicBackgrounds() {
  return useQuery({
    queryKey: ["public", "music_backgrounds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("music_backgrounds")
        .select("id,image_url,sort_order")
        .order(ORDER.column, { ascending: ORDER.ascending });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTourDates() {
  return useQuery({
    queryKey: ["public", "tour_dates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tour_dates")
        .select("id,event_date,city,venue,event_name,ticket_url,status,sort_order")
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useGalleryShots() {
  return useQuery({
    queryKey: ["public", "gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("id,image_url,caption,sort_order")
        .order(ORDER.column, { ascending: ORDER.ascending });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePressItems() {
  return useQuery({
    queryKey: ["public", "press"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press")
        .select("id,title,published_date,excerpt,image_url,body,sort_order")
        .order(ORDER.column, { ascending: ORDER.ascending });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useContactEmails() {
  return useQuery({
    queryKey: ["public", "contact_emails"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_emails")
        .select("id,label,email,sort_order")
        .order(ORDER.column, { ascending: ORDER.ascending });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSocialLinks() {
  return useQuery({
    queryKey: ["public", "social_links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("id,platform,url,sort_order")
        .order(ORDER.column, { ascending: ORDER.ascending });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMerchItems() {
  return useQuery({
    queryKey: ["public", "merch"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("merch")
        .select(
          "id,name_en,name_id,price,url,badge,in_stock,sort_order,merch_images(id,image_url,sort_order)",
        )
        .order(ORDER.column, { ascending: ORDER.ascending });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["public", "site_settings"],
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("ga_measurement_id,gsc_verification_token,bandsintown_artist")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data ?? {
        ga_measurement_id: null,
        gsc_verification_token: null,
        bandsintown_artist: null,
      }) as {
        ga_measurement_id: string | null;
        gsc_verification_token: string | null;
        bandsintown_artist: string | null;
      };
    },
  });
}

export function useBandsintownEvents() {
  const { data: settings } = useSiteSettings();
  const artist = settings?.bandsintown_artist ?? "";
  return useQuery({
    queryKey: ["public", "bandsintown", artist],
    enabled: !!artist,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => getBandsintownEvents({ data: { artist } }),
  });
}




// Extract YouTube video id from any common URL shape
export function extractYoutubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([A-Za-z0-9_-]{11})/
  );
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url;
  return null;
}

// Format a YYYY-MM-DD date as "12 SEP 2026"
export function formatEventDate(d: string | null | undefined): string {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  const day = String(dt.getUTCDate()).padStart(2, "0");
  const mon = dt.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
  const yr = dt.getUTCFullYear();
  return `${day} ${mon} ${yr}`;
}


export function useContactPhones() {
  return useQuery({
    queryKey: ["public", "contact_phones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_phones")
        .select("id,label,phone,is_whatsapp,sort_order")
        .order(ORDER.column, { ascending: ORDER.ascending });
      if (error) throw error;
      return data ?? [];
    },
  });
}
