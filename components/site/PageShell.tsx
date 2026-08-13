import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { BackToTop } from "./BackToTop";

// Standard page frame: fixed header, main landmark, footer, back-to-top. The
// header is fixed/overlay, so inner pages add their own top padding via `padTop`.
export function PageShell({
  children,
  padTop = true,
}: {
  children: ReactNode;
  padTop?: boolean;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main" className={padTop ? "pt-16" : ""}>
        {children}
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}
