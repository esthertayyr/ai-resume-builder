import type { ReactNode } from "react";

// Hand-drawn Teacher-Red annotation marks — the brand's signature punctuation.
// Used intentionally, never as random doodles. Marks are decorative (aria-hidden);
// any meaning they carry is always also present in real text.

/** Handwritten margin note in Teacher Red. */
export function Annotation({
  children,
  className = "",
  rotate = -3,
}: {
  children: ReactNode;
  className?: string;
  rotate?: number;
}) {
  return (
    <span
      className={`hand text-red ${className}`}
      style={{ display: "inline-block", transform: `rotate(${rotate}deg)`, fontSize: "1.5em" }}
    >
      {children}
    </span>
  );
}

/** Wrap a word/phrase to give it a hand-drawn red underline that animates in. */
export function Underline({
  children,
  className = "",
  animate = true,
}: {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <svg
        className="pointer-events-none absolute -bottom-1 left-0 h-3 w-full overflow-visible text-red"
        viewBox="0 0 200 12"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <path
          d="M2 8 C 40 3, 80 11, 120 6 S 190 3, 198 7"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className={animate ? "animate-draw" : undefined}
          style={{ ["--dash" as string]: "260" }}
          strokeDasharray={animate ? "260" : undefined}
        />
      </svg>
    </span>
  );
}

/** Hand-drawn circle around an element (e.g. a selected skill). */
export function CircleMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full overflow-visible text-red ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
    >
      <path
        d="M50 6 C 82 6, 96 26, 94 52 C 92 82, 66 96, 44 94 C 16 92, 4 68, 8 42 C 12 18, 30 6, 54 8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
