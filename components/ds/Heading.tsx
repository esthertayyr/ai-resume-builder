import type { ElementType, ReactNode } from "react";

// Editorial high-contrast serif heading. `level` controls semantics (h1–h4);
// `size` controls the visual display scale independently, so heading hierarchy
// stays correct for screen readers even when a smaller visual size is wanted.
const SIZE = {
  xl: "text-display-xl",
  lg: "text-display-lg",
  md: "text-display-md",
  sm: "text-display-sm",
} as const;

export function Heading({
  children,
  level = 2,
  size = "lg",
  className = "",
  as,
}: {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4;
  size?: keyof typeof SIZE;
  className?: string;
  as?: ElementType;
}) {
  const Tag: ElementType = as ?? (`h${level}` as ElementType);
  return (
    <Tag className={`font-display font-semibold text-ink ${SIZE[size]} text-balance ${className}`}>
      {children}
    </Tag>
  );
}
