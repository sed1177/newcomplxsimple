"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useSoundFeedback } from "@/lib/useSoundFeedback";
import { cn } from "@/lib/utils";

interface Props {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  onComplete: (score: number, maxScore: number) => void;
}

export function QuizBlock({ question, options, correctIndex, explanation, onComplete }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { playCorrect, playWrong } = useSoundFeedback();

  function handleSubmit() {
    if (selected === null) return;
    setSubmitted(true);
    const correct = selected === correctIndex;
    if (correct) playCorrect(); else playWrong();
    onComplete(correct ? 1 : 0, 1);
  }

  const isCorrect = selected === correctIndex;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white mt-0.5" style={{ background: "linear-gradient(135deg, #2563EB, #F97316)" }}>?</span>
        <p className="font-semibold leading-snug" style={{ color: "var(--text)" }}>{question}</p>
      </div>

      <div className="grid gap-2 pl-9">
        {options.map((opt, idx) => {
          let borderColor = "var(--border)";
          let bg = "var(--surface-2)";
          let color = "var(--text)";
          if (submitted) {
            if (idx === correctIndex) { borderColor = "#0EA5E9"; bg = "#0EA5E912"; color = "#0EA5E9"; }
            else if (idx === selected) { borderColor = "#EF4444"; bg = "#EF444412"; color = "#EF4444"; }
          } else if (idx === selected) {
            borderColor = "#2563EB"; bg = "#2563EB12"; color = "#2563EB";
          }
          return (
            <button
              key={idx}
              disabled={submitted}
              onClick={() => setSelected(idx)}
              className={cn("w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all", !submitted && "hover:scale-[1.01]")}
              style={{ borderColor, background: bg, color }}
            >
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs flex-shrink-0 font-bold" style={{ borderColor, color }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
                {submitted && idx === correctIndex && <CheckCircle size={14} className="ml-auto" />}
                {submitted && idx === selected && idx !== correctIndex && <XCircle size={14} className="ml-auto" />}
              </span>
            </button>
          );
        })}
      </div>

      {submitted && explanation && (
        <div className="ml-9 rounded-xl p-3 text-sm" style={{ background: isCorrect ? "#0EA5E912" : "#EF444412", color: isCorrect ? "#0EA5E9" : "#EF4444", border: `1px solid ${isCorrect ? "#0EA5E933" : "#EF444433"}` }}>
          <strong>{isCorrect ? "Correct!" : "Not quite."}</strong> {explanation}
        </div>
      )}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="ml-9 px-5 py-2 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #2563EB, #F97316)" }}
        >
          Submit
        </button>
      )}
    </div>
  );
}
