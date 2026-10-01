import { useEffect, useState } from "react";
import { resolveMediaUrl } from "@/lib/admin-upload";

export function ResolvedImg({
  src,
  alt,
  className,
  loading = "lazy",
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const isDirect = (s: string) => /^https?:\/\//i.test(s) || s.startsWith("/");
  const [url, setUrl] = useState<string | null>(
    src && isDirect(src) ? src : null,
  );
  useEffect(() => {
    let cancel = false;
    if (!src) return;
    if (isDirect(src)) {
      setUrl(src);
      return;
    }
    resolveMediaUrl(src).then((u) => {
      if (!cancel) setUrl(u);
    });
    return () => {
      cancel = true;
    };
  }, [src]);
  if (!url) return <div className={className} aria-hidden />;
  return <img src={url} alt={alt} className={className} loading={loading} decoding="async" />;
}
