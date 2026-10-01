const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1600;
const WEBP_QUALITY = 0.72;

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      type,
      quality,
    );
  });
}

export async function compressImage(file: File): Promise<File> {
  // Skip compression for tiny assets or non-image files
  if (!file.type.startsWith("image/")) return file;
  if (file.size < 60 * 1024) return file;

  const image = await createImageBitmap(file);
  let { width, height } = image;

  if (width > MAX_WIDTH || height > MAX_HEIGHT) {
    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(image, 0, 0, width, height);
  image.close();

  const originalName = file.name.replace(/\.[^/.]+$/, "");
  let outType = "image/webp";
  let quality = WEBP_QUALITY;

  // Preserve animated GIFs
  if (file.type === "image/gif") return file;

  // JPEG sources may compress better as JPEG if WebP support is missing, but modern browsers handle WebP fine.
  if (file.type === "image/png" && file.size < 800 * 1024) {
    // PNG with transparency or small size: keep as PNG to avoid artifacts
    if (!await hasTransparency(canvas)) {
      outType = "image/webp";
    } else {
      outType = "image/png";
      quality = 1;
    }
  }

  if (outType === "image/png") {
    const blob = await canvasToBlob(canvas, "image/png", 1);
    if (blob.size >= file.size) return file;
    return new File([blob], `${originalName}.png`, { type: "image/png" });
  }

  const blob = await canvasToBlob(canvas, "image/webp", quality);
  if (blob.size >= file.size) return file;
  return new File([blob], `${originalName}.webp`, { type: "image/webp" });
}

async function hasTransparency(canvas: HTMLCanvasElement): Promise<boolean> {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;
  const { width, height } = canvas;
  if (width * height === 0) return false;
  const data = ctx.getImageData(0, 0, width, height).data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}
