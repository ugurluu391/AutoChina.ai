import Anthropic from "@anthropic-ai/sdk";

/**
 * AI Elan Generator — Claude API inteqrasiyası.
 * ⚠️ Yalnız server-də işləyir (API açarı sızmamalıdır).
 *
 * Provider dəyişdirmək üçün: OpenAI istifadə etmək istəyirsənsə,
 * `generateListingStream` daxilindəki Anthropic çağırışını OpenAI ilə əvəzlə.
 */

const MODEL = process.env.AI_MODEL || "claude-sonnet-4-20250514";

export type ListingInput = {
  productName: string;
  brand?: string;
  carModel?: string;
  year?: string;
};

export type ListingResult = {
  title: string;
  description: string;
  salesPitch: string;
  hashtags: string[];
  keywords: string[];
};

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY təyin edilməyib");
    client = new Anthropic({ apiKey });
  }
  return client;
}

/** Giriş parametrlərindən prompt qurur */
function buildPrompt(input: ListingInput): string {
  const parts = [
    `Məhsul adı: ${input.productName}`,
    input.brand && `Avtomobil markası: ${input.brand}`,
    input.carModel && `Model: ${input.carModel}`,
    input.year && `İl: ${input.year}`,
  ].filter(Boolean);

  return `Sən Azərbaycanda Çin avtomobil ehtiyat hissələri satan marketplace üçün peşəkar kontent yazıçısısan. Aşağıdakı hissə üçün satış elanı yarat.

${parts.join("\n")}

Aşağıdakı JSON formatında, YALNIZ Azərbaycan dilində cavab ver. Başqa heç nə yazma, yalnız etibarlı JSON:

{
  "title": "SEO optimizəli, 60 simvoldan qısa başlıq (marka + model + hissə adı daxil)",
  "description": "Peşəkar, 3-4 cümləlik məhsul təsviri (uyğunluq, keyfiyyət, fayda)",
  "salesPitch": "Qısa, cəlbedici 1-2 cümləlik satış mətni (təcili alış hissi yaradan)",
  "hashtags": ["#hashtag1", "#hashtag2", "...8 ədəd, Azərbaycan/marka əsaslı"],
  "keywords": ["açar söz 1", "açar söz 2", "...8 ədəd SEO açar sözü"]
}`;
}

/** Strukturlu nəticəni qaytarır (streaming olmadan) */
export async function generateListing(input: ListingInput): Promise<{ result: ListingResult; tokensUsed: number; model: string }> {
  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: buildPrompt(input) }],
  });

  const text = msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();

  const result = parseListingJson(text);
  const tokensUsed = (msg.usage?.input_tokens ?? 0) + (msg.usage?.output_tokens ?? 0);
  return { result, tokensUsed, model: MODEL };
}

/** Streaming generator — typing effekti üçün mətn parçaları verir */
export async function* generateListingStream(input: ListingInput): AsyncGenerator<string> {
  const stream = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: buildPrompt(input) }],
    stream: true,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

/** AI mətnindən JSON çıxarır (markdown fence-ləri təmizləyir) */
export function parseListingJson(text: string): ListingResult {
  let clean = text.replace(/```json\s*|\s*```/g, "").trim();
  // İlk { və son } arasını götür
  const first = clean.indexOf("{");
  const last = clean.lastIndexOf("}");
  if (first !== -1 && last !== -1) clean = clean.slice(first, last + 1);

  try {
    const parsed = JSON.parse(clean);
    return {
      title: String(parsed.title ?? ""),
      description: String(parsed.description ?? ""),
      salesPitch: String(parsed.salesPitch ?? ""),
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.map(String) : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String) : [],
    };
  } catch {
    // JSON parse alınmasa, ən azı təsvir kimi qaytar
    return { title: "", description: clean, salesPitch: "", hashtags: [], keywords: [] };
  }
}
