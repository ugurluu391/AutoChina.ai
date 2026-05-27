import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  messageId: z.string(),
  reaction: z.enum(["up", "down"]).nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const { messageId, reaction } = schema.parse(await req.json());
    await prisma.chatMessage.update({
      where: { id: messageId },
      data: { reaction: reaction === "up" ? "👍" : reaction === "down" ? "👎" : null },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
