/**
 * Big floating ASCII "510" — replaces the raster FloatingLogo.
 * Non-interactive, use behind section content.
 */
const ASCII = String.raw`
 ███████╗ ██╗  ██████╗ 
 ██╔════╝ ██║ ██╔═══██╗
 ███████╗ ██║ ██║   ██║
 ╚════██║ ██║ ██║   ██║
 ███████║ ██║ ╚██████╔╝
 ╚══════╝ ╚═╝  ╚═════╝ 
`;

export function AsciiLogo({
  className = "",
  opacity = 0.08,
}: {
  className?: string;
  opacity?: number;
  /** kept for API compat with old FloatingLogo call sites */
  invert?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden ${className}`}
    >
      <pre
        className="ascii-float select-none font-mono leading-[0.9] tracking-tighter text-current whitespace-pre text-[clamp(2.2rem,10vw,9rem)]"
        style={{ opacity }}
      >
        {ASCII}
      </pre>
      <pre
        className="ascii-float ascii-float-b absolute select-none font-mono leading-[0.9] tracking-tighter whitespace-pre text-[clamp(2.2rem,10vw,9rem)]"
        style={{ opacity: opacity * 0.5, color: "hsl(var(--primary, 0 0% 100%))", mixBlendMode: "screen" }}
      >
        {ASCII}
      </pre>
    </div>
  );
}
