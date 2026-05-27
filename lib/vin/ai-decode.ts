import Anthropic from "@anthropic-ai/sdk";
import { parseVin, type VinParseResult } from "./parser";

/**
 * AI ilə VIN zənginləşdirmə.
 * Deterministik parser markanı/ili verir; AI konkret modeli və ehtimal olunan
 * hissə kateqoriyalarını təxmin edir. Server-only.
 */

const MODEL = process.env.AI_MODEL || "claude-sonnet-4-20250514";

export type VinAiResult = VinParseResult & {
  model?: string;
  bodyType?: string;
  engineHint?: string;
  suggestedCategories?: string[]; // tövsiyə olunan hissə kateqoriyaları
  confidence?: "high" | "medium" | "low";
  aiNote?: string;
};

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY təyin edilməyib");
    client = new Anthropic({ apiKey: key });
  }
  return client;
}

/** VIN-i tam tanıyır: parser + AI model təxmini */
export async function decodeVinWithAi(rawVin: string): Promise<VinAiResult> {
  const parsed = parseVin(rawVin);
  if (!parsed.valid) return parsed;

  // AI açarı yoxdursa, yalnız deterministik nəticə qaytar
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ...parsed, confidence: parsed.brand ? "medium" : "low", aiNote: "AI əlçatan deyil — yalnız əsas məlumat" };
  }

  const prompt = `Sən VIN kod mütəxəssisisən. Aşağıdakı Çin avtomobili VIN-i üçün konkret model və hissə kateqoriyalarını təxmin et.

VIN: ${parsed.vin}
Aşkar edilmiş marka: ${parsed.brand ?? "naməlum"}
İl: ${parsed.year ?? "naməlum"}
WMI: ${parsed.wmi}

YALNIZ etibarlı JSON qaytar (başqa heç nə):
{
  "model": "ehtimal olunan konkret model adı, məs: Tiggo 7 Pro (bilinmirsə null)",
  "bodyType": "kuza tipi: SUV/Sedan/Hatchback (bilinmirsə null)",
  "engineHint": "ehtimal olunan mühərrik, məs: 1.5T (bilinmirsə null)",
  "suggestedCategories": ["bu model üçün ən çox lazım olan 3-4 hissə kateqoriyası, AZ dilində"],
  "confidence": "high/medium/low",
  "aiNote": "qısa qeyd (1 cümlə, AZ dilində)"
}`;

  try {
    const msg = await getClient().messages.create({
      model: MODEL,
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
    let clean = text.replace(/```json\s*|\s*```/g, "").trim();
    const first = clean.indexOf("{"), last = clean.lastIndexOf("}");
    if (first !== -1 && last !== -1) clean = clean.slice(first, last + 1);
    const ai = JSON.parse(clean);

    return {
      ...parsed,
      model: ai.model || undefined,
      bodyType: ai.bodyType || undefined,
      engineHint: ai.engineHint || undefined,
      suggestedCategories: Array.isArray(ai.suggestedCategories) ? ai.suggestedCategories : [],
      confidence: ai.confidence ?? "medium",
      aiNote: ai.aiNote || undefined,
    };
  } catch {
    // AI uğursuz olsa, deterministik nəticə qalır
    return { ...parsed, confidence: parsed.brand ? "medium" : "low", aiNote: "AI təxmini alınmadı" };
  }
}
