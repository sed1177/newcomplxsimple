"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Plus, Trash2, CheckCircle, Clock, AlertTriangle, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  complete: { bg: "#0EA5E920", color: "#0EA5E9", label: "Complete", icon: CheckCircle },
  late:     { bg: "#EF444420", color: "#EF4444", label: "Late",     icon: AlertTriangle },
  pending:  { bg: "#2563EB20", color: "#2563EB", label: "Pending",  icon: Clock },
  empty:    { bg: "#F9731620", color: "#F97316", label: "Empty",    icon: X },
  "no-track": { bg: "var(--surface-2)", color: "var(--text-muted)", label: "N/A", icon: Clock },
} as const;

function CreateForm({ onClose }: { onClose: () => void }) {
  const tracks = useQuery(api.tracks.list);
  const create = useMutation(api.assignments.create);
  const [title, setTitle] = useState("Complete Linux Mastery Track");
  const [description, setDescription] = useState("This is not just a certification — it's a job-ready pathway to managing servers at scale.");
  const [trackId, setTrackId] = useState("");
  const [dueDate, setDueDate] = useState("2026-05-02T00:00");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!title.trim() || !dueDate) return;
    setSaving(true);
    await create({
      title: title.trim(),
      description: description.trim() || undefined,
      trackId: trackId ? trackId as Id<"tracks"> : undefined,
      dueDate: new Date(dueDate).getTime(),
      assignedToAll: true,
    });
    toast.success("Assignment created!");
    onClose();
    setSaving(false);
  }

  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-bold" style={{ color: "var(--text)" }}>New Assignment</h3>
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Track (optional)</label>
          <select
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          >
            <option value="">Any / General</option>
            {tracks?.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Due date & time *</label>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={!title.trim() || !dueDate || saving}
          className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #2563EB, #F97316)" }}
        >
          {saving ? "Creating..." : "Create Assignment"}
        </button>
      </div>
    </div>
  );
}

export function HomeworkTab() {
  const data = useQuery(api.assignments.getAllStudentStatuses);
  const remove = useMutation(api.assignments.remove);
  const [creating, setCreating] = useState(false);
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const VISIBLE_LIMIT = 5;

  if (!data) {
    return <div className="space-y-3">{[1,2].map(i => <div key={i} className="card h-20 animate-pulse" style={{ background: "var(--surface-2)" }} />)}</div>;
  }

  // Most recent first using Convex system _creationTime
  const sorted = [...data].sort((a, b) =>
    (b.assignment as { _creationTime: number })._creationTime -
    (a.assignment as { _creationTime: number })._creationTime
  );

  const visible = showAll ? sorted : sorted.slice(0, VISIBLE_LIMIT);
  const hidden = sorted.length - VISIBLE_LIMIT;

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #2563EB, #F97316)" }}
        >
          <Plus size={14} /> New Assignment
        </button>
      </div>

      {creating && <CreateForm onClose={() => setCreating(false)} />}

      {data.length === 0 && !creating && (
        <div className="card p-10 text-center">
          <p className="font-semibold" style={{ color: "var(--text)" }}>No assignments yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Create an assignment to track student completion.</p>
        </div>
      )}

      {visible.map(({ assignment, studentStatuses }) => {
        const isExpanded = expandedAssignment === assignment._id;
        const now = Date.now();
        const isPast = now > assignment.dueDate;
        const completeCount = studentStatuses.filter(s => s.status === "complete").length;
        const total = studentStatuses.length;

        return (
          <div key={assignment._id} className="card overflow-hidden">
            {/* Assignment header */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold" style={{ color: "var(--text)" }}>{assignment.title}</h3>
                    {isPast && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#EF444420", color: "#EF4444" }}>Past Due</span>
                    )}
                  </div>
                  {assignment.description && (
                    <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>{assignment.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>Assigned: <strong style={{ color: "var(--text)" }}>{formatDate((assignment as { _creationTime: number })._creationTime)}</strong></span>
                    <span>Due: <strong style={{ color: isPast ? "#EF4444" : "var(--text)" }}>{formatDate(assignment.dueDate)}</strong></span>
                    {(assignment as { track?: { name: string } }).track && (
                      <span>Track: <strong style={{ color: "var(--text)" }}>{(assignment as { track: { name: string } }).track.name}</strong></span>
                    )}
                    <span style={{ color: completeCount === total && total > 0 ? "#0EA5E9" : "var(--text-muted)" }}>
                      {completeCount}/{total} completed
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setExpandedAssignment(isExpanded ? null : assignment._id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-80"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                  >
                    {isExpanded ? "Hide" : "View Students"}
                  </button>
                  <button
                    onClick={async () => { await remove({ id: assignment._id }); toast.success("Deleted"); }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                    style={{ background: "#EF444415" }}
                  >
                    <Trash2 size={13} style={{ color: "#EF4444" }} />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 w-full rounded-full overflow-hidden" style={{ height: "4px", background: "var(--surface-2)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${total > 0 ? (completeCount / total) * 100 : 0}%`, background: "#0EA5E9" }} />
              </div>
            </div>

            {/* Student status rows */}
            {isExpanded && (
              <div className="border-t" style={{ borderColor: "var(--border)" }}>
                {studentStatuses.length === 0 ? (
                  <p className="p-4 text-sm" style={{ color: "var(--text-muted)" }}>No active students.</p>
                ) : (
                  studentStatuses.map(({ student, status }) => {
                    const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
                    const Icon = s.icon;
                    return (
                      <div key={student._id} className="flex items-center gap-3 px-5 py-3 border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #2563EB, #F97316)" }}>
                          {student.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{student.name}</p>
                          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{student.email}</p>
                        </div>
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0" style={{ background: s.bg, color: s.color }}>
                          <Icon size={11} /> {s.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Show more / collapse */}
      {sorted.length > VISIBLE_LIMIT && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
        >
          {showAll
            ? `Show less ↑`
            : `See all ${sorted.length} assignments (${hidden} more) ↓`}
        </button>
      )}
    </div>
  );
}
