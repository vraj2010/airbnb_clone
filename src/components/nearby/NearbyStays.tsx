import Image from 'next/image';
import { Star } from 'lucide-react';
import type { Listing } from '@/lib/listing';

/**
 * "More stays nearby": a horizontally scrolling row of listing cards. Server component —
 * the cards are links in the reference, but there is only one seeded listing to link to, so
 * they are rendered as static cards rather than links that would dead-end on the same page.
 */
export function NearbyStays({ listing }: { listing: Listing }) {
  const { nearbyStays, price } = listing;

  if (nearbyStays.length === 0) return null;

  const format = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: price.currency,
    maximumFractionDigits: 0,
  });

  return (
    <section aria-labelledby="nearby-heading" className="border-t border-border-soft py-section-gap">
      <h2 id="nearby-heading" className="text-display-md text-ink">
        More stays nearby
      </h2>

      {/* A track, not a grid. Measured on the reference, the cards are 208px wide and step
          228px apart, so exactly five fill the 1120px content width and the rest overflow.
          A six-column grid would shrink every card to fit; scrolling keeps them at size. */}
      {/* `tabIndex` because the track scrolls: a scrollable region that cannot be focused
          is unreachable by keyboard, since there is nothing tabbable inside these static
          cards to scroll it into view. The label names what the arrow keys will move. */}
      <ul
        tabIndex={0}
        aria-label="More stays nearby, scroll for more"
        className="mt-6 flex gap-nearby-card-gap overflow-x-auto pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {nearbyStays.map((stay) => (
          <li key={stay.id} className="flex w-nearby-card-width shrink-0 flex-col gap-2">
            <div className="relative aspect-square overflow-hidden rounded-image">
              <Image src={stay.src} alt={stay.alt} fill sizes="208px" className="object-cover" />
            </div>
            <p className="text-title-md text-ink line-clamp-2">{stay.title}</p>
            <p className="flex items-center justify-between gap-2 text-body-sm text-body">
              <span>{format.format(stay.price)}</span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-ink text-ink" aria-hidden="true" />
                <span className="sr-only">Rated</span>
                {stay.rating.toFixed(2)}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
