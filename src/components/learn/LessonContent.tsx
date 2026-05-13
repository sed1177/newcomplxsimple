"use client";

interface Block {
  type: "heading" | "paragraph" | "code" | "list";
  content: string;
}

export function LessonContent({ contentJson }: { contentJson: string }) {
  let blocks: Block[] = [];
  try {
    const parsed = JSON.parse(contentJson);
    blocks = parsed.blocks ?? [];
  } catch {
    return <p style={{ color: "var(--text-muted)" }}>Content unavailable.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={i} className="text-2xl font-black mt-2" style={{ color: "var(--text)" }}>
                {block.content}
              </h2>
            );
          case "paragraph":
            return (
              <p key={i} className="leading-relaxed text-base" style={{ color: "var(--text-muted)" }}>
                {block.content}
              </p>
            );
          case "code":
            return (
              <pre
                key={i}
                className="p-5 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "#A5B4FC",
                }}
              >
                {block.content}
              </pre>
            );
          case "list":
            return (
              <ul key={i} className="flex flex-col gap-2 pl-2">
                {block.content.split("\n").map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-base" style={{ color: "var(--text-muted)" }}>
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
