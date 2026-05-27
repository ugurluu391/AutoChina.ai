"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Lang = "az" | "ru" | "en";
type Msg = { id: string; role: "user" | "assistant"; content: string; reaction?: "up" | "down" | null };

const STRINGS: Record<Lang, { greeting: string; placeholder: string; title: string; subtitle: string }> = {
  az: { greeting: "Salam! 👋 Mən AutoChina AI köməkçisiyəm. Maşınının modelini de — uyğun hissəni tapım.", placeholder: "Sualını yaz...", title: "AI Köməkçi", subtitle: "Adətən dərhal cavab verir" },
  ru: { greeting: "Привет! 👋 Я AI-помощник AutoChina. Назови модель авто — найду нужную запчасть.", placeholder: "Напишите вопрос...", title: "AI Помощник", subtitle: "Обычно отвечает сразу" },
  en: { greeting: "Hi! 👋 I'm the AutoChina AI assistant. Tell me your car model — I'll find the right part.", placeholder: "Type your question...", title: "AI Assistant", subtitle: "Usually replies instantly" },
};

function AiAvatar({ size = 32 }: { size?: number }) {
  return (
    <span className="rounded-[9px] bg-grad-accent grid place-items-center shrink-0 shadow-[0_0_12px_rgba(34,211,238,.4)]" style={{ width: size, height: size }}>
      <Sparkles size={size * 0.5} className="text-[#04121a]" />
    </span>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-content-muted animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("az");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = STRINGS[lang];

  // İlk açılışda salamlama
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: "greet", role: "assistant", content: t.greeting }]);
    }
  }, [open]); // eslint-disable-line

  // Avtomatik scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");

    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", content: text };
    const aiId = `a-${Date.now()}`;
    setMessages((m) => [...m, userMsg, { id: aiId, role: "assistant", content: "" }]);
    setStreaming(true);

    const history = messages.filter((m) => m.id !== "greet").map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text, language: lang, history }),
      });
      if (!res.ok) throw new Error("xəta");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      let metaParsed = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        let chunk = decoder.decode(value, { stream: true });

        // İlk sətir meta (sessionId)
        if (!metaParsed && chunk.includes("__meta")) {
          const nl = chunk.indexOf("\n");
          try {
            const meta = JSON.parse(chunk.slice(0, nl));
            if (meta.__meta?.sessionId) setSessionId(meta.__meta.sessionId);
          } catch { /* ignore */ }
          chunk = chunk.slice(nl + 1);
          metaParsed = true;
        }
        if (chunk.includes("__error")) { acc = "Üzr istəyirəm, xəta baş verdi. Yenidən cəhd edin."; break; }

        acc += chunk;
        setMessages((m) => m.map((msg) => (msg.id === aiId ? { ...msg, content: acc } : msg)));
      }
    } catch {
      setMessages((m) => m.map((msg) => (msg.id === aiId ? { ...msg, content: "Bağlantı xətası. Yenidən cəhd edin." } : msg)));
    } finally {
      setStreaming(false);
    }
  };

  const react = async (id: string, reaction: "up" | "down") => {
    setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, reaction: msg.reaction === reaction ? null : reaction } : msg)));
    // DB-yə yaz (real message ID-si serverdə fərqlidir, sadəlik üçün burada yalnız UI; tam inteqrasiya üçün ID map saxlanıla bilər)
    fetch("/api/ai/chat/react", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: id, reaction }),
    }).catch(() => {});
  };

  return (
    <>
      {/* Floating düymə */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full grid place-items-center shadow-[0_8px_30px_-4px_rgba(34,211,238,.5)] transition-all duration-300 hover:scale-105",
          open ? "bg-surface-2 border border-[var(--border)]" : "bg-grad-accent"
        )}
        aria-label="AI Köməkçi"
      >
        {open ? <X size={22} className="text-content" /> : <MessageCircle size={24} className="text-[#04121a]" />}
        {!open && <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-[var(--success)] border-2 border-bg-900" />}
      </button>

      {/* Çat pəncərəsi */}
      {open && (
        <div className="fixed z-[59] bottom-[88px] right-5 left-5 sm:left-auto sm:w-[400px] h-[min(620px,75vh)] rounded-[var(--radius)] bg-bg-800 border border-[var(--border)] backdrop-blur-[18px] shadow-glow flex flex-col overflow-hidden animate-rise">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-[var(--border)] bg-[linear-gradient(135deg,rgba(34,211,238,.08),rgba(168,85,247,.08))]">
            <AiAvatar size={38} />
            <div className="flex-1 min-w-0">
              <div className="font-display font-semibold text-sm">{t.title}</div>
              <div className="text-[11px] text-content-muted flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" /> {t.subtitle}
              </div>
            </div>
            {/* Dil seçimi */}
            <div className="flex gap-1 bg-surface rounded-lg p-0.5 border border-[var(--border)]">
              {(["az", "ru", "en"] as Lang[]).map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className={cn("px-2 py-1 rounded-md text-[11px] font-semibold uppercase transition-colors", lang === l ? "bg-grad-accent text-[#04121a]" : "text-content-muted hover:text-content")}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Mesajlar */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "")}>
                {msg.role === "assistant" && <AiAvatar size={28} />}
                <div className={cn("max-w-[78%]", msg.role === "user" ? "items-end" : "")}>
                  <div className={cn(
                    "px-3.5 py-2.5 rounded-[14px] text-sm leading-relaxed whitespace-pre-wrap break-words",
                    msg.role === "user"
                      ? "bg-[rgba(34,211,238,.12)] border border-[rgba(34,211,238,.25)] text-content"
                      : "bg-surface border border-[var(--border)] text-content-dim"
                  )}>
                    {msg.content || (streaming ? <TypingDots /> : "")}
                  </div>
                  {/* Reaksiyalar (yalnız AI cavabları, salamlamadan başqa) */}
                  {msg.role === "assistant" && msg.id !== "greet" && msg.content && (
                    <div className="flex gap-1 mt-1.5 ml-1">
                      <button onClick={() => react(msg.id, "up")} className={cn("p-1 rounded-md transition-colors", msg.reaction === "up" ? "text-[var(--success)]" : "text-content-muted hover:text-content")}>
                        <ThumbsUp size={13} />
                      </button>
                      <button onClick={() => react(msg.id, "down")} className={cn("p-1 rounded-md transition-colors", msg.reaction === "down" ? "text-red-400" : "text-content-muted hover:text-content")}>
                        <ThumbsDown size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[var(--border)]">
            <div className="flex items-center gap-2 bg-surface border border-[var(--border)] rounded-[14px] px-3 py-1.5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                placeholder={t.placeholder}
                disabled={streaming}
                className="flex-1 bg-transparent outline-none text-content text-sm placeholder:text-content-muted min-w-0"
              />
              <button onClick={send} disabled={streaming || !input.trim()}
                className="w-8 h-8 rounded-[10px] bg-grad-accent grid place-items-center shrink-0 disabled:opacity-40 transition-opacity">
                {streaming ? <Loader2 size={15} className="text-[#04121a] animate-spin" /> : <Send size={15} className="text-[#04121a]" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
