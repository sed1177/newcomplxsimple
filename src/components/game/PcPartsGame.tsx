"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const PC_PARTS = [
  { id: "cpu", label: "CPU", desc: "Central Processing Unit", color: "#EA580C" },
  { id: "gpu", label: "GPU", desc: "Graphics Processing Unit", color: "#2563EB" },
  { id: "ram", label: "RAM", desc: "Random Access Memory", color: "#0EA5E9" },
  { id: "ssd", label: "SSD", desc: "Solid State Drive", color: "#0EA5E9" },
  { id: "psu", label: "PSU", desc: "Power Supply Unit", color: "#F59E0B" },
  { id: "motherboard", label: "Motherboard", desc: "Main circuit board", color: "#E11D48" },
];

const DROP_ZONES: Array<{ id: string; hint: string; x: string; y: string }> = [
  { id: "cpu", hint: "The brain of the PC", x: "38%", y: "22%" },
  { id: "gpu", hint: "Handles graphics output", x: "60%", y: "55%" },
  { id: "ram", hint: "Short-term fast memory", x: "62%", y: "28%" },
  { id: "ssd", hint: "Stores your files permanently", x: "18%", y: "60%" },
  { id: "psu", hint: "Powers everything", x: "18%", y: "78%" },
  { id: "motherboard", hint: "Connects all components", x: "42%", y: "48%" },
];

function DraggableLabel({ part, isUsed }: { part: (typeof PC_PARTS)[0]; isUsed: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: part.id, disabled: isUsed });
  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        ...style,
        opacity: isUsed ? 0.35 : isDragging ? 0.5 : 1,
        cursor: isUsed ? "not-allowed" : "grab",
        background: isUsed ? "var(--surface-2)" : `${part.color}22`,
        borderColor: isUsed ? "var(--border)" : `${part.color}66`,
        color: isUsed ? "var(--text-muted)" : part.color,
      }}
      className="px-4 py-2 rounded-xl border-2 font-bold text-sm select-none transition-all"
    >
      {part.label}
    </div>
  );
}

function DropZone({
  zone,
  droppedId,
  isCorrect,
}: {
  zone: (typeof DROP_ZONES)[0];
  droppedId: string | null;
  isCorrect: boolean | null;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: zone.id });
  const dropped = PC_PARTS.find((p) => p.id === droppedId);

  let bg = "rgba(255,255,255,0.1)";
  let border = "rgba(255,255,255,0.3)";
  if (isOver) { bg = "rgba(124,58,237,0.2)"; border = "#2563EB"; }
  if (isCorrect === true) { bg = "rgba(16,185,129,0.2)"; border = "#0EA5E9"; }
  if (isCorrect === false) { bg = "rgba(239,68,68,0.2)"; border = "#EF4444"; }

  return (
    <div
      ref={setNodeRef}
      className="absolute flex flex-col items-center gap-1"
      style={{ left: zone.x, top: zone.y, transform: "translate(-50%, -50%)" }}
    >
      <div
        className="min-w-[80px] h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all"
        style={{ background: bg, border: `2px dashed ${border}`, color: dropped ? (isCorrect ? "#0EA5E9" : "#EF4444") : "rgba(255,255,255,0.6)" }}
      >
        {dropped ? (
          <span className="flex items-center gap-1">
            {dropped.label}
            {isCorrect === true && <CheckCircle size={12} />}
            {isCorrect === false && <XCircle size={12} />}
          </span>
        ) : (
          <span className="text-[10px]">{zone.hint}</span>
        )}
      </div>
    </div>
  );
}

interface Props {
  onComplete: (score: number, maxScore: number) => void;
}

