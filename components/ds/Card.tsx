import Link from "next/link";
import type { ReactNode } from "react";

// Editorial card. Restrained by default (paper + hairline). When `href` is set
// the whole card becomes one keyboard-focusable link with a hover lift.
export function Card({
  children,
  href,
  className = "",
  tone = "surface",
}: {
  children: ReactNode;
  href?: string;
  className?: string;
  tone?: "surface" | "paper" | "warm";
}) {
  const toneClass = tone === "paper" ? "bg-paper" : tone === "warm" ? "bg-warmgray" : "bg-surface";
  const base = `group block rounded-card border border-hair ${toneClass} p-6 transition duration-300 ease-editorial`;

  if (href) {
    const isExternal = href.startsWith("http");
    const hoverable = `${base} hover:-translate-y-0.5 hover:shadow-lift focus-visible:-translate-y-0.5 ${className}`;
    return isExternal ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={hoverable}>
        {children}
      </a>
    ) : (
      <Link href={href} className={hoverable}>
        {children}
      </Link>
    );
  }
  return <div className={`${base} ${className}`}>{children}</div>;
}
