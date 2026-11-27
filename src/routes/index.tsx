import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { Phone } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import {
  ESA_ORANGE_URL,
  HERO_VIDEO_URL,
  KICK_WHITE_URL,
  LOGO_URL,
  SAEMEN_LIVE_VIDEO_URL,
} from "@/lib/media";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CometCursor } from "@/components/CometCursor";
import { MusicBackdrop } from "@/components/MusicBackdrop";
import { SectionFX } from "@/components/SectionFX";
import { Reveal } from "@/components/Reveal";
import { LanguageProvider, useLang, type Lang } from "@/lib/i18n";
import { type MerchItem } from "@/data/merch";
import { MerchCard } from "@/components/MerchCard";
import { resolveMediaUrl } from "@/lib/admin-upload";
import { ResolvedImg } from "@/components/ResolvedImg";
import {
  useMusicTracks,
  useMusicBackgrounds,
  useTourDates,
  useBandsintownEvents,
  useGalleryShots,
  usePressItems,
  useContactEmails,
  useContactPhones,
  useSocialLinks,
  useMerchItems,
  extractYoutubeId,
  formatEventDate,
} from "@/lib/content-hooks";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "510 — Official Site | Squad 510" },
      { name: "description", content: "510 official website. Stream music, see 510 tour dates, shop 510 merch, gallery and press." },
      { property: "og:title", content: "510 — Official Site | Squad 510" },
      { property: "og:description", content: "510 official website. Stream music, see 510 tour dates, shop 510 merch, gallery and press." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: () => (
    <LanguageProvider>
      <Home />
    </LanguageProvider>
  ),
});

const NAV: { key: string; label: Record<Lang, string>; href: string }[] = [
  { key: "music", label: { EN: "Music", ID: "Musik" }, href: "#music" },
  { key: "tour", label: { EN: "Tour", ID: "Tur" }, href: "#tour" },
  { key: "merch", label: { EN: "Merch", ID: "Merch" }, href: "#merch" },
  { key: "gallery", label: { EN: "Gallery", ID: "Galeri" }, href: "#gallery" },
  { key: "press", label: { EN: "Press", ID: "Pers" }, href: "#press" },
  { key: "contact", label: { EN: "Contact", ID: "Kontak" }, href: "#contact" },
];




// ---- Copy dictionary ----
const COPY = {
  tickets: { EN: "Tickets", ID: "Tiket" },
  soldOut: { EN: "Sold Out", ID: "Habis" },
  coordCap: { EN: "Coordinates of origin", ID: "Koordinat asal" },
  listen: { EN: "Listen — Latest Release", ID: "Dengar — Rilisan Terbaru" },
  section: {
    music: { EN: "Music", ID: "Musik" },
    tour: { EN: "Tour", ID: "Tur" },
    merch: { EN: "Merch", ID: "Merch" },
    gallery: { EN: "Gallery", ID: "Galeri" },
    press: { EN: "Press", ID: "Pers" },
    contact: { EN: "Contact", ID: "Kontak" },
  },
  musicHeading: { EN: "RIPPLE.", ID: "RIPPLE." },
  musicBlurb: {
    EN: "Six tracks. Recorded live to tape in a single room. Out on all platforms.",
    ID: "Enam lagu. Direkam langsung ke pita di satu ruangan. Tersedia di semua platform.",
  },
  tourHeading: { EN: "ON THE ROAD", ID: "DI PERJALANAN" },
  merchHeading: { EN: "WEAR IT.", ID: "PAKAI." },
  shopAll: { EN: "Shop all ↗", ID: "Lihat semua ↗" },
  galleryHeading: { EN: "LIVE / LOUD.", ID: "LIVE / KERAS." },
  pressHeading: { EN: "SAID ABOUT.", ID: "KATA MEREKA." },
  contactHeading: { EN: "GET IN TOUCH.", ID: "HUBUNGI KAMI." },
  contactBlurb: {
    EN: "For booking, collaboration, and press inquiries — reach out via email.",
    ID: "Untuk booking, kolaborasi, dan pertanyaan pers — silakan hubungi via email.",
  },
  booking: { EN: "Booking", ID: "Booking" },
  press: { EN: "Press", ID: "Pers" },
  management: { EN: "Management", ID: "Manajemen" },
  follow: { EN: "Follow", ID: "Ikuti" },
  playVideo: { EN: "Play video", ID: "Putar video" },
  close: { EN: "Close", ID: "Tutup" },
  openYt: { EN: "Open on YouTube ↗", ID: "Buka di YouTube ↗" },
  rights: { EN: "All rights reserved.", ID: "Hak cipta dilindungi." },
  siteBy: { EN: "Site by 510 Studio", ID: "Situs oleh 510 Studio" },
  almostGone: { EN: "Almost gone", ID: "Segera habis" },
  tourSoon: { EN: "New dates dropping soon — stay tuned.", ID: "Tanggal tur baru segera diumumkan — nantikan." },
  merchSoon: { EN: "Fresh merch on the way — stay tuned.", ID: "Merch baru segera hadir — nantikan." },
  gallerySoon: { EN: "Photos coming soon — stay tuned.", ID: "Foto segera hadir — nantikan." },
  read: { EN: "Read article ↗", ID: "Baca artikel ↗" },
  outOfStock: { EN: "Out of stock", ID: "Habis" },
  preOrder: { EN: "Pre-order", ID: "Pre-order" },
  newBadge: { EN: "New", ID: "Baru" },
} as const;

