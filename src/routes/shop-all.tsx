import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LanguageProvider, useLang } from "@/lib/i18n";
import { MERCH, type MerchItem } from "@/data/merch";
import { MerchCard } from "@/components/MerchCard";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SectionFX } from "@/components/SectionFX";
import { useMerchItems } from "@/lib/content-hooks";
import { resolveMediaUrl } from "@/lib/admin-upload";
import logoAsset from "@/assets/logo.png.asset.json";
import esaOrange from "@/assets/esa-orange.webp.asset.json";

export const Route = createFileRoute("/shop-all")({
  head: () => ({
    meta: [
      { title: "Shop All — 510 Official Merch" },
      { name: "description", content: "Every piece of official 510 merch — tees, hoodies, vinyl, cassettes, posters, pins. Ships worldwide." },
      { property: "og:title", content: "Shop All — 510" },
      { property: "og:description", content: "Every piece of official 510 merch." },
      { property: "og:url", content: "/shop-all" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/shop-all" }],
  }),
  component: () => (
    <LanguageProvider>
      <ShopAllPage />
    </LanguageProvider>
  ),
});

const T = {
  eyebrow: { EN: "Official Store — 001", ID: "Toko Resmi — 001" },
  title: { EN: "EVERY / THING.", ID: "SEMUA / NYA." },
  intro: {
    EN: "Full catalog. Recorded, printed, pressed and shipped by us. No middlemen.",
    ID: "Katalog lengkap. Direkam, dicetak, dipress, dan dikirim oleh kami. Tanpa perantara.",
  },
  back: { EN: "← Home", ID: "← Beranda" },
  count: { EN: "items", ID: "produk" },
  ship: { EN: "Ships worldwide from Bandung, Indonesia.", ID: "Kirim ke seluruh dunia dari Bandung, Indonesia." },
} as const;

function MerchDBItem({ row, i }: { row: any; i: number }) {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    const refs = ((row.merch_images ?? []) as { image_url: string; sort_order: number }[])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((x) => x.image_url);
    let cancel = false;
    Promise.all(refs.map((r) => resolveMediaUrl(r))).then((res) => {
      if (!cancel) setUrls(res.filter((x): x is string => !!x));
    });
    return () => { cancel = true; };
  }, [row]);
  if (urls.length === 0) return null;
  const item: MerchItem = {
    name: { EN: row.name_en, ID: row.name_id },
    price: row.price,
    url: row.url ?? "#",
    images: urls,
    in_stock: row.in_stock,
    badge: (row.badge ?? undefined) as MerchItem["badge"],
  };
  return <MerchCard item={item} i={i} />;
}

function ShopAllPage() {
  const { lang } = useLang();
  const { data: dbMerch } = useMerchItems();
  const dbHasImages = (dbMerch ?? []).some(
    (r: any) => Array.isArray(r.merch_images) && r.merch_images.length > 0,
  );
  const total = dbHasImages ? (dbMerch as any[]).length : MERCH.length;

  return (
    <>
      <SmoothScroll />
      <div className="min-h-screen bg-bone text-neutral-950">
        {/* Top bar */}
        <header className="sticky top-0 z-50 border-b border-neutral-950/10 bg-bone/85 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between px-5 md:px-10">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoAsset.url} alt="510" className="h-6 w-6" />
              <span className="text-display text-lg tracking-tight">510</span>
            </Link>
            <Link to="/" className="text-[10px] uppercase tracking-[0.3em] text-neutral-600 hover:text-neutral-950">
              {T.back[lang]}
            </Link>
          </div>
        </header>

        {/* Hero — editorial masthead */}
        <section className="relative overflow-hidden border-b border-neutral-950/10">
          <SectionFX logoOpacity={0.04} grainOpacity={0.12} invertLogo={false} />

          {/* Offset photo */}
          <div className="pointer-events-none absolute -right-16 -top-8 hidden w-[42%] md:block">
            <img
              src={esaOrange.url}
              alt=""
              className="h-auto w-full mix-blend-multiply grayscale opacity-80"
              loading="lazy"
            />
          </div>

          <div className="relative z-10 mx-auto max-w-[1800px] px-5 pb-16 pt-16 md:px-10 md:pb-24 md:pt-28">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              <span>— {T.eyebrow[lang]}</span>
              <span className="tabular-nums">{String(total).padStart(2, "0")} {T.count[lang]}</span>
            </div>

            <h1 className="text-display mt-8 text-[16vw] leading-[0.85] md:text-[13rem]">
              {T.title[lang]}
            </h1>

            <div className="mt-10 grid gap-6 border-t border-neutral-950/15 pt-6 md:grid-cols-[1fr_auto] md:items-end md:gap-16">
              <p className="max-w-xl text-lg text-neutral-700 md:text-xl">{T.intro[lang]}</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                {T.ship[lang]}
              </p>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-[1800px] px-5 py-14 md:px-10 md:py-24">
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:grid-cols-4">
              {dbHasImages
                ? (dbMerch as any[]).map((r, i) => <MerchDBItem key={r.id} row={r} i={i} />)
                : MERCH.map((m, i) => <MerchCard key={m.name.EN} item={m} i={i} />)}
            </div>
          </div>
        </section>

        <footer className="border-t border-neutral-950/10 py-8 text-center text-[10px] uppercase tracking-[0.3em] text-neutral-500">
          © {new Date().getFullYear()} — 510 · Bandung · 6°54'S 07°36'E
        </footer>
      </div>
    </>
  );
}
