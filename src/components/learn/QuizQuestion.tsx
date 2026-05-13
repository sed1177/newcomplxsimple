"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  order: number;
}

interface Props {
  questions: Question[];
  onComplete: (score: number, maxScore: number, answers: number[]) => void;
}

export function QuizQuestion({ questions, onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);

  const sorted = [...questions].sort((a, b) => a.order - b.order);
  const q = sorted[current];
  const isCorrect = selected === q.correctIndex;

  function handleSelect(idx: number) {
    if (submitted) return;
    setSelected(idx);
  }

  function handleSubmit() {
    if (selected === null) return;
    setSubmitted(true);
  }

  function handleNext() {
    const newAnswers = [...answers, selected!];
    if (current === sorted.length - 1) {
      const score = newAnswers.filter((a, i) => a === sorted[i].correctIndex).length;
      setDone(true);
      onComplete(score, sorted.length, newAnswers);
    } else {
      setAnswers(newAnswers);
      setCurrent(current + 1);
      setSelected(null);
      setSubmitted(false);
    }
  }

  if (done) return null;

  const pct = Math.round((current / sorted.length) * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-muted)" }}>
          <span>Question {current + 1} of {sorted.length}</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: "var(--surface-2)" }}>
          <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Question */}
      <h3 className="text-xl font-bold leading-snug" style={{ color: "var(--text)" }}>{q.question}</h3>

      {/* Options */}
      <div className="grid gap-3">
        {q.options.map((opt, idx) => {
          let borderColor = "var(--border)";
          let bg = "var(--surface)";
          let textColor = "var(--text)";

          if (submitted) {
            if (idx === q.correctIndex) { borderColor = "#0EA5E9"; bg = "#0EA5E915"; textColor = "#0EA5E9"; }
            else if (idx === selected) { borderColor = "#EF4444"; bg = "#EF444415"; textColor = "#EF4444"; }
          } else if (idx === selected) {
            borderColor = "#2563EB";
            bg = "#2563EB15";
            textColor = "#2563EB";
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={cn(
                "w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium text-sm",
                !submitted && "hover:scale-[1.01] active:scale-[0.99]",
                submitted && "cursor-default"
              )}
              style={{ borderColor, background: bg, color: textColor }}
            >
              <span className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ borderColor }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
                {submitted && idx === q.correctIndex && <CheckCircle size={16} className="ml-auto flex-shrink-0" />}
                {submitted && idx === selected && idx !== q.correctIndex && <XCircle size={16} className="ml-auto flex-shrink-0" />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {submitted && q.explanation && (
        <div className="rounded-xl p-4 text-sm" style={{ background: isCorrect ? "#0EA5E915" : "#EF444415", color: isCorrect ? "#0EA5E9" : "#EF4444", border: `1px solid ${isCorrect ? "#0EA5E933" : "#EF444433"}` }}>
          <strong>{isCorrect ? "Correct!" : "Not quite."}</strong> {q.explanation}
        </div>
      )}

      {/* Actions */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-500 to-pink-500"
        >
          Submit Answer
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-pink-500 hover:opacity-90 transition-all"
        >
          {current === sorted.length - 1 ? "See Results" : "Next Question →"}
        </button>
      )}
    </div>
  );
}
