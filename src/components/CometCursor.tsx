import { useEffect, useRef } from "react";
import logo from "@/assets/cursor-logo.png.asset.json";

// Logo follows the cursor with a glowing comet tail (fine pointers only).
export function CometCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current!;
    const img = logoRef.current!;
    const ctx = canvas.getContext("2d")!;
    let w = 0, h = 0, raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const target = { x: w / 2, y: h / 2 };
    const pos = { ...target };
    let visible = false;
    type P = { x: number; y: number; vx: number; vy: number; life: number; size: number; hue: number };
    const parts: P[] = [];
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX; target.y = e.clientY;
      if (!visible) { visible = true; pos.x = target.x; pos.y = target.y; img.style.opacity = "1"; }
    };
    const onLeave = () => { visible = false; img.style.opacity = "0"; };
    const tick = () => {
      const px = pos.x, py = pos.y;
      pos.x += (target.x - pos.x) * 0.2;
      pos.y += (target.y - pos.y) * 0.2;
      const speed = Math.hypot(pos.x - px, pos.y - py);
      if (visible) {
        const n = Math.min(3, 1 + Math.floor(speed / 6));
        for (let i = 0; i < n; i++) {
          const t = i / n;
          parts.push({
            x: px + (pos.x - px) * t + (Math.random() - 0.5) * 1.5,
            y: py + (pos.y - py) * t + (Math.random() - 0.5) * 1.5,
            vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
            life: 1, size: 0.8 + Math.random() * 1.2, hue: 22 + Math.random() * 20,
          });
        }
      }
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.035;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        const r = p.size * p.life * 2;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, `hsla(${p.hue},100%,75%,${p.life * 0.6})`);
        g.addColorStop(0.4, `hsla(${p.hue},95%,50%,${p.life * 0.25})`);
        g.addColorStop(1, "hsla(20,90%,40%,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      img.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[9998] h-full w-full" />
      <img
        ref={logoRef}
        src={logo.url}
        alt=""
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-10 w-10 object-contain opacity-0 transition-opacity duration-300 drop-shadow-[0_0_8px_rgba(255,140,40,0.7)]"
      />
    </>
  );
}
