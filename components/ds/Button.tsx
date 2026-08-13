import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

// One button primitive for the whole site. Renders a real <Link> when `href` is
// given, otherwise a real <button> — both fully keyboard accessible. Teacher Red
// is used for the primary action; secondary/ghost keep the accent for text/ring
// so red never floods the page.
type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-pill font-sans font-semibold " +
  "transition duration-300 ease-editorial active:scale-[0.98] disabled:pointer-events-none " +
  "disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-red";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-red text-paper hover:bg-[#CC2E3A] shadow-soft",
  secondary: "bg-surface text-ink ring-1 ring-hair hover:ring-ink",
  ghost: "bg-transparent text-ink hover:text-red",
};

const SIZES: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

type LinkProps = CommonProps & { href: string; external?: boolean };
type NativeProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

export function Button(props: LinkProps | NativeProps) {
  const { children, variant = "primary", size = "md", className = "" } = props;
  const cls = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if ("href" in props && props.href) {
    const { external } = props as LinkProps;
    if (external) {
      return (
        <a href={props.href} target="_blank" rel="noopener noreferrer" className={cls}>
          {children}
        </a>
      );
    }
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as NativeProps;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
