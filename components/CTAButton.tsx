import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary";

const styles: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-soft hover:brightness-105 hover:shadow-lift active:scale-[0.98]",
  secondary:
    "bg-white text-navy ring-1 ring-hair hover:ring-sky/50 hover:shadow-soft active:scale-[0.98]",
};

export function CTAButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-7 py-3.5 text-base font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${styles[variant]}`}
    >
      {children}
    </Link>
  );
}
