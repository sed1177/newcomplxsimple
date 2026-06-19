import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_URL = "https://api.openai.com/v1/embeddings";

// Primary: Groq (free, fast). Fallback automatically to OpenAI if Groq fails.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_CHAT_MODEL = "gpt-4o-mini";

const SYSTEM_PERSONA = `You are Stark, the friendly AI learning assistant for ComplxSimple — an interactive tech education platform created by Cassandra Carter.

Your job is to answer student questions about the ComplxSimple website and the course content (Hardware, AI, Cybersecurity, HTML, and Linux).

Rules:
- Answer ONLY using the provided course context below. If the answer isn't in the context, say you don't have that info yet and suggest they ask Cassandra.
- Be warm, encouraging, and concise. You're talking to students who are learning.
- Never reveal crossword answers directly — instead give a hint and encourage them to try.
- If asked about something unrelated to tech or the course, gently steer back to learning.
- Keep responses short and clear unless asked to explain in depth.`;

// ── Embed a single query string ─────────────────────────────────────────────

async function embedQuery(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const res = await fetch(EMBEDDING_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
  });
  if (!res.ok) throw new Error(`Embedding failed (${res.status}): ${await res.text()}`);
  const json = await res.json();
  return json.data[0].embedding;
}

// ── Chat completion (Groq first, OpenAI fallback) ───────────────────────────

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function chatComplete(messages: ChatMessage[]): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;

  if (groqKey) {
    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({ model: GROQ_MODEL, messages, temperature: 0.4, max_tokens: 700 }),
      });
      if (res.ok) {
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content;
        if (content) return content;
      }
    } catch {
      // fall through to OpenAI
    }
  }

  // Fallback: OpenAI
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) throw new Error("No working chat API key (Groq failed, OPENAI_API_KEY missing)");

  const res = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
    body: JSON.stringify({ model: OPENAI_CHAT_MODEL, messages, temperature: 0.4, max_tokens: 700 }),
  });
  if (!res.ok) throw new Error(`Chat completion failed (${res.status}): ${await res.text()}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
}

// ── Internal query to fetch chunk docs by id ────────────────────────────────

export const getChunksByIds = internalQuery({
  args: { ids: v.array(v.id("lessonEmbeddings")) },
  handler: async (ctx, args) => {
    const docs = await Promise.all(args.ids.map((id) => ctx.db.get(id)));
    return docs
      .filter((d): d is NonNullable<typeof d> => d !== null)
      .map((d) => ({ title: d.title, chunkText: d.chunkText }));
  },
});

// ── Public action: the RAG chat endpoint ────────────────────────────────────

export const sendMessage = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, args): Promise<string> => {
    const lastUser = [...args.messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return "Ask me anything about ComplxSimple!";

    // 1. Embed the question
    const queryVector = await embedQuery(lastUser.content);

    // 2. Vector search for the most relevant course chunks
    const results = await ctx.vectorSearch("lessonEmbeddings", "by_embedding", {
      vector: queryVector,
      limit: 6,
    });

    // 3. Fetch the chunk text for those matches
    const chunks = await ctx.runQuery(internal.chat.getChunksByIds, {
      ids: results.map((r) => r._id as Id<"lessonEmbeddings">),
    });

    const context = chunks.length
      ? chunks.map((c, i) => `[${i + 1}] ${c.title}\n${c.chunkText}`).join("\n\n")
      : "No course content has been indexed yet.";

    // 4. Build the message list with retrieved context
    const systemPrompt = `${SYSTEM_PERSONA}\n\n=== COURSE CONTEXT ===\n${context}\n=== END CONTEXT ===`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      // Keep the last ~8 turns of conversation for continuity
      ...args.messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
    ];

    // 5. Generate the answer (Groq → OpenAI fallback)
    return await chatComplete(messages);
  },
});
