import { useEffect, useRef } from "react";
import { CURSOR_LOGO_URL } from "@/lib/media";

// Logo follows the cursor, tilts toward the movement direction and glitches
// (RGB split + jitter) on fast moves and at random intervals. Fine pointers only.
export function CometCursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const redRef = useRef<HTMLImageElement>(null);
  const cyanRef = useRef<HTMLImageElement>(null);
  const mainRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wrap = wrapRef.current!, red = redRef.current!, cyan = cyanRef.current!, main = mainRef.current!;
    const target = { x: 0, y: 0 }, pos = { x: 0, y: 0 };
    let visible = false, angle = 0, raf = 0, glitch = 0;
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX; target.y = e.clientY;
      if (!visible) { visible = true; pos.x = target.x; pos.y = target.y; wrap.style.opacity = "1"; }
    };
    const onLeave = () => { visible = false; wrap.style.opacity = "0"; };
    const tick = () => {
      const dx = (target.x - pos.x) * 0.18, dy = (target.y - pos.y) * 0.18;
      pos.x += dx; pos.y += dy;
      const speed = Math.hypot(dx, dy);
      // Tilt toward horizontal movement, clamp so the logo never flips.
      const want = Math.max(-35, Math.min(35, dx * 2.2));
      angle += (want - angle) * 0.15;
      const stretch = 1 + Math.min(speed / 60, 0.25);
      if (speed > 14 || Math.random() < 0.006) glitch = 6 + Math.floor(Math.random() * 6);
      let ox = 0, oy = 0, split = 0;
      if (glitch > 0) {
        glitch--;
        split = 2 + Math.random() * 4;
        ox = (Math.random() - 0.5) * 6; oy = (Math.random() - 0.5) * 3;
        const top = Math.random() * 70, bottom = Math.min(100, top + 10 + Math.random() * 30);
        main.style.clipPath = Math.random() < 0.5 ? `inset(${top}% 0 ${100 - bottom}% 0)` : "none";
      } else main.style.clipPath = "none";
      wrap.style.transform = `translate3d(${pos.x + ox}px, ${pos.y + oy}px, 0) translate(-50%, -50%) rotate(${angle}deg) scaleY(${stretch})`;
      red.style.transform = `translateX(${-split}px)`;
      cyan.style.transform = `translateX(${split}px)`;
      red.style.opacity = cyan.style.opacity = split ? "0.8" : "0";
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const layer = "absolute inset-0 h-full w-full object-contain";
  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-11 w-11 opacity-0 transition-opacity duration-300"
    >
      <img ref={redRef} src={CURSOR_LOGO_URL} alt="" className={`${layer} mix-blend-screen opacity-0`} style={{ filter: "drop-shadow(0 0 0 red) sepia(1) saturate(8) hue-rotate(-40deg)" }} />
      <img ref={cyanRef} src={CURSOR_LOGO_URL} alt="" className={`${layer} mix-blend-screen opacity-0`} style={{ filter: "sepia(1) saturate(8) hue-rotate(150deg)" }} />
      <img ref={mainRef} src={CURSOR_LOGO_URL} alt="" className={`${layer} drop-shadow-[0_0_6px_rgba(255,140,40,0.5)]`} />
    </div>
  );
}
