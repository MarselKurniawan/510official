import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { Reveal } from "@/components/Reveal";
import type { MerchItem } from "@/data/merch";

const LABELS = {
  outOfStock: { EN: "Out of stock", ID: "Habis" },
  preOrder: { EN: "Pre-order", ID: "Pre-order" },
  newBadge: { EN: "New", ID: "Baru" },
  shop: { EN: "Shop", ID: "Beli" },
} as const;

export function MerchCard({ item, i = 0 }: { item: MerchItem; i?: number }) {
  const { lang } = useLang();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [zoom, setZoom] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (zoom === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(null);
      if (e.key === "ArrowRight") setZoom((z) => ((z as number) + 1) % item.images.length);
      if (e.key === "ArrowLeft") setZoom((z) => ((z as number) - 1 + item.images.length) % item.images.length);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoom, item.images.length]);


  const goTo = (n: number) => {
    setIdx(n);
    scrollRef.current?.scrollTo({ left: n * (scrollRef.current?.clientWidth ?? 0), behavior: "smooth" });
  };
  const next = () => goTo((idx + 1) % item.images.length);
  const prev = () => goTo((idx - 1 + item.images.length) % item.images.length);

  // Slow auto-slide
  useEffect(() => {
    if (item.images.length < 2 || paused) return;
    const t = setInterval(() => {
      setIdx((cur) => {
        const n = (cur + 1) % item.images.length;
        scrollRef.current?.scrollTo({
          left: n * (scrollRef.current?.clientWidth ?? 0),
          behavior: "smooth",
        });
        return n;
      });
    }, 4500);
    return () => clearInterval(t);
  }, [item.images.length, paused]);

  const badgeLabel =
    item.badge === "new" ? LABELS.newBadge[lang] : item.badge === "pre_order" ? LABELS.preOrder[lang] : null;

  return (
    <Reveal delay={i * 0.05}>
      <div
        className="group"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-white/5">
          <div
            ref={scrollRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              const w = el.clientWidth || 1;
              setIdx(Math.round(el.scrollLeft / w));
            }}
            className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto"
          >
            {item.images.map((src, j) => (
              <button
                key={j}
                type="button"
                onClick={() => setZoom(j)}
                aria-label={`${item.name[lang]} — view image ${j + 1}`}
                className="relative h-full w-full shrink-0 cursor-zoom-in snap-center"
              >
                <img
                  src={src}
                  alt={item.name[lang]}
                  className={`h-full w-full object-cover transition duration-700 ${item.in_stock ? "" : "opacity-60"}`}
                  loading="lazy"
                />
              </button>
            ))}

          </div>

          <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
            {badgeLabel && (
              <span className="rounded-full bg-white px-2 py-1 text-[10px] uppercase tracking-wider text-black">
                {badgeLabel}
              </span>
            )}
            {!item.in_stock && (
              <span className="rounded-full bg-black/80 px-2 py-1 text-[10px] uppercase tracking-wider text-white">
                {LABELS.outOfStock[lang]}
              </span>
            )}
          </div>

          {item.images.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-black"
              >
                ‹
              </button>
              <button
                onClick={next}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-black"
              >
                ›
              </button>
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                {item.images.map((_, j) => (
                  <span
                    key={j}
                    className={`h-1 w-4 rounded-full transition ${j === idx ? "bg-white" : "bg-white/40"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <a
          href={item.in_stock ? item.url : undefined}
          target={item.in_stock ? "_blank" : undefined}
          rel="noreferrer"
          className="mt-3 block"
          onClick={(e) => !item.in_stock && e.preventDefault()}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="truncate">{item.name[lang]}</span>
            <span className="opacity-60">{item.price}</span>
          </div>
          <span className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] opacity-60 transition group-hover:opacity-100">
            {item.in_stock ? LABELS.shop[lang] : LABELS.outOfStock[lang]}
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </a>

        <AnimatePresence>
          {zoom !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
              onClick={() => setZoom(null)}
            >
              <button
                onClick={() => setZoom(null)}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white hover:text-black"
              >
                ✕
              </button>
              {item.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoom((z) => ((z as number) - 1 + item.images.length) % item.images.length);
                    }}
                    aria-label="Previous"
                    className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-2xl text-white transition hover:bg-white hover:text-black md:left-8"
                  >
                    ‹
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoom((z) => ((z as number) + 1) % item.images.length);
                    }}
                    aria-label="Next"
                    className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-2xl text-white transition hover:bg-white hover:text-black md:right-8"
                  >
                    ›
                  </button>
                </>
              )}
              <motion.div
                key={zoom}
                drag={item.images.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) setZoom((z) => ((z as number) + 1) % item.images.length);
                  else if (info.offset.x > 80)
                    setZoom((z) => ((z as number) - 1 + item.images.length) % item.images.length);
                }}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex max-h-[88vh] w-full max-w-5xl flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={item.images[zoom]}
                  alt={item.name[lang]}
                  className="max-h-[80vh] w-auto max-w-full object-contain"
                />
                <div className="mt-4 flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-white/70">
                  <span>{item.name[lang]}</span>
                  <span className="opacity-60">
                    {zoom + 1} / {item.images.length}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </Reveal>
  );
}
