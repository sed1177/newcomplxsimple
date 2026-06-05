"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MessageSquare, CheckCheck, AlertTriangle, Bell, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate } from "@/lib/utils";

type FeedbackType = "feedback" | "warning" | "notice" | undefined;

function typeStyle(type: FeedbackType) {
  if (type === "warning") return { accent: "#F59E0B", label: "Warning",  icon: AlertTriangle, iconBg: "#F59E0B" };
  if (type === "notice")  return { accent: "#06B6D4", label: "Notice",   icon: Bell,          iconBg: "#06B6D4" };
  return                         { accent: "#2563EB", label: "Feedback", icon: MessageSquare, iconBg: "#2563EB" };
}

const VISIBLE_COUNT = 4;

export function FeedbackInbox() {
  const feedback   = useQuery(api.feedback.getMyFeedback);
  const markRead   = useMutation(api.feedback.markRead);
  const markAllRead = useMutation(api.feedback.markAllRead);

  const [expanded, setExpanded] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  if (!feedback) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="card h-16 animate-pulse" style={{ background: "var(--surface-2)" }} />
        ))}
      </div>
    );
  }

  const nonWarnings = [...feedback.filter((f) => f.type !== "warning")]
    .sort((a, b) => b.createdAt - a.createdAt); // newest first

  if (nonWarnings.length === 0) {
    return (
      <div className="card p-8 text-center">
        <MessageSquare size={32} className="mx-auto mb-3 opacity-20" style={{ color: "var(--text-muted)" }} />
        <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>No messages yet</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Cassandra will send feedback and notices here.
        </p>
      </div>
    );
  }

  const unreadCount = nonWarnings.filter((f) => !f.isRead).length;
  const visible     = nonWarnings.slice(0, VISIBLE_COUNT);
  const hidden      = nonWarnings.slice(VISIBLE_COUNT);
  const hasMore     = hidden.length > 0;

  function handleToggle() {
    setExpanded((prev) => {
      if (prev) {
        // Collapsing — scroll back up to the top of this section
        moreRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      return !prev;
    });
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "#2563EB18", color: "#2563EB" }}
          >
            {unreadCount} unread
          </span>
          <button
            onClick={() => markAllRead()}
            className="flex items-center gap-1.5 text-xs font-medium hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-muted)" }}
          >
            <CheckCheck size={13} /> Mark all read
          </button>
        </div>
      )}

      {/* Always-visible first 4 */}
      <div className="space-y-2" ref={moreRef}>
        {visible.map((item) => (
          <FeedbackCard
            key={item._id}
            item={item}
            onRead={() => !item.isRead && markRead({ feedbackId: item._id })}
          />
        ))}
      </div>

      {/* Expandable extra cards */}
      {hasMore && (
        <>
          <div
            className="overflow-hidden transition-all duration-500 ease-in-out space-y-2"
            style={{ maxHeight: expanded ? `${hidden.length * 200}px` : "0px", opacity: expanded ? 1 : 0 }}
          >
            {hidden.map((item) => (
              <FeedbackCard
                key={item._id}
                item={item}
                onRead={() => !item.isRead && markRead({ feedbackId: item._id })}
              />
            ))}
          </div>

          {/* See more / see less toggle */}
          <button
            onClick={handleToggle}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            {expanded ? (
              <><ChevronUp size={15} /> Show less</>
            ) : (
              <><ChevronDown size={15} /> See {hidden.length} more message{hidden.length !== 1 ? "s" : ""}</>
            )}
          </button>
        </>
      )}
    </div>
  );
}

// ── Individual card ───────────────────────────────────────────────────────────

function FeedbackCard({
  item,
  onRead,
}: {
  item: { _id: string; type?: string; isRead: boolean; createdAt: number; message: string; acknowledgedAt?: number };
  onRead: () => void;
}) {
  const { accent, label, icon: Icon, iconBg } = typeStyle(item.type as FeedbackType);

  return (
    <div
      onClick={onRead}
      className="rounded-2xl transition-all hover:shadow-sm"
      style={{
        background: "var(--surface)",
        border: `1px solid ${item.isRead ? "var(--border)" : accent + "55"}`,
        borderLeft: `4px solid ${item.isRead ? "var(--border)" : accent}`,
        cursor: item.isRead ? "default" : "pointer",
        padding: "14px 16px",
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: iconBg + "20" }}
          >
            <Icon size={13} style={{ color: iconBg }} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold" style={{ color: accent }}>{label}</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>from Cassandra</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {formatDate(item.createdAt)}
          </span>
          {!item.isRead && (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: accent }}
            />
          )}
        </div>
      </div>

      {/* Message */}
      <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
        {item.message}
      </p>

      {/* Footer */}
      {!item.isRead && (
        <p className="text-xs mt-2 font-medium" style={{ color: accent + "99" }}>
          Tap to mark as read
        </p>
      )}
      {item.acknowledgedAt && (
        <p className="text-xs mt-2 font-medium" style={{ color: "var(--text-muted)" }}>
          ✓ Acknowledged {formatDate(item.acknowledgedAt as number)}
        </p>
      )}
    </div>
  );
}
