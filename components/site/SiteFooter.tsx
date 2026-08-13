import Link from "next/link";
import { FOOTER_COLUMNS, SOCIALS } from "@/lib/site";

// Site footer. Link columns + socials come from lib/site config. Social accounts
// that don't exist yet render as plain text (no fake URLs).
export function SiteFooter() {
  return (
    <footer className="border-t border-hair bg-paper">
      <div className="mx-auto max-w-content px-5 py-16 md:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="font-display text-lg font-semibold text-ink">
              The Annotated Career
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted">
              You've done more than you think. We help you see it — and turn it into your next move.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="label-mono text-muted">{col.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-ink/80 transition-colors hover:text-red">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-hair pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            © {2026} The Annotated Career. Built to help people move forward.
          </p>
          <ul className="flex items-center gap-5">
            {SOCIALS.map((s) => (
              <li key={s.label} className="text-sm">
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink/80 transition-colors hover:text-red"
                  >
                    {s.label}
                  </a>
                ) : (
                  <span className="text-muted" title="Coming soon">
                    {s.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
