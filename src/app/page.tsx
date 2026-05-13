import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Cpu, Brain, Shield, Code, Terminal, Zap, Trophy, Users, Download, Quote } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SignInBtn, SignUpBtn, HeroButtons } from "@/components/layout/AuthButtons";
import { RainAnimation } from "@/components/layout/RainAnimation";

const TESTIMONIALS = [
  {
    text: "Coach Cassandra is a powerhouse when it comes to encouraging and mentoring her students. When I was learning under her, she helped me identify and overcome things that were holding me back from success. She never made me feel like I wasn't doing enough, and applauded my grit and always encouraged me to achieve my fullest potential. Even months after I had finished learning under her, she was still there to answer any questions I had about the field, a job, or just to advise me on life in general. She is an unforgettable coach and mentor and I credit her for much of my growth.",
    name: "Raheemah",
  },
  {
    text: "Before I began working with you, I didn't have a specific goal in mind, which left me feeling somewhat directionless in my IT journey. However, after our first few conversations, it became clear that you had the ability to help me clarify my goals and identify the steps I needed to take to achieve them. After working with you, I felt much more confident and focused. I now have a clear direction for my IT and the tools to continue growing and overcoming challenges. I would absolutely recommend your coaching and mentoring to others.",
    name: "Tsion Bulo",
  },
  {
    text: "Mrs. Cassandra is the best mentor I've ever had! She has always been there to help me improve every aspect of my career — from resume help, to improving my skill set, to pushing through adversity, to building more connections by being PROACTIVE! When she teaches IT, or anything that involves concepts, she breaks it down into easy pieces for anyone to understand. We are all super grateful to have someone like Mrs. Cassandra help us become not just better at our careers, but better in our lives as people!",
    name: "Shawn Holmes",
  },
  {
    text: "Cassandra Carter was amazing at explaining fundamentals and also when it comes to creating a clear picture of the IT space and how it interconnects with other aspects of the web.",
    name: "Eric Valdez",
  },
  {
    text: "I had the privilege of being coached by Coach Cassandra during my time in the Year Up program, and she is absolutely wonderful. She truly cares about her students, going above and beyond to support us not just in our technical growth but also in our personal and professional development. Her dedication, patience, and encouragement make all the difference. I'm incredibly grateful for her mentorship and the impact she has had on my journey. She's so so so so awesome!",
    name: "Jesse Olanrewaju",
  },
];

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  const tracks = [
    { icon: Cpu,      label: "Hardware Fundamentals", color: "#F97316", bg: "#F9731610" },
    { icon: Brain,    label: "AI Fundamentals",       color: "#2563EB", bg: "#2563EB10" },
    { icon: Shield,   label: "Cybersecurity Basics",  color: "#F97316", bg: "#F9731610" },
    { icon: Code,     label: "HTML Fundamentals",     color: "#06B6D4", bg: "#06B6D410" },
    { icon: Terminal, label: "Linux Mastery",         color: "#F59E0B", bg: "#F59E0B10" },
  ];

  const features = [
    { icon: Zap,    title: "Interactive Lessons",  desc: "Hands-on quizzes and games make learning stick — not just reading.", color: "#2563EB" },
    { icon: Trophy, title: "Track Your Progress",  desc: "Earn scores on every lesson. Watch your knowledge percentage grow.", color: "#F97316" },
    { icon: Users,  title: "Teacher Dashboard",    desc: "Cassandra can see every student's progress, grades, and send updates.", color: "#0EA5E9" },
  ];

  // Duplicate testimonials so the loop is seamless
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div className="min-h-screen relative" style={{ background: "var(--bg)" }}>
      <RainAnimation />

      {/* Nav */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg">
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
            style={{ background: "linear-gradient(135deg, #2563EB, #F97316)" }}
          >
            C
          </span>
          <span className="gradient-text">ComplxSimple</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <SignInBtn
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
          <SignUpBtn
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #2563EB, #F97316)" }}
          />
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: "rgba(37,99,235,0.12)" }} />
          <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full blur-3xl"      style={{ background: "rgba(249,115,22,0.10)" }} />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 rounded-full blur-3xl"     style={{ background: "rgba(14,165,233,0.08)" }} />
        </div>
        <div className="relative">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "linear-gradient(135deg, #2563EB, #F97316)" }} />
            Built for Cassandra Carter&apos;s Tech students
          </div>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight"
            style={{ color: "var(--text)" }}
          >
            Make Tech{" "}
            <span className="gradient-text">Simple</span>
            <br />& Fun to Learn
          </h1>
          <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: "var(--text-muted)" }}>
            Interactive lessons in Hardware, AI, Cybersecurity, HTML, and Linux. Play games, take quizzes, track your progress — and actually understand Tech.
          </p>
          <HeroButtons />
        </div>
      </section>

      {/* Tracks */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-3" style={{ color: "var(--text)" }}>Five Tracks to Master</h2>
        <p className="text-center mb-12 text-sm" style={{ color: "var(--text-muted)" }}>More Tech topics coming soon</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {tracks.map((track) => (
            <div
              key={track.label}
              className="card p-5 flex flex-col items-center text-center gap-3 hover:scale-105 transition-transform cursor-default"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: track.bg, border: `1px solid ${track.color}33` }}
              >
                <track.icon size={24} style={{ color: track.color }} />
              </div>
              <p className="font-semibold text-xs" style={{ color: "var(--text)" }}>{track.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Linux spotlight — Cassandra's quote */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div
          className="rounded-3xl p-8 sm:p-10 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1c1917 0%, #292524 100%)", border: "1px solid #44403c" }}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle at 70% 50%, #F59E0B, transparent 60%)" }} />
          <div className="relative flex flex-col sm:flex-row items-start gap-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
              style={{ background: "#F59E0B20", border: "1px solid #F59E0B44" }}
            >
              🐧
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Terminal size={14} style={{ color: "#F59E0B" }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#F59E0B" }}>Linux Mastery Track</span>
              </div>
              <p className="text-lg font-semibold leading-relaxed mb-3" style={{ color: "#fafaf9" }}>
                &ldquo;This is not just a certification — it&apos;s a <span style={{ color: "#F59E0B" }}>job-ready pathway</span> to managing servers at scale. At the end of this training you should be confident applying to System Admin roles and managing servers and Linux environments at scale!&rdquo;
              </p>
              <p className="text-sm font-semibold" style={{ color: "#a8a29e" }}>— Cassandra Carter</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card p-8">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}18` }}
              >
                <f.icon size={22} style={{ color: f.color }} />
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text)" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stark teaser */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div
          className="rounded-3xl p-8 sm:p-12 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #020d0d 0%, #071a17 40%, #030f0f 100%)", border: "1px solid rgba(20,184,166,0.25)" }}
        >
          {/* Teal glow blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 left-1/4 w-96 h-96 rounded-full" style={{ background: "rgba(20,184,166,0.12)", filter: "blur(70px)" }} />
            <div className="absolute -bottom-20 right-1/3 w-72 h-72 rounded-full" style={{ background: "rgba(13,148,136,0.10)", filter: "blur(60px)" }} />
          </div>

          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Logo mark */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #0d4f4a, #14B8A6)",
                boxShadow: "0 0 40px rgba(20,184,166,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                border: "1px solid rgba(20,184,166,0.4)",
              }}
            >
              <span style={{ fontFamily: "var(--font-orbitron)", fontWeight: 900, fontSize: "28px", color: "#fff", letterSpacing: "-1px" }}>S</span>
            </div>

            <div className="flex-1">
              {/* Name + badge */}
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h2
                  style={{
                    fontFamily: "var(--font-orbitron)",
                    fontWeight: 900,
                    fontSize: "clamp(28px, 5vw, 40px)",
                    color: "#fff",
                    letterSpacing: "0.05em",
                    lineHeight: 1,
                  }}
                >
                  STARK
                </h2>
                <span
                  style={{
                    fontFamily: "var(--font-orbitron)",
                    fontWeight: 700,
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    color: "#14B8A6",
                    border: "1px solid #14B8A644",
                    background: "#14B8A610",
                    padding: "4px 10px",
                    borderRadius: "99px",
                  }}
                >
                  COMING SOON
                </span>
              </div>

              <p className="text-base leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.6)", maxWidth: "580px" }}>
                An AI assistant trained specifically on this course — ready to answer your Tech questions anytime, break down concepts, and guide your learning. Built with intentional diversity: Stark is trained on truthful, accurate data about Black and Brown people to actively reduce AI bias from day one.
              </p>

              <div className="flex flex-wrap gap-2 mb-5">
                {["Course-specific knowledge", "24/7 Tech Q&A", "Bias-aware AI", "Career guidance", "Explain any concept"].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(20,184,166,0.08)", color: "#5eead4", border: "1px solid rgba(20,184,166,0.2)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p
                className="text-sm font-semibold"
                style={{ fontFamily: "var(--font-orbitron)", color: "#14B8A6", letterSpacing: "0.04em", fontSize: "11px" }}
              >
                SIGN UP NOW TO BE NOTIFIED AT LAUNCH →
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials — infinite horizontal marquee */}
      <section className="relative z-10 pb-32">
        <h2 className="text-3xl font-bold text-center mb-3 px-6" style={{ color: "var(--text)" }}>What Students Say</h2>
        <p className="text-center mb-10 text-sm px-6" style={{ color: "var(--text-muted)" }}>Real feedback from Cassandra&apos;s students</p>

        <div className="marquee-wrapper">
          <div className="marquee-track">
            {doubled.map((t, i) => (
              <div
                key={i}
                className="card mx-4 p-6 flex-shrink-0"
                style={{ width: "360px", maxWidth: "90vw", position: "relative" }}
              >
                <Quote size={28} className="mb-3 opacity-20" style={{ color: "#2563EB" }} />
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: "var(--text-muted)", display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                >
                  {t.text}
                </p>
                <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #2563EB, #F97316)" }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>ComplxSimple Student</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 border-t py-8 text-center text-sm"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-3">
          <a
            href="/pamphlet"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #2563EB, #F97316)", color: "white" }}
          >
            <Download size={15} /> Download Course Guide (PDF)
          </a>
        </div>
        ComplxSimple &mdash; Built with ❤️ for Cassandra Carter&apos;s students
      </footer>
    </div>
  );
}
