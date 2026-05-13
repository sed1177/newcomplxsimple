"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { Cpu, Brain, Shield, Code, ArrowRight, BookOpen } from "lucide-react";
import { cn, percentageBg } from "@/lib/utils";

const TRACK_ICONS: Record<string, React.ElementType> = {
  hardware: Cpu,
  ai: Brain,
  cybersecurity: Shield,
  html: Code,
};

export default function LearnPage() {
  const tracks = useQuery(api.tracks.list);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-black mb-2" style={{ color: "var(--text)" }}>Learning Tracks</h1>
        <p style={{ color: "var(--text-muted)" }}>Choose a track to start learning. More tracks coming soon!</p>
      </div>

      {!tracks ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-8 animate-pulse h-28" style={{ background: "var(--surface-2)" }} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {tracks
            .sort((a, b) => a.order - b.order)
            .map((track) => {
              const Icon = TRACK_ICONS[track.slug] ?? BookOpen;
              return (
                <Link
                  key={track._id}
                  href={`/learn/${track.slug}`}
                  className="card p-6 flex items-center gap-6 hover:scale-[1.01] transition-transform group"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${track.color}22`, border: `1px solid ${track.color}44` }}
                  >
                    <Icon size={28} style={{ color: track.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text)" }}>{track.name}</h2>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>{track.description}</p>
                  </div>
                  <ArrowRight size={20} className="flex-shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: track.color }} />
                </Link>
              );
            })}
        </div>
      )}
    </div>
  );
}
