import { useEffect, useRef, useState } from "react";
import live1 from "@/assets/live1.webp.asset.json";
import live2 from "@/assets/live2.webp.asset.json";

const FALLBACK_IMAGES = [live1.url, live2.url];

/**
 * Alternating photo backdrop with animated noise/grain and subtle glitch.
 * Renders behind the Music section on an off-white base.
 */
export function MusicBackdrop({ className = "", images: propImages }: { className?: string; images?: string[] }) {
  const [idx, setIdx] = useState(0);
  const images = propImages && propImages.length > 0 ? propImages : FALLBACK_IMAGES;



  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % images.length), 4200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animated grain via canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const size = 160;
    c.width = size;
    c.height = size;
    let raf = 0;
    const draw = () => {
      const img = ctx.createImageData(size, size);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 40;
      }
      ctx.putImageData(img, 0, 0);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`pointer-events-none overflow-hidden bg-[#ececea] ${className}`}>
      {/* Alternating photos */}
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-[1600ms] ease-in-out"
          style={{ opacity: i === idx ? 0.55 : 0 }}
        >
          <img
            src={src}
            alt=""
            className="h-full w-full object-cover mix-blend-multiply grayscale"
          />
          {/* Glitch slices */}
          <div
            className="absolute inset-0 mix-blend-screen opacity-40 glitch-slice-a"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "hue-rotate(10deg) saturate(1.4)",
            }}
          />
          <div
            className="absolute inset-0 mix-blend-multiply opacity-30 glitch-slice-b"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
      ))}

      {/* Scanlines */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-multiply"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0 1px, transparent 1px 3px)",
        }}
      />

      {/* Animated grain */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-70 mix-blend-multiply"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Soft light wash so text stays readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(236,236,234,0.35)_0%,rgba(236,236,234,0.85)_100%)]" />
    </div>
  );
}
