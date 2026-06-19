"use client";

import { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Send, Zap, ShieldCheck, Cpu, Sparkles } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hey! I'm Stark — your AI learning assistant for ComplxSimple. Ask me anything about your lessons, the crosswords, homework, or any tech concept in Hardware, AI, Cybersecurity, HTML, or Linux. What can I help you with?",
};

const SUGGESTIONS = [
  "What tracks can I learn?",
  "How do the crosswords work?",
  "Explain what a CPU does",
  "What is the CIA triad?",
];

const FEATURES = [
  { icon: Zap,         label: "Lightning fast" },
  { icon: ShieldCheck, label: "Safe & private" },
  { icon: Cpu,         label: "Course-tuned" },
  { icon: Sparkles,    label: "Bias-aware" },
];

const STARK_GRADIENT = "linear-gradient(135deg, #0d4f4a, #14B8A6)";

function StarkAvatar() {
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white text-xs mt-0.5"
      style={{ background: STARK_GRADIENT, fontFamily: "var(--font-stark)", boxShadow: "0 0 10px rgba(20,184,166,0.25)" }}
    >
      S
    </div>
  );
}

export default function StarkPage() {
  const sendMessage = useAction(api.chat.sendMessage);

  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const reply = await sendMessage({
        messages: next.map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setError("Stark had trouble responding. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "24px";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 56px)", background: "var(--bg)" }}>
      {/* ── Top bar ── */}
      <div
        className="flex-shrink-0 border-b px-4 sm:px-6 py-3 flex items-center justify-between"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white"
            style={{ background: STARK_GRADIENT, boxShadow: "0 0 16px rgba(20,184,166,0.35)", fontFamily: "var(--font-stark)", fontSize: "16px" }}
          >
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-wide" style={{ fontFamily: "var(--font-stark)", color: "var(--text)" }}>
                STARK
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: "#14B8A610", color: "#14B8A6", border: "1px solid #14B8A630", fontFamily: "var(--font-stark)", letterSpacing: "0.08em" }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#14B8A6" }} />
                LIVE
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              AI assistant · ComplxSimple
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
            >
              <f.icon size={11} style={{ color: "#14B8A6" }} />
              {f.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5 max-w-3xl w-full mx-auto">
        {messages.map((msg, i) =>
          msg.role === "assistant" ? (
            <div key={i} className="flex items-start gap-3">
              <StarkAvatar />
              <div
                className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text)" }}>
                  {msg.content}
                </p>
              </div>
            </div>
          ) : (
            <div key={i} className="flex items-start gap-3 justify-end">
              <div
                className="rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]"
                style={{ background: STARK_GRADIENT, color: "#fff" }}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          )
        )}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <StarkAvatar />
            <div
              className="rounded-2xl rounded-tl-sm px-4 py-4 flex items-center gap-1.5"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: "#14B8A6", animationDelay: `${d * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Suggestions — only on the very first screen */}
        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2 pt-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-xs font-medium px-3 py-2 rounded-full transition-all hover:scale-105"
                style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3">
            <StarkAvatar />
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]" style={{ background: "#EF444415", border: "1px solid #EF444433" }}>
              <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="flex-shrink-0 px-4 sm:px-6 pb-4 pt-2" style={{ background: "var(--bg)" }}>
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
          >
            <div className="flex items-center px-4 pt-3 pb-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hey there! Ask Stark anything..."
                rows={1}
                className="flex-1 resize-none bg-transparent outline-none text-sm"
                style={{ color: "var(--text)", lineHeight: "1.5", minHeight: "24px", maxHeight: "120px" }}
              />
            </div>
            <div className="flex items-center justify-between px-3 pb-2.5">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                <span style={{ fontFamily: "var(--font-stark)", fontSize: "10px", color: "#14B8A6" }}>S</span>
                Stark·1
              </div>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 disabled:cursor-not-allowed"
                style={{
                  background: input.trim() && !loading ? STARK_GRADIENT : "var(--surface-2)",
                  border: "1px solid var(--border)",
                  opacity: input.trim() && !loading ? 1 : 0.6,
                }}
              >
                <Send size={14} style={{ color: input.trim() && !loading ? "#fff" : "var(--text-muted)" }} />
              </button>
            </div>
          </div>
          <p className="text-center text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Stark can make mistakes. Double-check important info with Cassandra.
          </p>
        </div>
      </div>
    </div>
  );
}
