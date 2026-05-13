"use client";

import { useState, useCallback, useMemo } from "react";
import { DndContext, useDraggable, useDroppable, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle, XCircle, RotateCcw, Shuffle } from "lucide-react";
import { useSoundFeedback } from "@/lib/useSoundFeedback";

interface Pair { term: string; definition: string }

interface Props {
  pairs: Pair[];
  onComplete: (score: number, maxScore: number) => void;
}

function DraggableTerm({ id, label, isPlaced, isCorrect }: { id: string; label: string; isPlaced: boolean; isCorrect: boolean | null }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled: isPlaced });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="px-4 py-2.5 rounded-xl text-sm font-semibold select-none transition-all"
      style={{
        cursor: isPlaced ? "default" : isDragging ? "grabbing" : "grab",
        transform: CSS.Translate.toString(transform),
        opacity: isPlaced ? 0.4 : isDragging ? 0.6 : 1,
        background: isCorrect === true ? "#0EA5E920" : isCorrect === false ? "#EF444420" : "var(--surface-2)",
        border: `2px solid ${isCorrect === true ? "#0EA5E9" : isCorrect === false ? "#EF4444" : "var(--border)"}`,
        color: isCorrect === true ? "#0EA5E9" : isCorrect === false ? "#EF4444" : "var(--text)",
      }}
    >
      {label}
    </div>
  );
}

function DefinitionZone({ id, definition, droppedTerm, checked }: { id: string; definition: string; droppedTerm: string | null; checked: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const isCorrect = checked && droppedTerm === definition.split("||")[0]; // we'll use index matching instead

  return (
    <div
      ref={setNodeRef}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
      style={{
        background: isOver ? "#2563EB15" : "var(--surface-2)",
        border: `2px dashed ${isOver ? "#2563EB" : "var(--border)"}`,
        minHeight: "44px",
      }}
    >
      <span style={{ color: "var(--text-muted)" }}>{definition}</span>
      {droppedTerm && (
        <span className="ml-auto px-3 py-1 rounded-lg text-xs font-bold" style={{ background: "#2563EB20", color: "#2563EB" }}>
          {droppedTerm}
        </span>
      )}
    </div>
  );
}

export function MatchBlock({ pairs, onComplete }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const { playCorrect, playWrong, playComplete } = useSoundFeedback();

  // Shuffle definitions on mount
  const shuffledDefs = useMemo(() => {
    const defs = pairs.map((p, i) => ({ ...p, originalIndex: i }));
    for (let i = defs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [defs[i], defs[j]] = [defs[j], defs[i]];
    }
    return defs;
  }, [pairs]);

  // placements: defIndex → termLabel
  const [placements, setPlacements] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const usedTerms = new Set(Object.values(placements));

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    if (checked) return;
    const { active, over } = e;
    if (!over) return;
    const termLabel = active.id as string;
    const defIndex = Number(over.id);
    setPlacements((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(next)) {
        if (v === termLabel) delete next[Number(k)];
      }
      next[defIndex] = termLabel;
      return next;
    });
  }, [checked]);

  function handleCheck() {
    const res = shuffledDefs.map((def, i) => placements[i] === def.term);
    setResults(res);
    setChecked(true);
    const score = res.filter(Boolean).length;
    if (score === pairs.length) playComplete();
    else if (score > 0) playCorrect();
    else playWrong();
    onComplete(score, pairs.length);
  }

  function handleReset() {
    setPlacements({});
    setChecked(false);
    setResults([]);
  }

  const allPlaced = Object.keys(placements).length === pairs.length;
  const score = results.filter(Boolean).length;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-5">
        {/* Terms bank */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--text-muted)" }}>Drag terms to match definitions</p>
          <div className="flex flex-wrap gap-2">
            {pairs.map((pair, i) => (
              <DraggableTerm
                key={pair.term}
                id={pair.term}
                label={pair.term}
                isPlaced={usedTerms.has(pair.term)}
                isCorrect={checked ? (results[shuffledDefs.findIndex((d) => d.term === pair.term)] ?? null) : null}
              />
            ))}
          </div>
        </div>

        {/* Definition drop zones */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>Definitions</p>
          {shuffledDefs.map((def, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1">
                <DefinitionZone
                  id={String(i)}
                  definition={def.definition}
                  droppedTerm={placements[i] ?? null}
                  checked={checked}
                />
              </div>
              {checked && (
                results[i]
                  ? <CheckCircle size={18} style={{ color: "#0EA5E9", flexShrink: 0 }} />
                  : <XCircle    size={18} style={{ color: "#EF4444", flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>

        {checked && (
          <div className="rounded-xl p-4 text-sm font-semibold text-center" style={{
            background: score === pairs.length ? "#0EA5E920" : "#EF444415",
            color: score === pairs.length ? "#0EA5E9" : "#EF4444",
            border: `1px solid ${score === pairs.length ? "#0EA5E933" : "#EF444433"}`,
          }}>
            {score === pairs.length ? "Perfect match! 🎉" : `${score}/${pairs.length} correct`}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          >
            <RotateCcw size={13} /> Reset
          </button>
          {!checked ? (
            <button
              onClick={handleCheck}
              disabled={!allPlaced}
              className="flex-1 py-2 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #2563EB, #F97316)" }}
            >
              Check Matches ({Object.keys(placements).length}/{pairs.length})
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="flex-1 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </DndContext>
  );
}
