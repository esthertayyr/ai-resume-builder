import type { Block } from "@/lib/resources/content";

// Single renderer for article bodies. Keeps every article visually consistent
// and means new articles are pure data — no bespoke markup per post.
export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="max-w-prose space-y-5">
      {blocks.map((b, i) => {
        if (b.type === "h2") {
          return (
            <h2 key={i} className="mt-8 font-display text-2xl font-semibold text-ink">
              {b.text}
            </h2>
          );
        }
        if (b.type === "ul") {
          return (
            <ul key={i} className="space-y-2">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-2 text-ink">
                  <span className="mt-1 text-red" aria-hidden>
                    •
                  </span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="leading-relaxed text-ink">
            {b.text}
          </p>
        );
      })}
    </div>
  );
}
