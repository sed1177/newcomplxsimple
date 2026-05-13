"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MessageSquare, CheckCheck, Clock, AlertTriangle, Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";

type FeedbackType = "feedback" | "warning" | "notice" | undefined;

function typeStyle(type: FeedbackType, isRead: boolean) {
  if (type === "warning")  return { accent: "#F59E0B", bg: isRead ? "var(--surface)" : "#F59E0B08", label: "Warning",  icon: AlertTriangle };
  if (type === "notice")   return { accent: "#06B6D4", bg: isRead ? "var(--surface)" : "#06B6D408", label: "Notice",   icon: Bell };
  return                          { accent: "#2563EB", bg: isRead ? "var(--surface)" : "#2563EB08", label: "Feedback", icon: MessageSquare };
}

export function FeedbackInbox() {
  const feedback = useQuery(api.feedback.getMyFeedback);
  const markRead = useMutation(api.feedback.markRead);
  const markAllRead = useMutation(api.feedback.markAllRead);

  if (!feedback) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="card h-16 animate-pulse" style={{ background: "var(--surface-2)" }} />
        ))}
      </div>
    );
  }

  // Filter out warnings — they're shown separately as banners above the dashboard
  const nonWarnings = feedback.filter((f) => f.type !== "warning");

  if (nonWarnings.length === 0) {
    return (
      <div className="card p-8 text-center">
        <MessageSquare size={32} className="mx-auto mb-3 opacity-25" />
        <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>No messages yet</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Cassandra will send feedback and notices here.
        </p>
      </div>
    );
  }

  const unreadCount = nonWarnings.filter((f) => !f.isRead).length;

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#2563EB22", color: "#2563EB" }}>
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

      {nonWarnings.map((item) => {
        const { accent, bg, label, icon: Icon } = typeStyle(item.type as FeedbackType, item.isRead);
        return (
          <div
            key={item._id}
            onClick={() => !item.isRead && markRead({ feedbackId: item._id })}
            className="card p-4 cursor-pointer transition-all hover:scale-[1.01]"
            style={{
              borderColor: item.isRead ? "var(--border)" : accent,
              borderWidth: item.isRead ? 1 : 2,
              background: bg,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: item.type === "notice" ? "#06B6D4" : "linear-gradient(135deg, #2563EB, #F97316)" }}
                >
                  <Icon size={14} />
                </div>
                <div>
                  <p className="text-xs font-semibold flex items-center gap-1.5">
                    <span style={{ color: accent }}>{label}</span>
                    <span style={{ color: "var(--text-muted)" }}>from Cassandra</span>
                  </p>
                  <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                    <Clock size={10} /> {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
              {!item.isRead && (
                <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: accent }} />
              )}
            </div>
            <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--text)" }}>
              {item.message}
            </p>
            {!item.isRead && (
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Click to mark as read</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