export function PcPartsGame({ onComplete }: Props) {
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [finished, setFinished] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (checked) return;
      const { active, over } = event;
      if (!over) return;
      setPlacements((prev) => {
        const next = { ...prev };
        // Remove from any previous zone
        for (const [k, v] of Object.entries(next)) {
          if (v === active.id) delete next[k];
        }
        next[over.id as string] = active.id as string;
        return next;
      });
    },
    [checked]
  );

  const usedPartIds = new Set(Object.values(placements));

  function handleCheck() {
    setChecked(true);
    const correct = Object.entries(placements).filter(([zoneId, partId]) => zoneId === partId).length;
    if (correct === DROP_ZONES.length) {
      setFinished(true);
      onComplete(correct, DROP_ZONES.length);
    }
  }

  function handleReset() {
    setPlacements({});
    setChecked(false);
    setFinished(false);
  }

  function handleForceComplete() {
    const correct = Object.entries(placements).filter(([zoneId, partId]) => zoneId === partId).length;
    setFinished(true);
    onComplete(correct, DROP_ZONES.length);
  }

  const allPlaced = Object.keys(placements).length === DROP_ZONES.length;
  const correctCount = Object.entries(placements).filter(([z, p]) => z === p).length;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-6">
        {/* Diagram */}
        <div
          className="relative w-full rounded-2xl overflow-hidden"
          style={{ aspectRatio: "16/9", background: "linear-gradient(135deg, #1a1035 0%, #0d1a35 100%)", border: "1px solid var(--border)" }}
        >
          {/* Simple PC outline SVG */}
          <svg viewBox="0 0 800 450" className="absolute inset-0 w-full h-full opacity-40">
            {/* Case outline */}
            <rect x="80" y="30" width="640" height="390" rx="16" stroke="#2563EB" strokeWidth="2" fill="none" />
            {/* Motherboard area */}
            <rect x="120" y="60" width="560" height="260" rx="8" stroke="#0EA5E9" strokeWidth="1.5" fill="none" strokeDasharray="6,3" />
            {/* CPU socket */}
            <rect x="270" y="80" width="100" height="100" rx="4" stroke="#EA580C" strokeWidth="1.5" fill="none" />
            {/* RAM slots */}
            <rect x="430" y="80" width="20" height="100" rx="2" stroke="#0EA5E9" strokeWidth="1.5" fill="none" />
            <rect x="455" y="80" width="20" height="100" rx="2" stroke="#0EA5E9" strokeWidth="1.5" fill="none" />
            {/* GPU slot */}
            <rect x="300" y="220" width="240" height="60" rx="4" stroke="#2563EB" strokeWidth="1.5" fill="none" />
            {/* SSD */}
            <rect x="100" y="260" width="120" height="40" rx="4" stroke="#0EA5E9" strokeWidth="1.5" fill="none" />
            {/* PSU */}
            <rect x="100" y="320" width="120" height="80" rx="4" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
          </svg>

          {/* Drop zones */}
          {DROP_ZONES.map((zone) => (
            <DropZone
              key={zone.id}
              zone={zone}
              droppedId={placements[zone.id] ?? null}
              isCorrect={checked ? placements[zone.id] === zone.id : null}
            />
          ))}
        </div>

        {/* Labels to drag */}
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: "var(--text-muted)" }}>
            Drag each label to the correct spot on the diagram:
          </p>
          <div className="flex flex-wrap gap-3">
            {PC_PARTS.map((part) => (
              <DraggableLabel key={part.id} part={part} isUsed={usedPartIds.has(part.id)} />
            ))}
          </div>
        </div>

        {/* Feedback */}
        {checked && (
          <div
            className="rounded-xl p-4 text-sm font-medium"
            style={{
              background: correctCount === DROP_ZONES.length ? "#0EA5E915" : "#EF444415",
              border: `1px solid ${correctCount === DROP_ZONES.length ? "#0EA5E933" : "#EF444433"}`,
              color: correctCount === DROP_ZONES.length ? "#0EA5E9" : "#EF4444",
            }}
          >
            {correctCount === DROP_ZONES.length
              ? "🎉 Perfect! You identified all PC parts correctly!"
              : `You got ${correctCount}/${DROP_ZONES.length} correct. Try resetting and trying again!`}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          >
            <RotateCcw size={14} /> Reset
          </button>

          {!checked ? (
            <button
              onClick={handleCheck}
              disabled={!allPlaced}
              className="flex-1 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-pink-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Check Answers {allPlaced ? `(${Object.keys(placements).length}/${DROP_ZONES.length})` : `(${Object.keys(placements).length}/${DROP_ZONES.length} placed)`}
            </button>
          ) : (
            <button
              onClick={handleForceComplete}
              className="flex-1 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-pink-500 hover:opacity-90 transition-all"
            >
              {correctCount === DROP_ZONES.length ? "Complete Lesson ✓" : "Submit & Continue →"}
            </button>
          )}
        </div>
      </div>
    </DndContext>
  );
}
