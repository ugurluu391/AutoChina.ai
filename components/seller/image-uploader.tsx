"use client";
import { useState, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

/**
 * Şəkilləri base64-ə çevirib gizli input-lara yazır.
 * Faktiki yükləmə + sıxışdırma server action-da Cloudinary tərəfindən edilir.
 * Brauzerdə ilkin ölçü kiçiltmə (canvas) ilə şəbəkə yükü azaldılır.
 */
async function fileToCompressedDataUri(file: File, maxDim = 1600, quality = 0.82): Promise<string> {
  const dataUri = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  // SVG və ya kiçik fayllar üçün canvas keçişi
  try {
    const img = document.createElement("img");
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUri; });
    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      const ratio = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return dataUri;
  }
}

export function ImageUploader({ existing = [] }: { existing?: string[] }) {
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 8 - previews.length - existing.length);
    const compressed = await Promise.all(arr.map((f) => fileToCompressedDataUri(f)));
    setPreviews((p) => [...p, ...compressed]);
  };

  const remove = (i: number) => setPreviews((p) => p.filter((_, idx) => idx !== i));

  return (
    <div>
      {/* Gizli input-lar — formData.getAll("images") bunları oxuyur */}
      {previews.map((uri, i) => <input key={i} type="hidden" name="images" value={uri} />)}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {/* Mövcud şəkillər (redaktədə) */}
        {existing.map((url, i) => (
          <div key={`ex-${i}`} className="relative aspect-square rounded-[var(--radius-sm)] border border-[var(--border)] overflow-hidden bg-bg-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <span className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-content-dim">Mövcud</span>
          </div>
        ))}

        {/* Yeni preview-lar */}
        {previews.map((uri, i) => (
          <div key={i} className="relative aspect-square rounded-[var(--radius-sm)] border border-[var(--border)] overflow-hidden bg-bg-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={uri} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => remove(i)} className="absolute top-1 right-1 w-6 h-6 grid place-items-center rounded-md bg-black/60 hover:bg-red-500/40 transition-colors">
              <X size={13} />
            </button>
          </div>
        ))}

        {/* Yükləmə düyməsi */}
        {previews.length + existing.length < 8 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-[var(--radius-sm)] border border-dashed border-[var(--border)] grid place-items-center gap-1 text-content-muted hover:border-[var(--border-glow)] hover:text-content transition-all"
          >
            <Upload size={20} />
            <span className="text-[11px]">Şəkil əlavə et</span>
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
      <p className="text-content-muted text-xs mt-2 flex items-center gap-1.5">
        <ImageIcon size={12} /> Maks. 8 şəkil · avtomatik sıxışdırılır və optimizasiya olunur
      </p>
    </div>
  );
}
