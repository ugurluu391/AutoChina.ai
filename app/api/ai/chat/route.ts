import { NextRequest } from "next/server";
import { z } from "zod";
import { chatStream, type ChatMsg, type Lang } from "@/lib/chat";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1).max(1000),
  language: z.enum(["az", "ru", "en"]).default("az"),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).max(20).default([]),
});

export async function POST(req: NextRequest) {
  const session = await auth().catch(() => null);
  const userId = session?.user?.id;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const rl = rateLimit(`chat:${userId ?? ip}`, 30, 60_000);
  if (!rl.success) return new Response(JSON.stringify({ error: "Çox sorğu, gözləyin." }), { status: 429 });

  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return new Response(JSON.stringify({ error: "Yanlış sorğu" }), { status: 400 });
  }

  // Session tap/yarat (DB varsa)
  let sessionId = data.sessionId;
  try {
    if (!sessionId) {
      const s = await prisma.chatSession.create({ data: { userId: userId ?? null, language: data.language } });
      sessionId = s.id;
    }
    // İstifadəçi mesajını saxla
    await prisma.chatMessage.create({
      data: { sessionId, role: "USER", content: data.message },
    });
  } catch {
    sessionId = sessionId ?? "ephemeral"; // DB yoxdursa keçici
  }

  const messages: ChatMsg[] = [...data.history, { role: "user", content: data.message }];

  const encoder = new TextEncoder();
  let assistantText = "";

  const stream = new ReadableStream({
    async start(controller) {
      // Session ID-ni ilk sətirdə meta kimi göndər
      controller.enqueue(encoder.encode(JSON.stringify({ __meta: { sessionId } }) + "\n"));
      try {
        for await (const ev of chatStream(messages, data.language as Lang)) {
          if (ev.type === "text") {
            assistantText += ev.value;
            controller.enqueue(encoder.encode(ev.value));
          } else if (ev.type === "done") {
            // AI cavabını və tokenləri saxla
            try {
              if (sessionId && sessionId !== "ephemeral") {
                await prisma.chatMessage.create({
                  data: { sessionId, role: "ASSISTANT", content: assistantText, tokensUsed: ev.tokens },
                });
                await prisma.chatSession.update({
                  where: { id: sessionId },
                  data: { totalTokens: { increment: ev.tokens }, language: data.language },
                });
              }
            } catch { /* DB yoxdursa atla */ }
          }
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "AI xətası";
        controller.enqueue(encoder.encode(JSON.stringify({ __error: msg })));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache", "X-Accel-Buffering": "no" },
  });
}
