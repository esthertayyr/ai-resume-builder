import { Button } from "@/components/ds";
import { SUPPORT_URL } from "@/lib/site";

// Reusable, optional, non-pressuring support prompt. If SUPPORT_URL is configured
// it renders a real external button; otherwise a clearly-marked "coming soon"
// state — never a fake payment link.
export function SupportCTA({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "" : "text-center"}>
      <h2 className="font-display text-display-sm font-semibold text-ink">
        Built to help people move forward.
      </h2>
      <p className="mx-auto mt-3 max-w-prose text-muted">
        The Annotated Career is free to use. If this helped you take your next step, you can support
        the project with a coffee — completely optional.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        {SUPPORT_URL ? (
          <Button href={SUPPORT_URL} external size="lg" variant="secondary">
            ☕ Buy Me a Coffee →
          </Button>
        ) : (
          <span className="label-mono rounded-pill bg-warmgray px-4 py-3 text-muted">
            ☕ Buy Me a Coffee · coming soon
          </span>
        )}
      </div>
    </div>
  );
}
