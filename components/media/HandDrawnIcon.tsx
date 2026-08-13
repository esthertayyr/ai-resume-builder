import Image from "next/image";
import { getAsset } from "@/lib/assets/manifest";

// Hand-drawn icon / annotation element. Square, transparent-background asset rendered
// at an explicit pixel size (prevents layout shift). Meaningful icons take alt text;
// purely decorative annotation overlays resolve to alt="" and are hidden from AT.

type Props = {
  /** Manifest asset id (e.g. "how-resume", "who-starting-out", "annotation-arrow"). */
  assetId?: string;
  src?: string;
  alt?: string;
  /** Rendered edge in px (asset master is 1024 or 2000). */
  size?: number;
  className?: string;
};

export function HandDrawnIcon({ assetId, src, alt, size = 64, className = "" }: Props) {
  const spec = assetId ? getAsset(assetId) : undefined;
  const resolvedSrc = src ?? spec?.file;
  const resolvedAlt = alt ?? spec?.alt ?? "";

  if (!resolvedSrc) {
    // Production-ready placeholder: a hand-drawn-style square glyph at the exact
    // icon footprint, so spacing and rhythm are final before artwork lands.
    const meaningful = (alt ?? spec?.alt ?? "") !== "";
    return (
      <span
        className={`inline-flex items-center justify-center rounded-[0.7rem] border border-dashed border-red/40 bg-red/5 text-red ${className}`}
        style={{ width: size, height: size }}
        role={meaningful ? "img" : undefined}
        aria-label={meaningful ? (alt ?? spec?.alt) : undefined}
        aria-hidden={meaningful ? undefined : true}
      >
        <svg viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5} fill="none" aria-hidden>
          <path
            d="M4 15 C 8 6, 16 6, 20 14 M7 19 C 11 16, 14 16, 18 19"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={resolvedAlt}
      width={size}
      height={size}
      loading="lazy"
      className={className}
      aria-hidden={resolvedAlt === "" ? true : undefined}
    />
  );
}
