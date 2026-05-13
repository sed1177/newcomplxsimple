"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Zap, ShieldCheck, Cpu, Sparkles } from "lucide-react";

const STARK_MESSAGES = [
  {
    id: 1,
    text: "Hey! I'm Stark — your AI learning assistant, built exclusively for ComplxSimple. I know this entire course inside and out.",
  },
  {
    id: 2,
    text: "Ask me anything about Hardware, AI, Cybersecurity, HTML, or Linux. I can break down concepts, quiz you on lessons you've already taken, help you prep for certs, or just vibe through a Tech question at 2am.",
  },
  {
    id: 3,
    text: "I was built with intention. Unlike most AI, I'm trained on truthful, accurate data that reflects Black and Brown people in tech — reducing AI bias from the ground up, not as an afterthought.",
  },
  {
    id: 4,
    text: "I'm fast, I'm safe, and I'm tuned to your exact course content. No hallucinations about random topics — just focused, reliable help for your ComplxSimple journey. 🚀",
  },
];

const FEATURES = [
  { icon: Zap,         label: "Lightning fast",      desc: "Sub-second responses, always available" },
  { icon: ShieldCheck, label: "Safe & private",       desc: "Your questions stay between you and Stark" },
  { icon: Cpu,         label: "Course-tuned",         desc: "Fine-tuned on every lesson in ComplxSimple" },
  { icon: Sparkles,    label: "Bias-aware",           desc: "Trained on diverse, accurate data from day one" },
];

export default function StarkPage() {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div
      className="flex flex-col"
      style={{ height: "calc(100vh - 56px)", background: "var(--bg)" }}
    >
      {/* ── Top bar ── */}
      <div
        className="flex-shrink-0 border-b px-4 sm:px-6 py-3 flex items-center justify-between"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white"
            style={{
              background: "linear-gradient(135deg, #0d4f4a, #14B8A6)",
              boxShadow: "0 0 16px rgba(20,184,166,0.35)",
              fontFamily: "var(--font-stark)",
              fontSize: "16px",
            }}
          >
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="font-black text-base tracking-wide"
                style={{ fontFamily: "var(--font-stark)", color: "var(--text)" }}
              >
                STARK
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "#14B8A610",
                  color: "#14B8A6",
                  border: "1px solid #14B8A630",
                  fontFamily: "var(--font-stark)",
                  letterSpacing: "0.08em",
                }}
              >
                COMING SOON
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              AI assistant · ComplxSimple
            </p>
          </div>
        </div>

        {/* Feature pills — desktop only */}
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

        {/* Feature cards — mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2 lg:hidden">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="card p-3 flex flex-col items-center text-center gap-1.5"
            >
              <f.icon size={16} style={{ color: "#14B8A6" }} />
              <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{f.label}</p>
              <p className="text-xs leading-tight" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stark chat bubbles */}
        {STARK_MESSAGES.map((msg, i) => (
          <div key={msg.id} className="flex items-start gap-3">
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white text-xs mt-0.5"
              style={{
                background: "linear-gradient(135deg, #0d4f4a, #14B8A6)",
                fontFamily: "var(--font-stark)",
                boxShadow: "0 0 10px rgba(20,184,166,0.25)",
              }}
            >
              S
            </div>

            {/* Bubble */}
            <div
              className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                animationDelay: `${i * 120}ms`,
              }}
            >
              <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                {msg.text}
              </p>
            </div>
          </div>
        ))}

        {/* Coming soon card */}
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white text-xs mt-0.5"
            style={{
              background: "linear-gradient(135deg, #0d4f4a, #14B8A6)",
              fontFamily: "var(--font-stark)",
              boxShadow: "0 0 10px rgba(20,184,166,0.25)",
            }}
          >
            S
          </div>
          <div
            className="rounded-2xl rounded-tl-sm px-4 py-4 max-w-[85%] space-y-3"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
              I&apos;m not live yet — but I&apos;m being trained right now on everything ComplxSimple.
              Sign up and you&apos;ll be notified the moment I launch. 👀
            </p>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
              style={{
                background: "#14B8A610",
                color: "#14B8A6",
                border: "1px solid #14B8A630",
                fontFamily: "var(--font-stark)",
                letterSpacing: "0.06em",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#14B8A6" }} />
              TRAINING IN PROGRESS · LAUNCHING SOON
            </div>
          </div>
        </div>

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div
        className="flex-shrink-0 px-4 sm:px-6 pb-4 pt-2"
        style={{ background: "var(--bg)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
          >
            {/* Text row */}
            <div className="flex items-center px-4 pt-3 pb-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hey there!"
                rows={1}
                disabled
                className="flex-1 resize-none bg-transparent outline-none text-sm"
                style={{
                  color: "var(--text)",
                  cursor: "not-allowed",
                  lineHeight: "1.5",
                  minHeight: "24px",
                  maxHeight: "96px",
                }}
              />
            </div>
            {/* Action row */}
            <div className="flex items-center justify-between px-3 pb-2.5">
              <button
                disabled
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{ background: "var(--surface-2)", cursor: "not-allowed", border: "1px solid var(--border)" }}
              >
                <span style={{ color: "var(--text-muted)", fontSize: "16px", lineHeight: 1 }}>+</span>
              </button>

              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)", cursor: "not-allowed" }}
                >
                  <span style={{ fontFamily: "var(--font-stark)", fontSize: "10px", color: "#14B8A6" }}>S</span>
                  Stark·1
                </div>
                <button
                  disabled
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--surface-2)", cursor: "not-allowed", border: "1px solid var(--border)" }}
                >
                  <Send size={13} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
            </div>
          </div>
          <p className="text-center text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Stark is coming soon — responses are disabled during training
          </p>
        </div>
      </div>
    </div>
  );
}
