"use client";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

const isUrl = (s: string) => s.startsWith("http") || s.startsWith("/");

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const safe = images.length ? images : ["🚗"];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const current = safe[active];

  return (
    <div className="space-y-4">
      {/* Əsas şəkil + zoom */}
      <div
        ref={ref}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        className="relative rounded-[var(--radius)] bg-[linear-gradient(135deg,#141a2b,#0b0f1a)] border border-[var(--border)] grid place-items-center h-[400px] overflow-hidden cursor-zoom-in"
      >
        {isUrl(current) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current}
            alt={title}
            className="w-full h-full object-contain transition-transform duration-200"
            style={zoom ? { transform: "scale(2)", transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
          />
        ) : (
          <span className="text-[120px]">{current}</span>
        )}
      </div>

      {/* Thumbnail-lar */}
      {safe.length > 1 && (
        <div className="flex gap-3 flex-wrap">
          {safe.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "w-20 h-20 rounded-[var(--radius-sm)] border grid place-items-center overflow-hidden transition-all bg-[linear-gradient(135deg,#141a2b,#0b0f1a)]",
                active === i ? "border-[var(--border-glow)] shadow-glow" : "border-[var(--border)] opacity-70 hover:opacity-100"
              )}
            >
              {isUrl(img) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">{img}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
