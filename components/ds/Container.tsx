import type { ReactNode } from "react";

// Centered content column at the brand container width. The one place page
// horizontal padding + max width is defined, so every section aligns.
export function Container({
  children,
  className = "",
  width = "content",
}: {
  children: ReactNode;
  className?: string;
  /** "content" = 1200px (default), "prose" = comfortable reading measure. */
  width?: "content" | "prose" | "full";
}) {
  const max = width === "prose" ? "max-w-prose" : width === "full" ? "max-w-none" : "max-w-content";
  return <div className={`mx-auto w-full ${max} px-5 md:px-8 ${className}`}>{children}</div>;
}
