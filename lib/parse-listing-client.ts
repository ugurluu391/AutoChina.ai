import type { GeneratedListing } from "@/components/seller/ai-listing-generator";

/**
 * Client-safe JSON parser — AI streaming mətnindən elan strukturunu çıxarır.
 * (lib/ai.ts server-only olduğu üçün ayrıca client versiyası)
 */
export function parseListingResponse(text: string): GeneratedListing {
  let clean = text.replace(/```json\s*|\s*```/g, "").trim();
  const first = clean.indexOf("{");
  const last = clean.lastIndexOf("}");
  if (first !== -1 && last !== -1) clean = clean.slice(first, last + 1);

  try {
    const p = JSON.parse(clean);
    return {
      title: String(p.title ?? ""),
      description: String(p.description ?? ""),
      salesPitch: String(p.salesPitch ?? ""),
      hashtags: Array.isArray(p.hashtags) ? p.hashtags.map(String) : [],
      keywords: Array.isArray(p.keywords) ? p.keywords.map(String) : [],
    };
  } catch {
    return { title: "", description: clean, salesPitch: "", hashtags: [], keywords: [] };
  }
}
