"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Send, Zap, ShieldCheck, Cpu, Sparkles,
  SquarePen, Trash2, MessageSquare, Menu, X,
} from "lucide-react";

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
  const sendMessage  = useAction(api.chat.sendMessage);
  const conversations = useQuery(api.conversations.list);
  const deleteConvo  = useMutation(api.conversations.deleteConversation);

  const [activeConvoId, setActiveConvoId] = useState<Id<"starkConversations"> | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deletingId, setDeletingId]   = useState<Id<"starkConversations"> | null>(null);

  const dbMessages = useQuery(
    api.conversations.getMessages,
    activeConvoId ? { conversationId: activeConvoId } : "skip"
  );

  const bottomRef  = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // When a conversation is selected, load its messages from DB
  useEffect(() => {
    if (!dbMessages) return;
    if (dbMessages.length === 0) {
      setMessages([GREETING]);
    } else {
      setMessages(dbMessages.map((m) => ({ role: m.role, content: m.content })));
    }
  }, [dbMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "24px";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  const startNewChat = useCallback(() => {
    setActiveConvoId(null);
    setMessages([GREETING]);
    setInput("");
    setError(null);
    setSidebarOpen(false);
  }, []);

  const loadConversation = useCallback((id: Id<"starkConversations">) => {
    setActiveConvoId(id);
    setError(null);
    setSidebarOpen(false);
  }, []);

  async function handleDelete(id: Id<"starkConversations">, e: React.MouseEvent) {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteConvo({ conversationId: id });
      if (activeConvoId === id) startNewChat();
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSend(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    // Optimistically add the user message
    const history = messages.filter((m) => m.content !== GREETING.content);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const { reply, conversationId } = await sendMessage({
        conversationId: activeConvoId ?? undefined,
        userText: text,
        history,
      });
      if (!activeConvoId) setActiveConvoId(conversationId);
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

  // ── Sidebar ──────────────────────────────────────────────────────────────

  const Sidebar = (
    <aside
      className="flex flex-col h-full"
      style={{ background: "var(--surface)", borderRight: "1px solid var(--border)", width: "100%" }}
    >
      {/* Logo + close (mobile) */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs"
            style={{ background: STARK_GRADIENT, fontFamily: "var(--font-stark)" }}
          >
            S
          </div>
          <span className="font-black text-sm tracking-wide" style={{ fontFamily: "var(--font-stark)", color: "var(--text)" }}>
            STARK
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={15} />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-3 pb-3">
        <button
          onClick={startNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
          style={{ background: "#14B8A615", color: "#14B8A6", border: "1px solid #14B8A630" }}
        >
          <SquarePen size={15} />
          New Chat
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {!conversations || conversations.length === 0 ? (
          <p className="text-xs text-center py-6 px-3" style={{ color: "var(--text-muted)" }}>
            No conversations yet. Start chatting!
          </p>
        ) : (
          conversations.map((convo) => {
            const isActive = convo._id === activeConvoId;
            return (
              <div
                key={convo._id}
                onClick={() => loadConversation(convo._id)}
                className="group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                style={{
                  background: isActive ? "#14B8A615" : "transparent",
                  border: isActive ? "1px solid #14B8A630" : "1px solid transparent",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--surface-2)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <MessageSquare
                  size={13}
                  className="flex-shrink-0"
                  style={{ color: isActive ? "#14B8A6" : "var(--text-muted)" }}
                />
                <span
                  className="flex-1 text-xs truncate"
                  style={{ color: isActive ? "var(--text)" : "var(--text-muted)" }}
                >
                  {convo.title}
                </span>
                <button
                  onClick={(e) => handleDelete(convo._id, e)}
                  disabled={deletingId === convo._id}
                  className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "#EF4444" }}
                >
                  {deletingId === convo._id
                    ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    : <Trash2 size={12} />
                  }
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Feature pills */}
      <div className="px-3 pb-4 pt-2 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
        {FEATURES.map((f) => (
          <div key={f.label} className="flex items-center gap-2 px-2 py-1">
            <f.icon size={11} style={{ color: "#14B8A6" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{f.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );

  // ── Main chat area ────────────────────────────────────────────────────────

  const activeTitle = conversations?.find((c) => c._id === activeConvoId)?.title;

  return (
    <div className="flex" style={{ height: "calc(100vh - 56px)", overflow: "hidden" }}>

      {/* ── Desktop sidebar ── */}
      <div className="hidden md:flex flex-col flex-shrink-0" style={{ width: "240px" }}>
        {Sidebar}
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 flex flex-col" style={{ width: "280px", height: "100%" }}>
            {Sidebar}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: "var(--bg)" }}>

        {/* Top bar */}
        <div
          className="flex-shrink-0 border-b px-4 py-3 flex items-center justify-between"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <Menu size={15} style={{ color: "var(--text-muted)" }} />
            </button>

            <div>
              <p className="text-sm font-semibold truncate max-w-[200px] sm:max-w-none" style={{ color: "var(--text)" }}>
                {activeTitle ?? "New Conversation"}
              </p>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-xs font-bold flex items-center gap-1"
                  style={{ color: "#14B8A6", fontFamily: "var(--font-stark)", letterSpacing: "0.08em" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#14B8A6" }} />
                  LIVE
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>· AI assistant</span>
              </div>
            </div>
          </div>

          {/* New chat (desktop shortcut) */}
          <button
            onClick={startNewChat}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: "#14B8A615", color: "#14B8A6", border: "1px solid #14B8A630" }}
          >
            <SquarePen size={13} /> New Chat
          </button>
        </div>

        {/* Messages */}
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

          {/* Suggestion chips — only on a fresh chat */}
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

        {/* ── Input bar (unchanged) ── */}
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
    </div>
  );
}
