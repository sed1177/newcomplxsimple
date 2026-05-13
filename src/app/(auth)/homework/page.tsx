"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CheckCircle, Clock, AlertTriangle, X, BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

const STATUS_STYLES = {
  complete:   { bg: "#0EA5E920", color: "#0EA5E9", label: "Complete",  icon: CheckCircle },
  late:       { bg: "#EF444420", color: "#EF4444", label: "Late",      icon: AlertTriangle },
  pending:    { bg: "#2563EB20", color: "#2563EB", label: "Pending",   icon: Clock },
  empty:      { bg: "#F9731620", color: "#F97316", label: "Empty",     icon: X },
  "no-track": { bg: "var(--surface-2)", color: "var(--text-muted)", label: "General", icon: BookOpen },
} as const;

type AssignmentStatus = keyof typeof STATUS_STYLES;

export default function HomeworkPage() {
  const assignments = useQuery(api.assignments.getMyStatus);

  const sorted = assignments
    ? [...assignments].sort((a, b) =>
        (b as { _creationTime: number })._creationTime - (a as { _creationTime: number })._creationTime
      )
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <h1 className="text-3xl font-black mb-1" style={{ color: "var(--text)" }}>All Assignments</h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
        Every assignment Cassandra has posted, most recent first.
      </p>

      {!sorted ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-24 animate-pulse" style={{ background: "var(--surface-2)" }} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="card p-10 text-center">
          <BookOpen size={32} className="mx-auto mb-3 opacity-25" />
          <p className="font-semibold" style={{ color: "var(--text)" }}>No assignments yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Cassandra will post assignments here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((a) => {
            const s = STATUS_STYLES[a.status as AssignmentStatus] ?? STATUS_STYLES.pending;
            const Icon = s.icon;
            const now = Date.now();
            const isPast = now > a.dueDate;
            const daysLeft = Math.ceil((a.dueDate - now) / (1000 * 60 * 60 * 24));
            const track = (a as { track?: { name: string; slug: string } }).track;

            return (
              <div
                key={a._id}
                className="card p-5"
                style={{
                  borderColor: a.status === "late" || a.status === "empty"
                    ? "#EF444433"
                    : a.status === "complete" ? "#0EA5E933" : "var(--border)",
                }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-bold" style={{ color: "var(--text)" }}>{a.title}</p>
                      {isPast && a.status !== "complete" && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#EF444420", color: "#EF4444" }}>Past Due</span>
                      )}
                    </div>
                    {a.description && (
                      <p className="text-sm mb-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>{a.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      <span>
                        Assigned: <strong style={{ color: "var(--text)" }}>{formatDate((a as { _creationTime: number })._creationTime)}</strong>
                      </span>
                      <span>
                        Due: <strong style={{ color: isPast && a.status !== "complete" ? "#EF4444" : "var(--text)" }}>{formatDate(a.dueDate)}</strong>
                      </span>
                      {!isPast && a.status !== "complete" && daysLeft <= 7 && (
                        <span style={{ color: daysLeft <= 2 ? "#EF4444" : "#F59E0B" }}>
                          {daysLeft <= 0 ? "Due today!" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`}
                        </span>
                      )}
                      {track && (
                        <Link href={`/learn/${track.slug}`} className="hover:opacity-70 transition-opacity" style={{ color: "#2563EB" }}>
                          → {track.name}
                        </Link>
                      )}
                    </div>
                  </div>
                  <span
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0"
                    style={{ background: s.bg, color: s.color }}
                  >
                    <Icon size={11} /> {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
