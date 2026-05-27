import Anthropic from "@anthropic-ai/sdk";
import { getProducts } from "@/lib/queries/products";
import { formatPrice } from "@/lib/utils";

/**
 * AI Müştəri Köməkçisi — Claude tool use (function calling) ilə.
 * Real DB-dən məhsul axtarır, çoxdilli (AZ/RU/EN) cavab verir.
 * ⚠️ Server-only.
 */

const MODEL = process.env.AI_MODEL || "claude-sonnet-4-20250514";

export type ChatMsg = { role: "user" | "assistant"; content: string };
export type Lang = "az" | "ru" | "en";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY təyin edilməyib");
    client = new Anthropic({ apiKey });
  }
  return client;
}

const SYSTEM_PROMPTS: Record<Lang, string> = {
  az: `Sən "AutoChina AI" platformasının müştəri köməkçisisən — Azərbaycanda Çin avtomobil ehtiyat hissələri marketplace-i. Vəzifən: məhsul suallarını cavablandırmaq, hissə tövsiyə etmək, alternativ təklif etmək, satıcılar haqqında məlumat vermək, FAQ cavablandırmaq.

QAYDALAR:
- Həmişə Azərbaycan dilində, səmimi və peşəkar cavab ver.
- Məhsul axtarmaq lazım olduqda search_products alətindən istifadə et.
- Konkret məhsul tapanda adını, qiymətini və markasını qeyd et.
- Qısa, aydın cavablar ver. Uydurma məhsul və qiymət demə — yalnız alətdən gələn real datadan istifadə et.
- Hissə tapılmasa, alternativ axtarış təklif et.`,
  ru: `Ты — помощник клиентов платформы "AutoChina AI", маркетплейса запчастей для китайских автомобилей в Азербайджане. Твоя задача: отвечать на вопросы о товарах, рекомендовать запчасти, предлагать альтернативы, давать информацию о продавцах, отвечать на FAQ.

ПРАВИЛА:
- Всегда отвечай на русском языке, дружелюбно и профессионально.
- Используй инструмент search_products для поиска товаров.
- Указывай название, цену и марку найденных товаров.
- Давай краткие, ясные ответы. Не выдумывай товары и цены — используй только реальные данные из инструмента.`,
  en: `You are the customer assistant for "AutoChina AI", a Chinese auto parts marketplace in Azerbaijan. Your job: answer product questions, recommend parts, suggest alternatives, provide seller info, answer FAQs.

RULES:
- Always reply in English, friendly and professional.
- Use the search_products tool when you need to find products.
- Mention the name, price, and brand of found products.
- Keep answers concise. Never invent products or prices — only use real data from the tool.`,
};

const tools: Anthropic.Tool[] = [
  {
    name: "search_products",
    description: "Marketplace-də məhsul axtarır. İstifadəçi hissə, marka və ya model haqqında soruşduqda istifadə et.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Axtarış sözü (hissə adı, marka, model)" },
        brand: { type: "string", description: "Marka slug-ı, məs: 'chery', 'byd' (opsional)" },
      },
      required: ["query"],
    },
  },
];

/** Tool çağırışını icra edir — real DB axtarışı */
async function runTool(name: string, input: Record<string, unknown>): Promise<string> {
  if (name === "search_products") {
    try {
      const { products } = await getProducts({
        q: String(input.query ?? ""),
        brand: input.brand ? String(input.brand) : undefined,
        perPage: 5,
      });
      if (!products.length) return JSON.stringify({ found: 0, message: "Heç bir məhsul tapılmadı" });
      return JSON.stringify({
        found: products.length,
        products: products.map((p) => ({
          title: p.title, brand: p.brandName, model: p.carModel,
          price: formatPrice(p.price), condition: p.condition, slug: p.slug, inStock: p.inStock,
        })),
      });
    } catch {
      return JSON.stringify({ found: 0, message: "Axtarış mümkün olmadı" });
    }
  }
  return JSON.stringify({ error: "naməlum alət" });
}

/**
 * Chat cavabı (streaming). Tool use loop-u idarə edir:
 * model tool çağırırsa, icra edib nəticəni geri verir, sonra final cavabı stream edir.
 * Generator həm mətn parçaları, həm də sonda token sayını verir.
 */
export async function* chatStream(
  messages: ChatMsg[],
  language: Lang = "az"
): AsyncGenerator<{ type: "text"; value: string } | { type: "done"; tokens: number }> {
  const anthropic = getClient();
  const convo: Anthropic.MessageParam[] = messages.map((m) => ({ role: m.role, content: m.content }));
  let totalTokens = 0;

  // Tool use loop (maks 3 iterasiya)
  for (let i = 0; i < 3; i++) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPTS[language],
      tools,
      messages: convo,
    });
    totalTokens += (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);

    // Tool çağırışı varmı?
    const toolUses = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");

    if (toolUses.length === 0) {
      // Final mətn cavabı — stream et
      const text = response.content.map((b) => (b.type === "text" ? b.text : "")).join("");
      // Hərf-hərf yield (typing effekti)
      for (const ch of text) yield { type: "text", value: ch };
      yield { type: "done", tokens: totalTokens };
      return;
    }

    // Tool-ları icra et və nəticəni geri ver
    convo.push({ role: "assistant", content: response.content });
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const tu of toolUses) {
      const result = await runTool(tu.name, tu.input as Record<string, unknown>);
      toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: result });
    }
    convo.push({ role: "user", content: toolResults });
  }

  yield { type: "done", tokens: totalTokens };
}
