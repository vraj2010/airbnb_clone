import Image from 'next/image';
import { Search } from 'lucide-react';

/**
 * Header search pill. No search state exists yet, so the segment labels are static text
 * and the only real control is the circular search button — kept inert, like the other
 * placeholder nav controls in SiteHeader.
 *
 * Measured over CDP against the live reference (404x48 outer):
 *   pill        padding 0 8px, 1px #DDDDDD, fully rounded,
 *               shadow rgba(0,0,0,0.08) 0 1px 4px — ONE layer, not two
 *   Anywhere    149x48, padding 0 16px, 14/500, and it CONTAINS the house glyph
 *   divider     1x24 #DDDDDD
 *   Anytime      88x48, padding 0 16px, 14/500
 *   divider     1x24 #DDDDDD
 *   Add guests  106x48, padding 0 16px, 14/400, muted
 *   search      32x32 disc, #FF385C, 8px in from the pill's right edge
 *
 * Two things that were wrong before and are worth naming: the glyph is a 48x48 image
 * filling the pill's full height *inside* the Anywhere segment, not a small inline emoji
 * sitting beside it; and the pill's own padding is 8px — the 16px belongs to each segment.
 * The glyph is the house illustration supplied by the project owner, trimmed to its ink
 * bounds so it fills the 48px box the way the reference's does — previously this was an
 * OS emoji, which drew in a different style on every platform.
 */
export function SearchPill() {
  const segment = 'flex h-full items-center px-4 text-nav-label';

  return (
    <div
      role="search"
      aria-label="Search listings"
      className="flex h-search-pill-height items-center rounded-pill border border-border bg-canvas px-2 shadow-search transition-shadow duration-fast ease-standard hover:shadow-search-hover"
    >
      <span className={`${segment} gap-1 text-ink`}>
        <Image
          src="/brand/searchbar-house.png"
          alt=""
          width={184}
          height={182}
          priority
          className="h-search-lead-icon-size w-search-lead-icon-size shrink-0 object-contain"
        />
        Anywhere
      </span>

      <span aria-hidden="true" className="h-search-divider-height w-px shrink-0 bg-border" />

      <span className={`${segment} text-ink`}>Anytime</span>

      <span aria-hidden="true" className="h-search-divider-height w-px shrink-0 bg-border" />

      <span className={`${segment} font-normal text-muted`}>Add guests</span>

      <button
        type="button"
        aria-label="Search"
        className="ml-2 flex h-search-button-size w-search-button-size shrink-0 items-center justify-center rounded-pill bg-primary text-canvas transition-opacity duration-fast ease-standard hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Search className="h-3 w-3" aria-hidden="true" strokeWidth={3} />
      </button>
    </div>
  );
}