function Home() {
  const [modalId, setModalId] = useState<string | null>(null);
  return (
    <>
      <SmoothScroll />
      <CometCursor />
      <div className="min-h-screen bg-background text-foreground">
        <Nav />
        <Hero />
        <Music onPlay={setModalId} />
        <Tour />
        <Merch />
        <Gallery />
        <Press />
        <Contact />
        <Footer />
      </div>
      <VideoModal id={modalId} onClose={() => setModalId(null)} />
    </>
  );
}

function LangToggle({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useLang();
  const base = dark ? "text-black/70" : "text-white/70";
  const active = dark ? "text-black" : "text-white";
  return (
    <div className={`inline-flex items-center gap-1 rounded-full border ${dark ? "border-black/30" : "border-white/30"} px-1 py-1 text-xs`}>
      {(["EN", "ID"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-full px-2.5 py-1 transition ${lang === l ? (dark ? "bg-black text-white" : "bg-white text-black") : base + " hover:" + active}`}
          aria-pressed={lang === l}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Nav() {
  const { lang } = useLang();
  return (
    <header className="fixed top-0 left-0 right-0 z-40 mix-blend-difference">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 md:px-10 md:py-5">
        <a href="#top" className="flex shrink-0 items-center gap-2">
          <img src={LOGO_URL} alt="510" className="h-7 w-7 invert md:h-8 md:w-8" />
        </a>
        <nav className="hidden gap-8 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-sm text-white/90 transition hover:text-white">
              {n.label[lang]}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 md:gap-3">
          <LangToggle />
          <a
            href="#tour"
            className="hidden rounded-full border border-white/40 px-4 py-2 text-xs uppercase text-white transition hover:bg-white hover:text-black sm:inline-block"
          >
            {COPY.tickets[lang]}
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { lang } = useLang();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section id="top" ref={ref} className="relative h-[110vh] overflow-hidden bg-black">
      <motion.div style={{ scale, y }} className="absolute inset-0">
        <video
          src={HERO_VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.05)_20%,rgba(0,0,0,0.7)_100%)]" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 flex h-screen flex-col items-center justify-center px-6 text-center">
        <motion.img
          src={LOGO_URL}
          alt="510"
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="h-[38vh] w-auto invert md:h-[55vh]"
        />

        <motion.a
          href="#music"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.9 }}
          className="mt-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white hover:text-black"
          aria-label="Scroll to music"
        >
          <span aria-hidden>↓</span>
        </motion.a>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 1.1 }}
          className="mt-16 text-[10px] tracking-[0.35em] text-white/50 md:text-xs"
        >
          6° 54' 43" S &nbsp;·&nbsp; 07° 36' 35" E
        </motion.p>
      </motion.div>
    </section>
  );
}

function Marquee() {
  const items = ["510", "★", "OUT NOW", "★", "WORLD TOUR '26", "★", "NEW LP — RIPPLE", "★"];
  const line = [...items, ...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-white/10 py-6">
      <div className="marquee-track flex gap-12 whitespace-nowrap will-change-transform">
        {line.map((t, i) => (
          <span key={i} className="text-display text-4xl text-white/80 md:text-6xl">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Music({ onPlay }: { onPlay: (id: string) => void }) {
  const { lang } = useLang();
  const { data: tracks } = useMusicTracks();
  const { data: backgrounds } = useMusicBackgrounds();
  const { data: dbSocials } = useSocialLinks();

  const videos = (tracks ?? [])
    .map((t) => ({ id: extractYoutubeId(t.youtube_url), title: t.title }))
    .filter((v): v is { id: string; title: string } => !!v.id);

  const bgImages = backgrounds?.map((b) => b.image_url).filter(Boolean) ?? [];

  const streamingSet = new Set([
    "spotify",
    "apple_music",
    "bandcamp",
    "soundcloud",
    "youtube_music",
    "tidal",
    "youtube",
  ]);
  const streaming = (dbSocials ?? []).filter((s) =>
    streamingSet.has(s.platform.toLowerCase()),
  );

  return (
    <section id="music" className="relative overflow-hidden py-32 md:py-48">
      <MusicBackdrop className="absolute inset-0 h-full w-full" images={bgImages} />
      <SectionFX logoOpacity={0.07} grainOpacity={0.15} invertLogo={false} />

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 md:px-10 text-black">
        <Reveal>
          <div className="mb-16">
            <p className="text-xs uppercase tracking-[0.3em]">01 — {COPY.section.music[lang]}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid gap-6 md:grid-cols-3">
            {videos.map((v) => (
              <button
                key={v.id}
                onClick={() => onPlay(v.id)}
                className="group block text-left"
                aria-label={`${COPY.playVideo[lang]}: ${v.title}`}
              >
                <div className="relative aspect-video overflow-hidden bg-black">
                  <img
                    src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                    alt={v.title}
                    className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/70 text-white transition group-hover:scale-110 group-hover:bg-black">
                      ▶
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span>{v.title}</span>
                  <span className="opacity-60">{COPY.playVideo[lang]} ↗</span>
                </div>
              </button>
            ))}
          </div>
        </Reveal>

        {streaming.length > 0 && (
          <Reveal delay={0.2}>
            <div className="mt-16 flex flex-wrap gap-3">
              {streaming.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-black/40 px-5 py-2 text-sm transition hover:bg-black hover:text-white"
                >
                  <SocialGlyph name={s.platform} />
                  {platformLabel(s.platform)}
                </a>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}



function Tour() {
  const { lang } = useLang();
  const { data: dbTour } = useTourDates();
  const { data: bitTour } = useBandsintownEvents();

  const manual = (dbTour ?? []).map((t) => ({
    key: `db-${t.id}`,
    raw: t.event_date,
    date: formatEventDate(t.event_date),
    city: t.city,
    venue: t.venue,
    event: t.event_name ?? "",
    url: t.ticket_url ?? "#",
    status: (t.status ?? "available") as "available" | "low" | "sold_out",
    fromBit: false,
  }));

  const bit = (bitTour ?? []).map((e) => ({
    key: `bit-${e.id}`,
    raw: e.event_date,
    date: formatEventDate(e.event_date),
    city: e.city,
    venue: e.venue,
    event: e.event_name,
    url: e.ticket_url ?? "#",
    status: e.status,
    fromBit: true,
  }));

  // Show everything: manual + all Bandsintown events (no dedup)
  const merged = [...manual, ...bit].sort((a, b) => a.raw.localeCompare(b.raw));




  const items = merged;


  return (
    <section id="tour" className="relative overflow-hidden py-32 md:py-48">
      <SectionFX logoOpacity={0.06} />

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 md:px-10">
        <Reveal>
          <p className="mb-16 text-xs uppercase tracking-[0.3em] text-white/60">02 — {COPY.section.tour[lang]}</p>
        </Reveal>

        {items.length === 0 ? (
          <Reveal>
            <p className="border-y border-white/10 py-16 text-center text-display text-2xl text-white/50 md:text-4xl">
              {COPY.tourSoon[lang]}
            </p>
          </Reveal>
        ) : (
        <div className="divide-y divide-white/10 border-y border-white/10">
          {items.map((t, i) => {
            const disabled = t.status === "sold_out";
            const statusLabel =
              t.status === "sold_out"
                ? COPY.soldOut[lang]
                : t.status === "low"
                  ? COPY.almostGone[lang]
                  : COPY.tickets[lang];
            const statusClass =
              t.status === "sold_out"
                ? "border-white/15 text-white/35"
                : t.status === "low"
                  ? "border-ember text-ember hover:bg-ember hover:text-black"
                  : "border-white/40 hover:bg-white hover:text-black";
            return (
              <Reveal key={i} delay={i * 0.05}>
                <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-5 transition hover:bg-white/5 md:grid-cols-12 md:gap-4 md:py-7">
                  <div className="min-w-0 md:col-span-2">
                    <div className="text-display text-base md:text-2xl">{t.date}</div>
                  </div>
                  <div className="row-start-2 col-span-2 min-w-0 md:row-auto md:col-span-3">
                    <div className="text-display text-xl leading-tight break-words md:text-3xl">{t.city}</div>
                    <div className="mt-1 text-xs text-white/70 break-words md:hidden">{t.venue}</div>
                  </div>
                  <div className="hidden md:col-span-3 md:block text-sm text-white/70 md:text-base break-words">
                    {t.venue}
                  </div>
                  <div className="row-start-3 col-span-2 min-w-0 md:row-auto md:col-span-2 text-xs text-white/50 md:text-sm break-words">
                    {t.event}
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-2 md:col-span-2">

                    {(t as { fromBit?: boolean }).fromBit ? (
                      <span className="hidden text-[9px] uppercase tracking-[0.18em] text-white/35 sm:inline">
                        Bandsintown
                      </span>
                    ) : null}
                    {disabled ? (
                      <span className={`inline-block rounded-full border px-3 py-1.5 text-[10px] uppercase md:px-4 md:py-2 md:text-xs ${statusClass}`}>
                        {statusLabel}
                      </span>
                    ) : (
                      <a
                        href={t.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-block rounded-full border px-3 py-1.5 text-[10px] uppercase transition md:px-4 md:py-2 md:text-xs ${statusClass}`}
                      >
                        {statusLabel}
                      </a>
                    )}
                  </div>

                </div>
              </Reveal>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}



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
    return () => {
      cancel = true;
    };
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

function Merch() {
  const { lang } = useLang();
  const { data: dbMerch } = useMerchItems();
  const dbHasImages = (dbMerch ?? []).some(
    (r: any) => Array.isArray(r.merch_images) && r.merch_images.length > 0,
  );

  return (
    <section
      id="merch"
      className="relative overflow-hidden bg-neutral-100 py-32 text-neutral-950 md:py-48"
    >
      <SectionFX
        logoOpacity={0.06}
        grainOpacity={0.1}
        invertLogo={false}
      />

      {/* Decorative offset photo */}
      <div className="pointer-events-none absolute -right-24 top-16 hidden w-[46%] md:block">
        <img
          src={ESA_ORANGE_URL}
          alt=""
          className="h-auto w-full mix-blend-multiply grayscale opacity-70"
          loading="lazy"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 md:px-10">
        <Reveal>
          <div className="mb-16 flex items-end justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-neutral-500">
                03 — {COPY.section.merch[lang]}
              </p>
              <h2 className="text-display text-6xl md:text-[9rem]">
                {COPY.merchHeading[lang]}
              </h2>
            </div>
            {dbHasImages && (
              <Link
                to="/shop-all"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-900 bg-neutral-900 px-5 py-2.5 text-sm text-neutral-50 transition hover:bg-transparent hover:text-neutral-900"
              >
                {COPY.shopAll[lang]}
              </Link>
            )}

          </div>
        </Reveal>

        {dbHasImages ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {dbMerch!.map((r: any, i: number) => <MerchDBItem key={r.id} row={r} i={i} />)}
          </div>
        ) : (
          <Reveal>
            <p className="border-y border-neutral-300 py-16 text-center text-display text-2xl text-neutral-400 md:text-4xl">
              {COPY.merchSoon[lang]}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}


function Gallery() {
  const { lang } = useLang();
  const { data: dbShots } = useGalleryShots();
  const [openAt, setOpenAt] = useState<number | null>(null);

  const shots = (dbShots ?? []).map((s) => ({ src: s.image_url, cap: s.caption ?? "" }));

  // Ensure at least 8 tiles for the asymmetric layout (repeat if needed)
  const at = (i: number) => i % shots.length;
  const tile = (i: number) => shots[at(i)]!;

  return (
    <section id="gallery" className="relative overflow-hidden py-32 md:py-48">
      <SectionFX logoOpacity={0.05} />
      <div className="relative z-10 mx-auto max-w-[1800px] px-4 md:px-8">
        <Reveal>
          <p className="mb-16 px-2 text-xs uppercase tracking-[0.3em] text-white/60">04 — {COPY.section.gallery[lang]}</p>
        </Reveal>

        {shots.length === 0 ? (
          <Reveal>
            <p className="border-y border-white/10 py-16 text-center text-display text-2xl text-white/50 md:text-4xl">
              {COPY.gallerySoon[lang]}
            </p>
          </Reveal>
        ) : (
        <>
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <Reveal>
            <GalleryTile shot={tile(0)} onOpen={() => setOpenAt(at(0))} className="md:col-span-2 aspect-[16/10]" />
          </Reveal>
          <Reveal delay={0.05}>
            <GalleryTile shot={tile(1)} onOpen={() => setOpenAt(at(1))} className="aspect-[3/4] md:aspect-auto md:h-full" />
          </Reveal>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {[2, 3, 4].map((n, i) => (
            <Reveal key={n} delay={i * 0.05}>
              <GalleryTile shot={tile(n)} onOpen={() => setOpenAt(at(n))} className="aspect-[4/5]" />
            </Reveal>
          ))}
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <Reveal>
            <GalleryTile shot={tile(5)} onOpen={() => setOpenAt(at(5))} className="aspect-[3/4] md:aspect-auto md:h-full" />
          </Reveal>
          <Reveal delay={0.05}>
            <GalleryTile shot={tile(6)} onOpen={() => setOpenAt(at(6))} className="md:col-span-2 aspect-[16/10]" />
          </Reveal>
        </div>

        <Reveal>
          <GalleryTile shot={tile(7)} onOpen={() => setOpenAt(at(7))} className="aspect-[21/9]" />
        </Reveal>
        </>
        )}
      </div>

      <GalleryLightbox
        shots={shots}
        index={openAt}
        onIndex={setOpenAt}
        onClose={() => setOpenAt(null)}
      />
    </section>
  );
}

function GalleryTile({
  shot,
  className = "",
  onOpen,
}: {
  shot: { src: string; cap: string };
  className?: string;
  onOpen?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group relative block w-full cursor-pointer overflow-hidden bg-white/5 text-left ${className}`}
    >
      <ResolvedImg
        src={shot.src}
        alt={shot.cap}
        className="h-full w-full object-cover transition duration-[900ms] ease-out group-hover:scale-[1.04]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      {shot.cap && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-2 p-5 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="text-xs uppercase tracking-[0.3em] text-white/90">{shot.cap}</span>
        </div>
      )}
    </button>
  );
}

function GalleryLightbox({
  shots,
  index,
  onIndex,
  onClose,
}: {
  shots: { src: string; cap: string }[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const open = index !== null;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex(((index as number) + 1) % shots.length);
      if (e.key === "ArrowLeft") onIndex(((index as number) - 1 + shots.length) % shots.length);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, index, shots.length, onClose, onIndex]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white hover:text-black"
          >
            ✕
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIndex(((index as number) - 1 + shots.length) % shots.length);
            }}
            aria-label="Previous"
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-2xl text-white transition hover:bg-white hover:text-black md:left-8"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIndex(((index as number) + 1) % shots.length);
            }}
            aria-label="Next"
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-2xl text-white transition hover:bg-white hover:text-black md:right-8"
          >
            ›
          </button>

          <motion.div
            key={index}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) onIndex(((index as number) + 1) % shots.length);
              else if (info.offset.x > 80) onIndex(((index as number) - 1 + shots.length) % shots.length);
            }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex max-h-[88vh] w-full max-w-5xl cursor-grab flex-col items-center active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <ResolvedImg
              src={shots[index as number].src}
              alt={shots[index as number].cap}
              loading="eager"
              className="max-h-[80vh] w-auto max-w-full object-contain"
            />
            <div className="mt-4 flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-white/70">
              {shots[index as number].cap && <span>{shots[index as number].cap}</span>}
              <span className="opacity-60">
                {(index as number) + 1} / {shots.length}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


function Press() {
  const { lang } = useLang();
  const { data: dbPress } = usePressItems();

  const hasDb = !!(dbPress && dbPress.length > 0);
  const items = hasDb
    ? dbPress!.map((p) => ({
        id: p.id,
        title: p.title,
        date: formatEventDate(p.published_date),
        href: null as string | null,
      }))
    : [];

  return (
    <section id="press" className="relative overflow-hidden border-y border-white/10 py-24 md:py-32">
      <SectionFX logoOpacity={0.04} grainOpacity={0.15} />

      <div className="relative z-10 mx-auto max-w-5xl px-6 md:px-10">
        <Reveal>
          <p className="mb-10 text-xs uppercase tracking-[0.3em] text-white/60">
            05 — {COPY.section.press[lang]}
          </p>
        </Reveal>

        <ul className="divide-y divide-white/10 border-t border-white/10">
          {items.map((p, i) => {
            const inner = (
              <div className="group grid w-full grid-cols-[auto_1fr_auto] items-baseline gap-6 py-5 transition hover:bg-white/[0.02]">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 tabular-nums">
                  {p.date}
                </span>
                <span className="text-base font-medium leading-snug md:text-lg">
                  {p.title}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-white/40 transition group-hover:text-white">
                  {COPY.read[lang]} →
                </span>
              </div>
            );
            return (
              <Reveal key={p.id} delay={i * 0.04}>
                <li>
                  {hasDb ? (
                    <Link to="/press/$id" params={{ id: p.id }} className="block">
                      {inner}
                    </Link>
                  ) : (
                    <a href={p.href ?? "#"} target="_blank" rel="noreferrer" className="block">
                      {inner}
                    </a>
                  )}
                </li>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Contact() {
  const { lang } = useLang();
  const { data: dbEmails } = useContactEmails();
  const { data: dbPhones } = useContactPhones();
  const phones = dbPhones ?? [];
  const { data: dbSocials } = useSocialLinks();

  const emails =
    dbEmails && dbEmails.length > 0
      ? dbEmails.map((c) => ({ label: c.label, email: c.email }))
      : [];

  const socials =
    dbSocials && dbSocials.length > 0
      ? dbSocials.map((s) => ({ name: s.platform, url: s.url }))
      : [];

  return (
    <section id="contact" className="relative overflow-hidden py-32 md:py-48">
      <SectionFX logoOpacity={0.05} />

      <div className="relative z-10 mx-auto grid max-w-[1600px] gap-10 px-6 md:grid-cols-[1fr_1.25fr] md:gap-16 md:px-10">
        <Reveal>
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/60">
            06 — {COPY.section.contact[lang]}
          </p>
          <h2 className="text-display text-5xl font-black tracking-[-0.06em] md:text-7xl lg:text-8xl">
            {COPY.contactHeading[lang]}
          </h2>
          <p className="mt-6 max-w-md text-sm text-white/60">{COPY.contactBlurb[lang]}</p>

          <div className="mt-10 space-y-4 text-sm">
            {emails.map((c) => (
              <div key={c.email}>
                <div className="text-white/50">{c.label}</div>
                <a
                  href={`mailto:${c.email}`}
                  className="text-lg underline-offset-4 hover:underline"
                >
                  {c.email}
                </a>
              </div>
            ))}

            {phones.map((p) => {
              const digits = p.phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
              return (
                <div key={p.id}>
                  <div className="text-white/50">{p.label}</div>
                  <a
                    href={p.is_whatsapp ? `https://wa.me/${digits}` : `tel:${p.phone}`}
                    target={p.is_whatsapp ? "_blank" : undefined}
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-lg underline-offset-4 hover:underline"
                  >
                    {p.is_whatsapp ? (
                      <WhatsAppGlyph className="h-4 w-4 text-white" />
                    ) : (
                      <Phone className="h-4 w-4" />
                    )}

                    {p.phone}
                  </a>
                </div>
              );
            })}
          </div>

          {socials.length > 0 && <div className="mt-10">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{COPY.follow[lang]}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.name + s.url}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm transition hover:bg-white hover:text-black"
                >
                  <SocialGlyph name={s.name} />
                  {platformLabel(s.name)}
                </a>
              ))}
            </div>
          </div>}
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-white/15 md:aspect-auto md:h-full md:min-h-[600px]">
            <video
              src={SAEMEN_LIVE_VIDEO_URL}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover grayscale"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

            <div className="absolute inset-x-0 top-0 flex items-start justify-end p-5">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/80">
                ● REC
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
              <div className="text-display text-lg leading-tight text-white/80 md:text-2xl">
                6° 54' 43" S
                <br />
                07° 36' 35" E
              </div>
              <img
                src={KICK_WHITE_URL}
                alt=""
                className="hidden h-20 w-16 object-cover mix-blend-screen opacity-70 md:block"
                loading="lazy"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}




function VideoModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { lang } = useLang();
  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [id, onClose]);

  return (
    <AnimatePresence>
      {id && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3">
              <a
                href={`https://www.youtube.com/watch?v=${id}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs uppercase tracking-widest text-white/70 hover:text-white"
              >
                {COPY.openYt[lang]}
              </a>
              <button
                onClick={onClose}
                className="rounded-full border border-white/30 px-4 py-1.5 text-xs uppercase text-white/80 transition hover:bg-white hover:text-black"
                aria-label={COPY.close[lang]}
              >
                {COPY.close[lang]} ✕
              </button>
            </div>
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <iframe
                key={id}
                src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
                title="YouTube video"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  youtube_music: "YouTube Music",
  spotify: "Spotify",
  apple_music: "Apple Music",
  tiktok: "TikTok",
  threads: "Threads",
  twitter: "X / Twitter",
  x: "X / Twitter",
  facebook: "Facebook",
  bandcamp: "Bandcamp",
  soundcloud: "SoundCloud",
  tidal: "Tidal",
  twitch: "Twitch",
  website: "Website",
};

function platformLabel(name: string) {
  const k = name.toLowerCase().replace(/[\s/]+/g, "_");
  return PLATFORM_LABELS[k] ?? name;
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.29-.15-1.7-.84-1.96-.94-.26-.1-.45-.15-.64.15-.19.29-.74.94-.9 1.13-.17.19-.33.22-.62.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.64-1.56-.88-2.13-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.51.07-.77.36-.26.29-1.01.99-1.01 2.4s1.04 2.79 1.18 2.98c.15.19 2.04 3.12 4.94 4.37.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.55-.08 1.7-.7 1.94-1.37.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.34z" />
      <path d="M12.04 2.5c-5.25 0-9.5 4.25-9.5 9.5 0 1.68.44 3.31 1.28 4.75L2.5 21.5l4.9-1.28a9.46 9.46 0 0 0 4.64 1.2h.01c5.24 0 9.5-4.25 9.5-9.5s-4.26-9.42-9.51-9.42zm0 17.2h-.01a7.9 7.9 0 0 1-4.02-1.1l-.29-.17-2.91.76.78-2.83-.19-.29a7.86 7.86 0 0 1-1.21-4.21c0-4.36 3.55-7.9 7.91-7.9 2.11 0 4.09.82 5.58 2.31a7.84 7.84 0 0 1 2.31 5.59c0 4.36-3.55 7.84-7.95 7.84z" />
    </svg>
  );
}

function SocialGlyph({ name }: { name: string }) {

  const cls = "h-4 w-4";
  const key = name.toLowerCase().replace(/[\s/]+/g, "_");
  switch (key) {
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      );
    case "youtube":
    case "youtube_music":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
          <path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 5 12 5 12 5s-7 0-8.9.4A3 3 0 0 0 1 7.5C.6 9.4.6 12 .6 12s0 2.6.4 4.5A3 3 0 0 0 3.1 18.6C5 19 12 19 12 19s7 0 8.9-.4A3 3 0 0 0 23 16.5c.4-1.9.4-4.5.4-4.5s0-2.6-.4-4.5zM10 15.5v-7l6 3.5-6 3.5z" />
        </svg>
      );
    case "spotify":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4a.7.7 0 0 1-1 .2c-2.6-1.6-6-2-9.9-1.1a.7.7 0 1 1-.3-1.4c4.3-1 8.1-.5 11 1.2.4.2.4.7.2 1.1zm1.2-2.8a.9.9 0 0 1-1.2.3c-3-1.8-7.5-2.4-11-1.3a.9.9 0 1 1-.5-1.7c4-1.2 9-.6 12.4 1.5.4.3.5.8.3 1.2zm.1-2.9C14.4 8.6 8.7 8.4 5.3 9.4a1 1 0 1 1-.6-2c4-1.2 10.3-.9 14.3 1.4a1 1 0 1 1-1 1.9z" />
        </svg>
      );
    case "apple_music":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
          <path d="M19 3H8a3 3 0 0 0-3 3v9.2A3.8 3.8 0 1 0 8 19V9l9-2v6.2A3.8 3.8 0 1 0 20 17V4a1 1 0 0 0-1-1z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
          <path d="M20 8.5a6.5 6.5 0 0 1-4-1.4v7.4a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V2h3a4 4 0 0 0 4 4v2.5z" />
        </svg>
      );
    case "threads":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
          <path d="M17.1 11.2c-.1-.05-.2-.1-.3-.14-.18-3.3-1.98-5.19-5-5.21h-.04c-1.8 0-3.3.77-4.23 2.18l1.66 1.14c.69-1.05 1.78-1.28 2.57-1.28h.03c.98 0 1.72.29 2.2.85.35.4.58.97.7 1.68a12.6 12.6 0 0 0-2.82-.14c-2.84.17-4.67 1.82-4.55 4.13.06 1.17.65 2.18 1.65 2.83.85.56 1.94.83 3.07.77 1.5-.08 2.67-.65 3.49-1.69.62-.79 1.01-1.81 1.19-3.1.72.44 1.26 1.01 1.55 1.7.5 1.18.53 3.12-1.05 4.7-1.38 1.38-3.05 1.98-5.57 2-2.8-.02-4.91-.92-6.28-2.66C4.1 16.35 3.44 14.1 3.42 12c.02-2.1.68-4.35 1.95-5.95C6.74 4.31 8.85 3.41 11.65 3.4c2.82.02 4.97.92 6.39 2.67.7.86 1.22 1.94 1.57 3.2l1.95-.52c-.42-1.55-1.09-2.89-2-4.01C17.75 2.5 15.06 1.32 11.66 1.3h-.01C8.26 1.32 5.6 2.5 3.75 4.75 2.11 6.76 1.26 9.55 1.24 12v.01c.02 2.44.87 5.23 2.51 7.24 1.85 2.25 4.51 3.43 7.9 3.45h.01c3.02-.02 5.15-.81 6.9-2.56 2.3-2.29 2.23-5.16 1.47-6.92-.54-1.26-1.57-2.29-2.93-3.02zm-5.2 5.7c-1.25.07-2.55-.49-2.61-1.66-.05-.87.61-1.83 2.68-1.95l.5-.01c.75 0 1.46.07 2.1.21-.24 2.98-1.64 3.35-2.67 3.41z" />
        </svg>
      );
    case "twitter":
    case "x":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
          <path d="M18 3h3l-7.5 8.6L22 21h-6.8l-4.9-6.4L4.6 21H2l8-9.2L2 3h6.9l4.4 5.8L18 3zm-1 16h1.7L7 4.9H5.2L17 19z" />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
          <path d="M13 22v-8h3l1-4h-4V7.5c0-1.1.3-1.9 2-1.9h2V2.1c-.4-.1-1.6-.2-3-.2-3 0-5 1.8-5 5.1V10H6v4h3v8h4z" />
        </svg>
      );
    case "bandcamp":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
          <path d="M3 17l4-10h14l-4 10H3z" />
        </svg>
      );
    case "soundcloud":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
          <path d="M2 15v-3a1 1 0 1 1 2 0v3a1 1 0 1 1-2 0zm3 1V11a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0zm3 0V9a1 1 0 1 1 2 0v7a1 1 0 1 1-2 0zm3 0V7a1 1 0 1 1 2 0v9a1 1 0 1 1-2 0zm3-8a4 4 0 0 1 7.9-.8A3.5 3.5 0 0 1 20.5 17H14a1 1 0 0 1-1-1V8z" />
        </svg>
      );
    case "tidal":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
          <path d="M4 8l4-4 4 4-4 4-4-4zm8 0l4-4 4 4-4 4-4-4zm-4 4l4-4 4 4-4 4-4-4z" />
        </svg>
      );
    case "twitch":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
          <path d="M4 3h17v11l-5 5h-4l-3 3H6v-3H2V6l2-3zm2 2v13h4v3l3-3h4l4-4V5H6zm9 3h2v6h-2V8zm-5 0h2v6h-2V8z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
        </svg>
      );
  }
}


function Footer() {
  const { lang } = useLang();
  return (
    <footer className="relative overflow-hidden border-t border-white/10 pt-24 pb-10">
      <div className="relative mx-auto flex max-w-[1600px] flex-col items-center gap-8 px-6 md:px-10">
        {/* Big centered 3D-rotating logo with grain */}
        <div className="relative flex h-[220px] w-[220px] items-center justify-center md:h-[320px] md:w-[320px]">
          <div className="footer-logo-3d relative h-full w-full">
            <img
              src={LOGO_URL}
              alt="510"
              className="absolute inset-0 h-full w-full object-contain invert"
              style={{ opacity: 0.9 }}
            />
            <img
              src={LOGO_URL}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-contain invert glitch-slice-a"
              style={{ opacity: 0.35, filter: "hue-rotate(20deg)" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 mix-blend-overlay"
              style={{
                opacity: 0.45,
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.75'/></svg>\")",
              }}
            />
          </div>
        </div>

        <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
          © {new Date().getFullYear()} — {COPY.rights[lang]}
        </div>
      </div>
    </footer>
  );
}
