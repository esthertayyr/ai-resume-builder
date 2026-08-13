"use client";

import { useEffect, useRef, useState } from "react";

// The recurring "Career Thread" — a subtle hand-drawn line that connects major
// sections of the story (hero → experience → skills → resume → next move). It
// draws itself when scrolled into view, and stays still for reduced-motion users.
// Purely decorative punctuation: never conveys information on its own.

type Props = {
  /** Vertical connector between two sections (default) or a short horizontal tie. */
  orientation?: "vertical" | "horizontal";
  className?: string;
  /** Height in px for vertical threads. */
  length?: number;
};

export function CareerThread({ orientation = "vertical", className = "", length = 120 }: Props) {
  const ref = useRef<SVGSVGElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setShown(true);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (orientation === "horizontal") {
    return (
      <svg
        ref={ref}
        className={`overflow-visible ${className}`}
        width="100%"
        height="16"
        viewBox="0 0 240 16"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <path
          d="M2 8 C 60 2, 120 14, 180 6 S 236 8, 238 8"
          stroke="#C92F32"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="320"
          style={{ ["--dash" as string]: "320" }}
          className={shown ? "animate-draw" : undefined}
          strokeDashoffset={shown ? undefined : 320}
        />
      </svg>
    );
  }

  return (
    <svg
      ref={ref}
      className={`mx-auto overflow-visible ${className}`}
      width="40"
      height={length}
      viewBox={`0 0 40 ${length}`}
      fill="none"
      aria-hidden
    >
      <path
        d={`M20 2 C 6 ${length * 0.3}, 34 ${length * 0.6}, 20 ${length - 2}`}
        stroke="#C92F32"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={length * 2}
        style={{ ["--dash" as string]: String(length * 2) }}
        className={shown ? "animate-draw" : undefined}
        strokeDashoffset={shown ? undefined : length * 2}
      />
    </svg>
  );
}
