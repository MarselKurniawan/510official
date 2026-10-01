import { useEffect, useRef } from "react";
import logoAsset from "@/assets/logo.png.asset.json";

/**
 * Per-section background FX:
 *  - Big slowly spinning raster logo (with noise/grain wash)
 *  - Animated canvas grain
 *
 * Non-interactive. Inherits `currentColor` so it adapts to
 * dark sections (light content) and light sections (dark content).
 *
 * Place inside a `relative overflow-hidden` section, before the
 * `relative z-10` content wrapper.
 */
export function SectionFX({
  className = "",
  logoOpacity = 0.06,
  grainOpacity = 0.35,
  invertLogo = true,
}: {
  className?: string;
  logoOpacity?: number;
  grainOpacity?: number;
  /** invert=true for dark sections (white logo), false for light sections */
  invertLogo?: boolean;
}) {
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
        img.data[i + 3] = 32;
      }
      ctx.putImageData(img, 0, 0);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Spinning raster logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={logoAsset.url}
          alt=""
          className={`floating-logo-spin h-[85vmin] w-[85vmin] max-h-[900px] max-w-[900px] object-contain ${invertLogo ? "invert" : ""}`}
          style={{ opacity: logoOpacity }}
        />
      </div>

      {/* Animated grain */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full mix-blend-overlay"
        style={{ opacity: grainOpacity, imageRendering: "pixelated" }}
      />
    </div>
  );
}
