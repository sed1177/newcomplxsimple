"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useSoundFeedback } from "@/lib/useSoundFeedback";

interface Props {
  front: string;
  back: string;
  onComplete: (score: number, maxScore: number) => void;
}

export function FlashcardBlock({ front, back, onComplete }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const { playCorrect } = useSoundFeedback();

  function handleGotIt() {
    playCorrect();
    setDone(true);
    onComplete(1, 1);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Card */}
      <div
        className="w-full cursor-pointer select-none"
        style={{ perspective: "1000px" }}
        onClick={() => !done && setFlipped((f) => !f)}
      >
        <div
          className="relative w-full rounded-2xl transition-all duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "160px",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 text-center"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              background: "#2563EB15",
              border: "2px solid #2563EB33",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#2563EB" }}>Term</p>
            <p className="text-xl font-bold" style={{ color: "var(--text)" }}>{front}</p>
            <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>Click to flip</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 text-center"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "#0EA5E915",
              border: "2px solid #0EA5E933",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#0EA5E9" }}>Definition</p>
            <p className="text-base leading-relaxed" style={{ color: "var(--text)" }}>{back}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {flipped && !done && (
        <div className="flex gap-3 w-full">
          <button
            onClick={() => setFlipped(false)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            <RotateCcw size={13} /> Review again
          </button>
          <button
            onClick={handleGotIt}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #2563EB, #F97316)" }}
          >
            Got it! ✓
          </button>
        </div>
      )}

      {done && (
        <div className="w-full py-2.5 rounded-xl text-sm font-semibold text-center" style={{ background: "#0EA5E920", color: "#0EA5E9" }}>
          ✓ Remembered
        </div>
      )}
    </div>
  );
}
