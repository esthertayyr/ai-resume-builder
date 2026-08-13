import Image from "next/image";
import { ASPECT_CLASS, getAsset, MASTER_SIZES, type AspectRatio } from "@/lib/assets/manifest";

// Reusable responsive editorial image. Wraps next/image (ships with Next — no new
// dependency) to give us, for free: automatic WebP/AVIF, responsive srcset from the
// `sizes` hint, lazy-loading below the fold, and layout-shift prevention.
//
// The image fills an aspect-ratio container (from the manifest), so the box reserves
// its space before the file loads — no CLS. Pass an `assetId` from the manifest
// (preferred: ratio + alt come from the spec) or explicit props.

type Props = {
  /** Manifest asset id — pulls file, ratio, alt and priority automatically. */
  assetId?: string;
  /** Or provide these directly. */
  src?: string;
  alt?: string;
  ratio?: AspectRatio;
  /** Responsive sizes hint, e.g. "(max-width: 768px) 100vw, 50vw". */
  sizes?: string;
  /** True for the critical hero poster only (eager + preload). */
  priority?: boolean;
  /** CSS object-position, e.g. "center", "left top" — art-direct the crop. */
  objectPosition?: string;
  className?: string;
  /** Rounded corners etc. on the image itself. */
  imageClassName?: string;
};

export function EditorialImage({
  assetId,
  src,
  alt,
  ratio,
  sizes = "100vw",
  priority,
  objectPosition = "center",
  className = "",
  imageClassName = "",
}: Props) {
  // Resolve from the manifest when an id is given.
  const spec = assetId ? getAsset(assetId) : undefined;
  const resolvedSrc = src ?? spec?.file;
  const resolvedAlt = alt ?? spec?.alt ?? "";
  const resolvedRatio: AspectRatio = ratio ?? (spec ? MASTER_SIZES[spec.size].ratio : "4:3");
  const resolvedPriority = priority ?? spec?.priority === "critical";

  if (!resolvedSrc) {
    // No final artwork yet — render a PRODUCTION-READY placeholder at the exact
    // intended aspect ratio, so the layout, cropping and composition are already
    // locked in. When the real file lands in /public it drops straight in with
    // zero layout shift. Never emits a fake/broken remote URL.
    const label = spec?.alt || alt || "Editorial image";
    const dims = spec ? `${MASTER_SIZES[spec.size].w}×${MASTER_SIZES[spec.size].h}` : undefined;
    return (
      <div
        className={`relative flex items-end overflow-hidden rounded-card border border-hair bg-warmgray ${ASPECT_CLASS[resolvedRatio]} ${className}`}
        role="img"
        aria-label={label}
      >
        {/* Faint editorial framing lines so the crop reads as intentional. */}
        <div
          className="pointer-events-none absolute inset-3 rounded-[0.6rem] border border-dashed border-ink/10"
          aria-hidden
        />
        <div className="relative z-10 p-4">
          <span className="label-mono block text-ink/40">Image · {resolvedRatio}</span>
          <span className="mt-1 block max-w-[28ch] font-display text-sm text-ink/55">{label}</span>
          {dims ? <span className="label-mono mt-1 block text-ink/30">{dims}</span> : null}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${ASPECT_CLASS[resolvedRatio]} ${className}`}>
      <Image
        src={resolvedSrc}
        alt={resolvedAlt}
        fill
        sizes={sizes}
        priority={resolvedPriority}
        loading={resolvedPriority ? undefined : "lazy"}
        style={{ objectFit: "cover", objectPosition }}
        className={imageClassName}
      />
    </div>
  );
}
