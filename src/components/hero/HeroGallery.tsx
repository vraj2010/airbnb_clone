import Image from 'next/image';
import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import type { Photo } from '@/lib/listing';
import { photoTourHref } from '@/lib/overlay-state';

type HeroGalleryProps = {
  /** Only the five mosaic tiles. The caller slices; this component does not hold the full list. */
  tiles: Photo[];
  /** Total photo count, for the tile labels ("View photo 1 of 43"). */
  total: number;
};

/** Shared hover-dim + focus-ring treatment for every mosaic tile. */
const TILE_INTERACTION =
  'group relative block overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-primary';

/**
 * The dim overlay shown on hover/focus. An opacity modifier on a colour token is in
 * policy — see docs/TOKENS.md, "Opacity modifiers".
 */
const TILE_DIM_OVERLAY =
  'pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-fast ease-standard group-hover:bg-ink/10 group-focus-visible:bg-ink/10';

/**
 * The 5-tile hero mosaic. Geometry is measured, not estimated:
 * 560 + 8 + 272 + 8 + 272 = 1120 wide, 243 + 8 + 243 = 494 tall.
 *
 * This is a **Server Component**. It opens the overlays by navigating to URL state
 * (`?modal=…&modalItem=…`) via `next/link` rather than by calling a handler prop.
 *
 * That is not a stylistic preference. A function prop cannot be serialized across the
 * server/client boundary, so an `onOpenTour` callback was unpassable from `ListingPage`
 * (a Server Component) — wiring it would have meant making the whole page subtree a
 * client component. Routing the overlays instead keeps five `next/image` calls off the
 * client bundle, and makes both overlays linkable and back-button-friendly, which is how
 * the reference behaves.
 */
export function HeroGallery({ tiles, total }: HeroGalleryProps) {
  const [large, ...small] = tiles;
  if (!large) return null;

  return (
    <div className="hero-frame relative">
      <div className="hero-mosaic">
        <Link
          href={photoTourHref()}
          scroll={false}
          aria-label={`Open photo tour at photo 1 of ${total}`}
          className={`${TILE_INTERACTION} hero-tile-large`}
        >
          {/* alt="" — the link already carries the accessible name, so a second one would
              be announced twice. Descriptive alts live on the lightbox, where the image
              is the content rather than a control. */}
          <Image src={large.src} alt="" fill priority sizes="50vw" className="object-cover" />
          <span className={TILE_DIM_OVERLAY} />
        </Link>

        {small.map((photo, i) => {
          return (
            <Link
              key={photo.id}
              href={photoTourHref()}
              scroll={false}
              aria-label={`Open photo tour at photo ${i + 2} of ${total}`}
              className={TILE_INTERACTION}
            >
              <Image src={photo.src} alt="" fill sizes="25vw" className="object-cover" />
              <span className={TILE_DIM_OVERLAY} />
            </Link>
          );
        })}
      </div>

      <Link
        href={photoTourHref()}
        scroll={false}
        className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-sm border border-ink bg-canvas px-3.5 py-1.5 text-caption text-ink outline-none transition-colors duration-fast ease-standard hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary"
      >
        <LayoutGrid className="h-4 w-4" aria-hidden="true" />
        Show all photos
      </Link>
    </div>
  );
}
