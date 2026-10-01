import { useEffect, useRef } from "react";

// Animated dot-matrix ripple background. Black dots on off-white,
// distorted by layered sine waves for a fluid, tactile feel.
export function WaveShader({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#f2f0ec";
      ctx.fillRect(0, 0, w, h);

      const gap = 18 * dpr;
      const cx = w * 0.5;
      const cy = h * 0.5;

      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap) {
          const dx = (x - cx) / w;
          const dy = (y - cy) / h;
          const d = Math.sqrt(dx * dx + dy * dy);

          const wave =
            Math.sin(d * 18 - t * 1.6) * 0.5 +
            Math.sin((x * 0.006 + y * 0.004) + t * 0.8) * 0.5;

          const size = (2.2 + wave * 2.4) * dpr;
          const alpha = 0.35 + 0.55 * ((wave + 1) / 2);

          ctx.beginPath();
          ctx.fillStyle = `rgba(12,12,12,${alpha.toFixed(3)})`;
          ctx.arc(x, y, Math.max(0.4, size), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      t += 0.018;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={className} />;
}
