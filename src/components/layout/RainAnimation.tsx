"use client";

import { useEffect, useState } from "react";

interface Drop {
  id: number;
  left: number;
  delay: number;
  duration: number;
  opacity: number;
  width: number;
  height: number;
}

export function RainAnimation() {
  const [drops, setDrops] = useState<Drop[]>([]);

  useEffect(() => {
    const generated: Drop[] = Array.from({ length: 55 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 1 + Math.random() * 1.5,
      opacity: 0.15 + Math.random() * 0.25,
      width: 1 + Math.random() * 1,
      height: 12 + Math.random() * 18,
    }));
    setDrops(generated);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="rain-drop"
          style={{
            left: `${drop.left}%`,
            width: `${drop.width}px`,
            height: `${drop.height}px`,
            opacity: drop.opacity,
            animationDelay: `${drop.delay}s`,
            animationDuration: `${drop.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
