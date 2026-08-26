import { Globe } from 'lucide-react';
import { Logo } from './Logo';
import { SearchPill } from './SearchPill';
import { UserMenu } from './UserMenu';

/**
 * Full-bleed header. Measured over CDP as `position: relative` — it scrolls away and
 * hands the top of the viewport to `SecondaryNav`, rather than staying pinned. Its inner wrapper uses the SAME `container-page px-10
 * 2xl:px-20` as `<main>`, so the logo's left edge and the page content's left edge land on
 * one vertical grid line — that shared bound is the point of the container.
 *
 * The pill stays absolutely centred on the container rather than flowed by
 * `justify-between`, which would only centre it when the logo and the nav happen to be
 * equally wide.
 */
export function SiteHeader() {
  return (
    <header
      data-sticky-header
      className="relative z-30 w-full border-b border-border-soft bg-canvas"
    >
      <div className="container-header relative flex h-header-height items-center justify-between">
        <Logo />
        <div className="absolute left-1/2 -translate-x-1/2">
          <SearchPill />
        </div>

        <nav aria-label="Host and account" className="flex items-center gap-2.5">
          <button
            type="button"
            className="rounded-pill px-4 py-2 text-nav-label text-ink transition-colors duration-fast ease-standard hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Become a host
          </button>

          <button
            type="button"
            aria-label="Choose a language and region"
            className="flex h-header-icon-button-size w-header-icon-button-size shrink-0 items-center justify-center rounded-pill bg-header-control text-ink transition-colors duration-fast ease-standard hover:bg-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Globe className="h-5 w-5" aria-hidden="true" />
          </button>

          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
