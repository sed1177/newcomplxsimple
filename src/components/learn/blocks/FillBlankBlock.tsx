"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useSoundFeedback } from "@/lib/useSoundFeedback";

interface Props {
  prompt: string;
  accepted: string[][];
  explanation?: string;
  onComplete: (score: number, maxScore: number) => void;
}

export function FillBlankBlock({ prompt, accepted, explanation, onComplete }: Props) {
  const parts = prompt.split("___");
  const blankCount = accepted.length;

  const [values, setValues] = useState<string[]>(Array(blankCount).fill(""));
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const { playCorrect, playWrong, playComplete } = useSoundFeedback();

  function handleSubmit() {
    const res = values.map((v, i) =>
      (accepted[i] ?? []).some((ans) => ans.toLowerCase().trim() === v.toLowerCase().trim())
    );
    setResults(res);
    setSubmitted(true);
    const score = res.filter(Boolean).length;
    const allCorrect = score === blankCount;
    if (allCorrect) { playComplete(); } else if (score > 0) { playCorrect(); } else { playWrong(); }
    onComplete(score, blankCount);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Prompt with inline inputs */}
      <div
        className="rounded-2xl p-6 text-base leading-loose font-medium"
        style={{ background: "#2563EB10", border: "1px solid #2563EB22", color: "var(--text)" }}
      >
        {parts.map((part, i) => (
          <span key={i}>
            <span>{part}</span>
            {i < blankCount && (
              <span className="inline-flex items-center mx-1">
                <input
                  type="text"
                  disabled={submitted}
                  value={values[i]}
                  onChange={(e) => {
                    const next = [...values];
                    next[i] = e.target.value;
                    setValues(next);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !submitted && handleSubmit()}
                  className="rounded-lg px-2 py-0.5 text-sm font-bold outline-none transition-all"
                  style={{
                    width: `${Math.max(80, (accepted[i]?.[0]?.length ?? 6) * 11)}px`,
                    background: submitted
                      ? results[i] ? "#0EA5E920" : "#EF444420"
                      : "var(--surface)",
                    border: `2px solid ${submitted ? (results[i] ? "#0EA5E9" : "#EF4444") : "#2563EB55"}`,
                    color: submitted ? (results[i] ? "#0EA5E9" : "#EF4444") : "var(--text)",
                  }}
                  placeholder="___"
                />
                {submitted && (
                  results[i]
                    ? <CheckCircle size={14} className="ml-1" style={{ color: "#0EA5E9" }} />
                    : <XCircle   size={14} className="ml-1" style={{ color: "#EF4444" }} />
                )}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Show accepted answers after submission */}
      {submitted && results.some((r) => !r) && (
        <div className="rounded-xl p-4 text-sm space-y-1" style={{ background: "#EF444412", border: "1px solid #EF444433" }}>
          <p className="font-semibold" style={{ color: "#EF4444" }}>Correct answers:</p>
          {accepted.map((ans, i) => !results[i] && (
            <p key={i} style={{ color: "var(--text-muted)" }}>
              Blank {i + 1}: <strong style={{ color: "var(--text)" }}>{ans[0]}</strong>
              {ans.length > 1 && <span> (also: {ans.slice(1).join(", ")})</span>}
            </p>
          ))}
        </div>
      )}

      {explanation && submitted && (
        <div className="rounded-xl p-4 text-sm" style={{ background: "#2563EB12", border: "1px solid #2563EB33", color: "var(--text-muted)" }}>
          {explanation}
        </div>
      )}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={values.some((v) => !v.trim())}
          className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #2563EB, #F97316)" }}
        >
          Check Answers
        </button>
      ) : (
        <div className="text-center text-sm font-semibold py-2" style={{ color: results.every(Boolean) ? "#0EA5E9" : "var(--text-muted)" }}>
          {results.filter(Boolean).length}/{blankCount} correct
        </div>
      )}
    </div>
  );
}
