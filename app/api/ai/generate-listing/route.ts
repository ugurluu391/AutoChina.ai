import { NextRequest } from "next/server";
import { z } from "zod";
import { generateListingStream, parseListingJson, type ListingInput } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const inputSchema = z.object({
  productName: z.string().min(2, "Məhsul adı ən azı 2 simvol").max(120),
  brand: z.string().max(60).optional(),
  carModel: z.string().max(80).optional(),
  year: z.string().max(10).optional(),
});

export async function POST(req: NextRequest) {
  // Auth (opsional — anonim də istifadə edə bilər, amma rate limit var)
  const session = await auth().catch(() => null);
  const userId = session?.user?.id;

  // Rate limit
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const rl = rateLimit(`ai-listing:${userId ?? ip}`, 15, 60_000);
  if (!rl.success) {
    return new Response(JSON.stringify({ error: "Çox sorğu. Bir dəqiqə gözləyin." }), { status: 429 });
  }

  // Validation
  let body: ListingInput;
  try {
    const json = await req.json();
    const parsed = inputSchema.safeParse(json);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), { status: 400 });
    }
    body = parsed.data;
  } catch {
    return new Response(JSON.stringify({ error: "Yanlış sorğu" }), { status: 400 });
  }

  const started = Date.now();
  let fullText = "";

  // Streaming cavab — typing effekti üçün
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generateListingStream(body)) {
          fullText += chunk;
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();

        // Log (fire-and-forget, cavabı bloklamadan)
        const result = parseListingJson(fullText);
        prisma.aiGenerationLog.create({
          data: {
            userId: userId ?? null,
            productName: body.productName,
            brand: body.brand ?? null,
            carModel: body.carModel ?? null,
            year: body.year ?? null,
            title: result.title || null,
            description: result.description || null,
            salesPitch: result.salesPitch || null,
            hashtags: result.hashtags,
            keywords: result.keywords,
            model: process.env.AI_MODEL || "claude-sonnet-4-20250514",
            provider: "anthropic",
            durationMs: Date.now() - started,
            success: true,
          },
        }).catch(() => { /* DB yoxdursa log atlanır */ });
      } catch (err) {
        const message = err instanceof Error ? err.message : "AI xətası";
        controller.enqueue(encoder.encode(JSON.stringify({ __error: message })));
        controller.close();

        prisma.aiGenerationLog.create({
          data: {
            userId: userId ?? null,
            productName: body.productName,
            brand: body.brand ?? null,
            carModel: body.carModel ?? null,
            year: body.year ?? null,
            hashtags: [],
            keywords: [],
            provider: "anthropic",
            durationMs: Date.now() - started,
            success: false,
            error: message,
          },
        }).catch(() => {});
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
