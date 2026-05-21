"use client";

import { useMemo, useState, useCallback } from "react";
import { parseBlocks, isInteractive, type LessonBlock } from "@/types/lesson";
import { LessonContent } from "./LessonContent";
import { FlashcardBlock } from "./blocks/FlashcardBlock";
import { FillBlankBlock } from "./blocks/FillBlankBlock";
import { QuizBlock } from "./blocks/QuizBlock";
import { MatchBlock } from "./blocks/MatchBlock";
import { CrosswordBlock } from "./blocks/CrosswordBlock";
import { PlaygroundBlock } from "./blocks/PlaygroundBlock";
import { useSoundFeedback } from "@/lib/useSoundFeedback";

interface BlockCompletion { score: number; max: number }

interface Props {
  contentJson: string;
  onComplete: (score: number, maxScore: number) => void;
  locked?: boolean;
}

/** Renders a single static block (heading, paragraph, code, list). */
function StaticBlock({ block }: { block: LessonBlock }) {
  // Delegate to the legacy LessonContent renderer for static types
  const fakeJson = JSON.stringify({ blocks: [block] });
  return <LessonContent contentJson={fakeJson} />;
}

export function LessonRenderer({ contentJson, onComplete, locked = false }: Props) {
  const blocks = useMemo(() => parseBlocks(contentJson), [contentJson]);
  const { playComplete } = useSoundFeedback();

  // completionMap: blockIndex → { score, max } — only set when that block calls onComplete
  const [completionMap, setCompletionMap] = useState<Record<number, BlockCompletion>>({});

  const interactiveIndices = useMemo(
    () => blocks.reduce<number[]>((acc, b, i) => (isInteractive(b) ? [...acc, i] : acc), []),
    [blocks]
  );

  const allDone = useMemo(
    () => interactiveIndices.length === 0 || interactiveIndices.every((i) => i in completionMap),
    [interactiveIndices, completionMap]
  );

  const { totalScore, totalMax } = useMemo(() => {
    const vals = Object.values(completionMap);
    return {
      totalScore: vals.reduce((s, v) => s + v.score, 0),
      totalMax:   vals.reduce((s, v) => s + v.max, 0) || 1,
    };
  }, [completionMap]);

  /** Called by each interactive block when the user finishes it. */
  const makeBlockCompleter = useCallback(
    (index: number) => (score: number, max: number) => {
      setCompletionMap((prev) => ({ ...prev, [index]: { score, max } }));
    },
    []
  );

  function handleComplete() {
    playComplete();
    onComplete(totalScore, totalMax);
  }

  // If already completed and has graded interactive content, show locked state
  if (locked && interactiveIndices.length > 0) {
    return (
      <div className="flex flex-col gap-6">
        {blocks.filter((b) => !isInteractive(b)).map((block, i) => (
          <StaticBlock key={i} block={block} />
        ))}
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <div className="text-4xl mb-3">🔒</div>
          <p className="text-lg font-bold mb-1" style={{ color: "var(--text)" }}>Already Submitted</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            This graded activity can only be completed once. Your score has been recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => {
        if (!isInteractive(block)) {
          return <StaticBlock key={i} block={block} />;
        }

        const completer = makeBlockCompleter(i);
        const isDone = i in completionMap;

        return (
          <div
            key={i}
            className="rounded-2xl p-6 transition-all"
            style={{
              background: "var(--surface-2)",
              border: `1px solid ${isDone ? "#0EA5E933" : "var(--border)"}`,
              opacity: isDone ? 0.85 : 1,
            }}
          >
            {block.type === "flashcard" && (
              <FlashcardBlock front={block.front} back={block.back} onComplete={completer} />
            )}
            {block.type === "fillblank" && (
              <FillBlankBlock prompt={block.prompt} accepted={block.accepted} onComplete={completer} />
            )}
            {block.type === "quiz" && (
              <QuizBlock
                question={block.question}
                options={block.options}
                correctIndex={block.correctIndex}
                explanation={block.explanation}
                onComplete={completer}
              />
            )}
            {block.type === "match" && (
              <MatchBlock pairs={block.pairs} onComplete={completer} />
            )}
            {block.type === "crossword" && (
              <CrosswordBlock pairs={block.pairs} onComplete={completer} />
            )}
            {block.type === "playground" && (
              <PlaygroundBlock language={block.language} code={block.code} onComplete={completer} />
            )}
          </div>
        );
      })}

      {/* Complete button — appears once all interactive blocks are done */}
      {allDone && (
        <button
          onClick={handleComplete}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 hover:scale-[1.01]"
          style={{ background: "linear-gradient(135deg, #2563EB, #F97316)", boxShadow: "0 4px 15px rgba(37,99,235,0.3)" }}
        >
          {interactiveIndices.length === 0 ? "Mark Complete ✓" : `Complete Lesson — ${Math.round((totalScore / totalMax) * 100)}% ✓`}
        </button>
      )}
    </div>
  );
}
