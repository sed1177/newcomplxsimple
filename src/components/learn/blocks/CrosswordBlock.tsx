"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { useSoundFeedback } from "@/lib/useSoundFeedback";

interface Pair { term: string; definition: string }
interface Props { pairs: Pair[]; onComplete: (score: number, maxScore: number) => void }

// ── Grid types ────────────────────────────────────────────────────────────────

const G = 25; // larger internal grid for longer words

interface Cell {
  letter: string;
  clueNum?: number;
  acrossIdx?: number;
  downIdx?: number;
}

interface Placement {
  word:  string;
  def:   string;
  row:   number;
  col:   number;
  dir:   "across" | "down";
  num:   number;
}

// ── Layout algorithm ──────────────────────────────────────────────────────────

function buildCrossword(pairs: Pair[]): {
  grid: (Cell | null)[][];
  placements: Placement[];
  bounds: { r0: number; r1: number; c0: number; c1: number };
} {
  const grid: (Cell | null)[][] = Array.from({ length: G }, () => Array(G).fill(null));
  const placed: Placement[] = [];

  const words = pairs
    .map((p) => ({ w: p.term.toUpperCase().replace(/[^A-Z]/g, ""), def: p.definition }))
    .filter((x) => x.w.length >= 2)
    .sort((a, b) => b.w.length - a.w.length);

  function canPlace(word: string, r: number, c: number, dir: "across" | "down"): boolean {
    const DR = dir === "down" ? 1 : 0, DC = dir === "across" ? 1 : 0;
    const len = word.length;
    if (r < 0 || c < 0) return false;
    if (dir === "across" && c + len > G) return false;
    if (dir === "down"   && r + len > G) return false;
    if (dir === "across") {
      if (c > 0       && grid[r][c - 1])     return false;
      if (c + len < G && grid[r][c + len])   return false;
    } else {
      if (r > 0       && grid[r - 1][c])     return false;
      if (r + len < G && grid[r + len][c])   return false;
    }
    let hits = 0;
    for (let i = 0; i < len; i++) {
      const cr = r + DR * i, cc = c + DC * i;
      const cell = grid[cr][cc];
      if (cell) {
        if (cell.letter !== word[i]) return false;
        if (dir === "across" && cell.downIdx  === undefined) return false;
        if (dir === "down"   && cell.acrossIdx === undefined) return false;
        hits++;
      } else {
        if (dir === "across") {
          if (cr > 0     && grid[cr - 1][cc]) return false;
          if (cr < G - 1 && grid[cr + 1][cc]) return false;
        } else {
          if (cc > 0     && grid[cr][cc - 1]) return false;
          if (cc < G - 1 && grid[cr][cc + 1]) return false;
        }
      }
    }
    return placed.length === 0 || hits > 0;
  }

  function doPlace(w: string, def: string, r: number, c: number, dir: "across" | "down") {
    const DR = dir === "down" ? 1 : 0, DC = dir === "across" ? 1 : 0;
    const idx = placed.length;
    placed.push({ word: w, def, row: r, col: c, dir, num: idx + 1 });
    for (let i = 0; i < w.length; i++) {
      const cr = r + DR * i, cc = c + DC * i;
      if (!grid[cr][cc]) grid[cr][cc] = { letter: w[i] };
      if (dir === "across") grid[cr][cc]!.acrossIdx = idx;
      else                  grid[cr][cc]!.downIdx   = idx;
    }
  }

  if (words.length === 0) return { grid, placements: placed, bounds: { r0: 0, r1: 0, c0: 0, c1: 0 } };

  const fw = words[0];
  doPlace(fw.w, fw.def, Math.floor(G / 2), Math.floor((G - fw.w.length) / 2), "across");

  for (let pass = 0; pass < 6; pass++) {
    for (let wi = 1; wi < words.length; wi++) {
      const item = words[wi];
      if (placed.some((p) => p.word === item.w && p.def === item.def)) continue;
      let found = false;
      for (const anchor of [...placed]) {
        if (found) break;
        const perpDir: "across" | "down" = anchor.dir === "across" ? "down" : "across";
        for (let ai = 0; ai < anchor.word.length && !found; ai++) {
          for (let wi2 = 0; wi2 < item.w.length && !found; wi2++) {
            if (anchor.word[ai] !== item.w[wi2]) continue;
            const nr = anchor.dir === "across" ? anchor.row - wi2 : anchor.row + ai;
            const nc = anchor.dir === "across" ? anchor.col + ai  : anchor.col - wi2;
            if (canPlace(item.w, nr, nc, perpDir)) {
              doPlace(item.w, item.def, nr, nc, perpDir);
              found = true;
            }
          }
        }
      }
    }
  }

  // Re-number top→bottom, left→right
  const sorted = [...placed].sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col);
  const numMap = new Map<string, number>();
  let n = 1;
  for (const p of sorted) {
    const k = `${p.row},${p.col}`;
    if (!numMap.has(k)) numMap.set(k, n++);
    p.num = numMap.get(k)!;
  }

  // Re-index cell references
  const oldToNew = new Map<number, number>();
  for (let ni = 0; ni < sorted.length; ni++) oldToNew.set(placed.indexOf(sorted[ni]), ni);
  for (let r = 0; r < G; r++) for (let c = 0; c < G; c++) {
    const cell = grid[r][c];
    if (!cell) continue;
    if (cell.acrossIdx !== undefined) cell.acrossIdx = oldToNew.get(cell.acrossIdx)!;
    if (cell.downIdx   !== undefined) cell.downIdx   = oldToNew.get(cell.downIdx)!;
  }
  placed.length = 0;
  placed.push(...sorted);

  for (const p of sorted) {
    const cell = grid[p.row][p.col];
    if (cell) cell.clueNum = p.num;
  }

  let r0 = G, r1 = 0, c0 = G, c1 = 0;
  for (let r = 0; r < G; r++) for (let c = 0; c < G; c++) {
    if (grid[r][c]) { r0 = Math.min(r0, r); r1 = Math.max(r1, r); c0 = Math.min(c0, c); c1 = Math.max(c1, c); }
  }

  return {
    grid,
    placements: placed,
    bounds: { r0: Math.max(0, r0 - 1), r1: Math.min(G - 1, r1 + 1), c0: Math.max(0, c0 - 1), c1: Math.min(G - 1, c1 + 1) },
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CrosswordBlock({ pairs, onComplete }: Props) {
  const { grid, placements, bounds } = useMemo(() => buildCrossword(pairs), [pairs]);
  const { playCorrect, playWrong, playComplete } = useSoundFeedback();

  const [input, setInput]         = useState<Record<string, string>>({});
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(null);
  const [activeDir, setActiveDir]   = useState<"across" | "down">("across");
  const [submitted, setSubmitted]   = useState(false);
  const [wordResults, setWordResults] = useState<boolean[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  const activePlacement = useMemo(() => {
    if (!activeCell) return null;
    const cell = grid[activeCell.r]?.[activeCell.c];
    if (!cell) return null;
    const idx = activeDir === "across" ? cell.acrossIdx : cell.downIdx;
    return idx !== undefined ? (placements[idx] ?? null) : null;
  }, [activeCell, activeDir, grid, placements]);

  const activeWordKeys = useMemo(() => {
    if (!activePlacement) return new Set<string>();
    const DR = activePlacement.dir === "down" ? 1 : 0;
    const DC = activePlacement.dir === "across" ? 1 : 0;
    const s = new Set<string>();
    for (let i = 0; i < activePlacement.word.length; i++)
      s.add(`${activePlacement.row + DR * i},${activePlacement.col + DC * i}`);
    return s;
  }, [activePlacement]);

  const handleCellClick = useCallback((r: number, c: number) => {
    if (submitted) return;
    if (correctCellKeys.has(`${r},${c}`)) return; // locked correct cell
    const cell = grid[r]?.[c];
    if (!cell) return;
    tableRef.current?.focus();
    if (activeCell?.r === r && activeCell?.c === c) {
      if (cell.acrossIdx !== undefined && cell.downIdx !== undefined)
        setActiveDir((d) => (d === "across" ? "down" : "across"));
    } else {
      setActiveCell({ r, c });
      setActiveDir(cell.acrossIdx !== undefined ? "across" : "down");
    }
  }, [submitted, activeCell, grid]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (submitted || !activeCell) return;
    const { r, c } = activeCell;
    const DR = activeDir === "down" ? 1 : 0, DC = activeDir === "across" ? 1 : 0;

    if (e.key === "Tab") {
      e.preventDefault();
      if (!placements.length) return;
      const cur = activePlacement ? placements.indexOf(activePlacement) : -1;
      const next = placements[(cur + (e.shiftKey ? placements.length - 1 : 1)) % placements.length];
      setActiveCell({ r: next.row, c: next.col });
      setActiveDir(next.dir);
      return;
    }
    if (e.key === "Backspace") {
      const key = `${r},${c}`;
      if (input[key]) {
        setInput((p) => { const n = { ...p }; delete n[key]; return n; });
      } else {
        const nr = r - DR, nc = c - DC;
        if (nr >= 0 && nc >= 0 && grid[nr]?.[nc]) setActiveCell({ r: nr, c: nc });
      }
      return;
    }
    const DIRS: Record<string, [number, number]> = {
      ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0],
    };
    if (DIRS[e.key]) {
      e.preventDefault();
      const [dr, dc] = DIRS[e.key];
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < G && nc < G && grid[nr]?.[nc]) {
        setActiveCell({ r: nr, c: nc });
        setActiveDir(dc !== 0 ? "across" : "down");
      }
      return;
    }
    if (e.key.match(/^[a-zA-Z]$/)) {
      e.preventDefault();
      if (correctCellKeys.has(`${r},${c}`)) return; // don't overwrite correct cells
      setInput((p) => ({ ...p, [`${r},${c}`]: e.key.toUpperCase() }));
      const nr = r + DR, nc = c + DC;
      if (activeWordKeys.has(`${nr},${nc}`)) setActiveCell({ r: nr, c: nc });
    }
  }, [submitted, activeCell, activeDir, activePlacement, placements, input, grid, activeWordKeys]);

  function handleSubmit() {
    const res = placements.map((p) => {
      const DR = p.dir === "down" ? 1 : 0, DC = p.dir === "across" ? 1 : 0;
      return p.word.split("").every((letter, i) => (input[`${p.row + DR * i},${p.col + DC * i}`] ?? "") === letter);
    });
    setWordResults(res);
    setSubmitted(true);
    const score = res.filter(Boolean).length;
    if (score === placements.length) playComplete();
    else if (score > 0) playCorrect();
    else playWrong();
    onComplete(score, placements.length);
  }

  // Which cells belong to a correct word — keep them locked green on retry
  const correctCellKeys = useMemo(() => {
    if (!submitted) return new Set<string>();
    const keys = new Set<string>();
    placements.forEach((p, idx) => {
      if (!wordResults[idx]) return;
      const DR = p.dir === "down" ? 1 : 0, DC = p.dir === "across" ? 1 : 0;
      for (let i = 0; i < p.word.length; i++)
        keys.add(`${p.row + DR * i},${p.col + DC * i}`);
    });
    return keys;
  }, [submitted, wordResults, placements]);

  function handleRedo() {
    // Keep letters from correct words, clear everything else
    setInput((prev) => {
      const next: Record<string, string> = {};
      correctCellKeys.forEach((k) => { if (prev[k]) next[k] = prev[k]; });
      return next;
    });
    setSubmitted(false);
    setWordResults([]);
    setActiveCell(null);
  }

  if (placements.length === 0) {
    return (
      <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
        No words could be placed — the terms may not share enough common letters.
      </p>
    );
  }

  const rows = bounds.r1 - bounds.r0 + 1;
  const cols = bounds.c1 - bounds.c0 + 1;
  const CELL = Math.max(34, Math.min(44, Math.floor(460 / Math.max(rows, cols))));
  const FONT = Math.round(CELL * 0.52);
  const NUM  = Math.max(8, Math.round(CELL * 0.24));

  const score = wordResults.filter(Boolean).length;
  const pct   = placements.length > 0 ? Math.round((score / placements.length) * 100) : 0;

  const acrossClues = placements.filter((p) => p.dir === "across").sort((a, b) => a.num - b.num);
  const downClues   = placements.filter((p) => p.dir === "down").sort((a, b) => a.num - b.num);

  return (
    <div className="flex flex-col gap-6">

      {/* Score + redo after submit */}
      {submitted && (
        <div
          className="rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap"
          style={{
            background: pct === 100 ? "#D1FAE5" : pct >= 60 ? "#FEF3C7" : "#FEE2E2",
            border: `1px solid ${pct === 100 ? "#6EE7B7" : pct >= 60 ? "#FCD34D" : "#FCA5A5"}`,
          }}
        >
          <div>
            <p className="text-xl font-black" style={{ color: pct === 100 ? "#065F46" : pct >= 60 ? "#92400E" : "#991B1B" }}>
              {pct}% — {score}/{placements.length} words correct
            </p>
            <p className="text-sm mt-0.5" style={{ color: pct === 100 ? "#065F46" : pct >= 60 ? "#92400E" : "#991B1B" }}>
              {pct === 100 ? "Perfect! Every word nailed. 🎉" : pct >= 60 ? "Good work! Review the red words." : "Keep studying and try again! 📚"}
            </p>
          </div>
          <button
            onClick={handleRedo}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
          >
            <RotateCcw size={14} /> Try Again
          </button>
        </div>
      )}

      {/* Grid */}
      <div
        ref={tableRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="outline-none overflow-x-auto"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <table style={{ borderCollapse: "collapse", margin: "0 auto" }}>
          <tbody>
            {Array.from({ length: rows }, (_, ri) => {
              const r = bounds.r0 + ri;
              return (
                <tr key={r}>
                  {Array.from({ length: cols }, (_, ci) => {
                    const c = bounds.c0 + ci;
                    const cell = grid[r]?.[c];
                    const key = `${r},${c}`;
                    const entered = input[key] ?? "";
                    const isActive = activeCell?.r === r && activeCell?.c === c;
                    const inWord   = activeWordKeys.has(key);

                    if (!cell) {
                      return (
                        <td key={c} style={{
                          width: CELL, height: CELL,
                          background: "#0f172a",
                          border: "1px solid #1e293b",
                        }} />
                      );
                    }

                    // Colour logic
                    const isLockedCorrect = correctCellKeys.has(key);
                    let bg = "#ffffff";
                    let letterToShow = entered;
                    let letterColor = "#111827";
                    let showCorrect = false;

                    if (submitted) {
                      const letterOk = entered === cell.letter;
                      bg = letterOk ? "#D1FAE5" : "#FEE2E2";
                      letterToShow = entered || "_";
                      letterColor = letterOk ? "#065F46" : "#991B1B";
                      showCorrect = !letterOk;
                    } else if (isLockedCorrect) {
                      // Correct on a previous attempt — stay green and show the letter
                      bg = "#D1FAE5";
                      letterToShow = entered;
                      letterColor = "#065F46";
                    } else if (isActive) {
                      bg = "#93C5FD";
                    } else if (inWord) {
                      bg = "#DBEAFE";
                    }

                    return (
                      <td
                        key={c}
                        onClick={() => handleCellClick(r, c)}
                        style={{
                          width: CELL, height: CELL,
                          background: bg,
                          border: isActive ? "2.5px solid #1D4ED8" : "1.5px solid #9CA3AF",
                          position: "relative",
                          cursor: submitted ? "default" : "pointer",
                          userSelect: "none",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        {/* Clue number */}
                        {cell.clueNum !== undefined && (
                          <span style={{
                            position: "absolute", top: 1, left: 2,
                            fontSize: NUM, fontWeight: 800, color: "#374151", lineHeight: 1,
                          }}>
                            {cell.clueNum}
                          </span>
                        )}

                        {/* Student's letter (or underscore if not entered) */}
                        <span style={{
                          display: "block",
                          paddingTop: cell.clueNum !== undefined ? Math.round(CELL * 0.3) : 0,
                          fontSize: FONT,
                          fontWeight: 800,
                          color: letterColor,
                          lineHeight: 1,
                        }}>
                          {submitted ? letterToShow : (entered || (
                            <span style={{ color: "#D1D5DB", fontWeight: 400, fontSize: FONT * 0.7 }}>·</span>
                          ))}
                        </span>

                        {/* Correct letter hint shown below wrong answer */}
                        {submitted && showCorrect && (
                          <span style={{
                            position: "absolute", bottom: 1, right: 2,
                            fontSize: Math.max(8, NUM - 1),
                            fontWeight: 700,
                            color: "#059669",
                            lineHeight: 1,
                          }}>
                            {cell.letter}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Clues */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {acrossClues.length > 0 && (
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Across
            </p>
            {acrossClues.map((p) => {
              const idx = placements.indexOf(p);
              const isActive = activePlacement === p && activeDir === "across";
              const res = submitted ? wordResults[idx] : null;
              return (
                <div
                  key={p.num}
                  onClick={() => { if (!submitted) { setActiveCell({ r: p.row, c: p.col }); setActiveDir("across"); tableRef.current?.focus(); } }}
                  className="flex items-start gap-2 px-2 py-1.5 rounded-lg text-sm mb-1 transition-colors"
                  style={{ background: isActive ? "var(--surface-2)" : "transparent", cursor: submitted ? "default" : "pointer", color: "var(--text-muted)" }}
                >
                  {res === true  && <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#10B981" }} />}
                  {res === false && <XCircle     size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#EF4444" }} />}
                  <span>
                    <strong style={{ color: "var(--text)" }}>{p.num}.</strong>{" "}
                    {p.def}
                    {" "}
                    <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>({p.word.length} letters)</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {downClues.length > 0 && (
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Down
            </p>
            {downClues.map((p) => {
              const idx = placements.indexOf(p);
              const isActive = activePlacement === p && activeDir === "down";
              const res = submitted ? wordResults[idx] : null;
              return (
                <div
                  key={p.num}
                  onClick={() => { if (!submitted) { setActiveCell({ r: p.row, c: p.col }); setActiveDir("down"); tableRef.current?.focus(); } }}
                  className="flex items-start gap-2 px-2 py-1.5 rounded-lg text-sm mb-1 transition-colors"
                  style={{ background: isActive ? "var(--surface-2)" : "transparent", cursor: submitted ? "default" : "pointer", color: "var(--text-muted)" }}
                >
                  {res === true  && <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#10B981" }} />}
                  {res === false && <XCircle     size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#EF4444" }} />}
                  <span>
                    <strong style={{ color: "var(--text)" }}>{p.num}.</strong>{" "}
                    {p.def}
                    {" "}
                    <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>({p.word.length} letters)</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit / Redo */}
      <div className="flex gap-3">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 hover:scale-[1.01]"
            style={{ background: "linear-gradient(135deg, #2563EB, #F97316)" }}
          >
            Submit Crossword
          </button>
        ) : (
          <button
            onClick={handleRedo}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01]"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          >
            <RotateCcw size={15} /> Try Again
          </button>
        )}
      </div>
    </div>
  );
}
