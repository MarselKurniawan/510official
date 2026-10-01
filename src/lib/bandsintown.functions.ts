import { createServerFn } from "@tanstack/react-start";

export type BitEvent = {
  id: string;
  event_date: string;
  city: string;
  venue: string;
  event_name: string;
  ticket_url: string | null;
  status: "available" | "low" | "sold_out";
};

export const getBandsintownEvents = createServerFn({ method: "GET" })
  .inputValidator((input: { artist?: string | null }) => ({
    artist: typeof input?.artist === "string" ? input.artist.trim().slice(0, 120) : "",
  }))
  .handler(async ({ data }): Promise<BitEvent[]> => {
    const appId = process.env["BANDSINTOWN_APP_ID"];
    if (!appId || !data.artist) return [];

    // Accept "123456", "id_123456", "123456-name" or a plain artist name
    const raw = data.artist;
    const numeric = raw.match(/^(?:id_)?(\d{4,})(?:-.*)?$/);
    const artistPath = numeric ? `id_${numeric[1]}` : raw;

    const url = `https://rest.bandsintown.com/artists/${encodeURIComponent(
      artistPath,
    )}/events?app_id=${encodeURIComponent(appId)}&date=upcoming`;


    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) return [];
      const json: unknown = await res.json();
      if (!Array.isArray(json)) return [];

      return json.slice(0, 50).map((raw): BitEvent => {
        const e = raw as Record<string, any>;
        const venue = (e["venue"] ?? {}) as Record<string, any>;
        const offers = Array.isArray(e["offers"]) ? e["offers"] : [];
        const ticket = offers.find((o: any) => o?.type === "Tickets") ?? offers[0];
        const soldOut = String(ticket?.status ?? "").toLowerCase() === "sold out";
        return {
          id: String(e["id"] ?? e["url"] ?? Math.random()),
          event_date: String(e["datetime"] ?? "").slice(0, 10),
          city: [venue["city"], venue["country"]].filter(Boolean).join(", "),
          venue: String(venue["name"] ?? ""),
          event_name: String(e["title"] ?? ""),
          ticket_url: (ticket?.url as string) ?? (e["url"] as string) ?? null,
          status: soldOut ? "sold_out" : "available",
        };
      });
    } catch {
      return [];
    }
  });
