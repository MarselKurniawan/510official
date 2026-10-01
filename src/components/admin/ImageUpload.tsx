import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { uploadMedia, resolveMediaUrl, deleteMedia, isCdnRef, type MediaBucket } from "@/lib/admin-upload";
import { toast } from "sonner";

export function ImageUpload({
  bucket,
  value,
  onChange,
  label = "Image",
}: {
  bucket: MediaBucket;
  value: string | null | undefined;
  onChange: (ref: string | null) => void;
  label?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancel = false;
    resolveMediaUrl(value).then((url) => {
      if (!cancel) setPreview(url);
    });
    return () => {
      cancel = true;
    };
  }, [value]);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const previousRef = value;
      const ref = await uploadMedia(bucket, file);
      onChange(ref);
      if (previousRef) void deleteMedia(previousRef);
      toast.success("Uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    const ref = value;
    onChange(null);
    if (ref) void deleteMedia(ref);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        {value && (
          <span
            title={
              isCdnRef(value)
                ? "Served from the free CDN — no Cloud usage"
                : "Stored in Cloud — still uses bandwidth"
            }
            className={`rounded px-1.5 py-0.5 text-[9px] uppercase tracking-widest ${
              isCdnRef(value) ? "bg-emerald-500/90 text-black" : "bg-amber-500/90 text-black"
            }`}
          >
            {isCdnRef(value) ? "CDN" : "Cloud"}
          </span>
        )}
      </div>
      <div
        className="group relative aspect-video overflow-hidden rounded-md border border-dashed border-border bg-muted/30 hover:border-foreground/40 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) void handleFile(f);
        }}
      >
        {preview ? (
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
            <Upload className="h-5 w-5" />
            Click or drop image
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-background/80">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
        {preview && !busy && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 opacity-0 group-hover:opacity-100 transition"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
}
