"use client";

import { Download, Printer } from "lucide-react";

const TRACKS = [
  {
    name: "Hardware Fundamentals",
    color: "#F97316",
    description: "Explore the physical components that make up every computer — CPU, GPU, RAM, storage, motherboard, PSU, and cooling. Includes a hands-on drag-and-drop PC parts labeling game.",
    lessons: ["Introduction to PC Components", "The CPU: Brain of Your Computer", "PC Parts Interactive Game", "PC Parts Flashcards & Matching"],
  },
  {
    name: "AI Fundamentals",
    color: "#2563EB",
    description: "Understand artificial intelligence from the ground up — how machines learn from data, types of machine learning, neural networks, and real-world applications.",
    lessons: ["What is Artificial Intelligence?", "Machine Learning Basics", "AI Concepts: Check Your Understanding"],
  },
  {
    name: "Cybersecurity Basics",
    color: "#F97316",
    description: "Learn to identify and defend against real-world threats — phishing, malware, DDoS, SQL injection, and more. Understand the CIA Triad framework used by security professionals.",
    lessons: ["Introduction to Cybersecurity", "Common Cyber Threats", "Match the Cyber Threat"],
  },
  {
    name: "HTML Fundamentals",
    color: "#06B6D4",
    description: "Build your very first web page using HTML. Learn tags, document structure, links, images, and lists — then write live code in the built-in editor and preview it instantly.",
    lessons: ["What is HTML?", "HTML Tags and Elements", "Write Your First HTML"],
  },
  {
    name: "Linux Mastery",
    color: "#F59E0B",
    description: "Master the Linux command line — navigate the file system, manage permissions, write shell scripts, and understand the OS that powers the modern internet.",
    lessons: ["Introduction to Linux", "Essential Linux Commands", "File Permissions Explained"],
  },
];

export default function PamphletPage() {
  function handlePrint() {
    window.print();
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: #111 !important; }
          .page { box-shadow: none !important; }
          a { color: inherit !important; }
        }
        @page { margin: 1in; }
      `}</style>

      {/* Print/Download button — hidden when printing */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #2563EB, #F97316)" }}
        >
          <Printer size={15} /> Print / Save as PDF
        </button>
        <a href="/" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-70" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
          ← Back
        </a>
      </div>

      <div className="page max-w-3xl mx-auto px-8 py-12" style={{ background: "white", color: "#111", minHeight: "100vh" }}>
        {/* Header */}
        <div className="text-center mb-10 pb-8 border-b-2" style={{ borderColor: "#2563EB" }}>
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm" style={{ background: "linear-gradient(135deg, #2563EB, #F97316)" }}>
              C
            </div>
            <span className="text-2xl font-black" style={{ background: "linear-gradient(135deg, #2563EB, #F97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              ComplxSimple
            </span>
          </div>
          <h1 className="text-4xl font-black mt-2" style={{ color: "#111" }}>
            Interactive CS Learning Platform
          </h1>
          <p className="text-lg mt-2" style={{ color: "#555" }}>
            Making Computer Science simple, interactive, and fun
          </p>
        </div>

        {/* About the Course */}
        <section className="mb-10">
          <h2 className="text-xl font-black mb-3" style={{ color: "#111" }}>About ComplxSimple</h2>
          <p className="leading-relaxed" style={{ color: "#444" }}>
            ComplxSimple is an interactive CS education platform built for students who want to truly understand technology. Instead of passive reading, students engage with hands-on quizzes, drag-and-drop games, live code editors, flashcards, and matching activities — all tracked with XP points and daily streaks to keep motivation high.
          </p>
        </section>

        {/* About the Instructor */}
        <section className="mb-10 p-6 rounded-xl" style={{ background: "#f8f7ff", border: "2px solid #2563EB33" }}>
          <h2 className="text-xl font-black mb-2" style={{ color: "#111" }}>Your Instructor</h2>
          <p className="text-lg font-bold mb-1" style={{ color: "#2563EB" }}>Cassandra Carter</p>
          <p className="leading-relaxed" style={{ color: "#444" }}>
            Cassandra is a passionate CS educator dedicated to making technical concepts accessible to everyone. She designed ComplxSimple to bridge the gap between theory and hands-on understanding, ensuring every student gets personalized feedback and real-world applicable skills.
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-10">
          <h2 className="text-xl font-black mb-4" style={{ color: "#111" }}>How It Works</h2>
          <div className="space-y-3">
            {[
              ["1. Sign Up Free", "Create your account at the link below — no credit card required."],
              ["2. Choose a Track", "Pick from 5 CS tracks. Complete lessons at your own pace."],
              ["3. Learn Interactively", "Every lesson mixes reading, quizzes, games, and live coding."],
              ["4. Earn XP & Streaks", "Correct answers earn XP points and build your daily streak."],
              ["5. Get Feedback", "Cassandra reviews your progress and sends personal feedback."],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-3">
                <span className="font-black text-sm flex-shrink-0" style={{ color: "#2563EB" }}>{title}</span>
                <span className="text-sm" style={{ color: "#555" }}>{desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Tracks */}
        <section className="mb-10">
          <h2 className="text-xl font-black mb-5" style={{ color: "#111" }}>Course Tracks</h2>
          <div className="space-y-5">
            {TRACKS.map((track) => (
              <div key={track.name} className="pl-4" style={{ borderLeft: `4px solid ${track.color}` }}>
                <h3 className="font-black text-base mb-1" style={{ color: track.color }}>{track.name}</h3>
                <p className="text-sm mb-2" style={{ color: "#444" }}>{track.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {track.lessons.map((l) => (
                    <span key={l} className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${track.color}18`, color: track.color, border: `1px solid ${track.color}33` }}>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-10 p-6 rounded-xl" style={{ background: "#f8f7ff" }}>
          <h2 className="text-xl font-black mb-3" style={{ color: "#111" }}>Platform Features</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Interactive quizzes with instant feedback",
              "Drag-and-drop games and activities",
              "Live HTML code editor with preview",
              "Flashcard flip cards for memorization",
              "XP points and daily learning streaks",
              "Personal feedback from Cassandra",
              "Quote of the Week for motivation",
              "Class calendar with upcoming events",
              "Dark and light mode",
              "Works on phone, tablet, and desktop",
            ].map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm" style={{ color: "#444" }}>
                <span style={{ color: "#2563EB" }}>✓</span> {f}
              </div>
            ))}
          </div>
        </section>

        {/* Sign Up CTA */}
        <section className="text-center py-8 rounded-xl" style={{ background: "#2563EB15", border: "2px solid #2563EB33" }}>
          <h2 className="text-2xl font-black mb-2" style={{ color: "#111" }}>Ready to Start Learning?</h2>
          <p className="mb-4" style={{ color: "#555" }}>Sign up for free — no credit card needed.</p>
          <p className="text-xl font-black" style={{ color: "#2563EB" }}>localhost:3000</p>
          <p className="text-sm mt-2" style={{ color: "#888" }}>Ask Cassandra for the live URL once the platform is deployed.</p>
        </section>

        {/* Footer */}
        <div className="text-center mt-10 pt-6 border-t text-xs" style={{ borderColor: "#e5e7eb", color: "#999" }}>
          ComplxSimple · Designed and taught by Cassandra Carter · {new Date().getFullYear()}
        </div>
      </div>
    </>
  );
}
