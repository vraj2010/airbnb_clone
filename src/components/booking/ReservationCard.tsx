import { Flag } from 'lucide-react';
import Image from 'next/image';
import type { Listing } from '@/lib/listing';
import { DateGuestSelector } from './DateGuestSelector';
import { CancellationNotice, PriceHeadline } from './PriceSummary';

type ReservationCardProps = {
  listing: Listing;
};

/**
 * The whole right column: the 10%-off promo card, the sticky reservation card, and the
 * "Report this listing" link beneath it. Geometry is measured over CDP — promo card
 * 372x70, a 24px gap, the reservation card 372x368 with 22px padding and a 322x48 CTA,
 * then a 26px gap to the report link, all inside a `sticky; top: 100px` wrapper.
 *
 * Still a Server Component. The three parts that move with the date range — the price
 * headline, the cancellation cutoff and the date/guest control — are client leaves that
 * read `BookingContext`, so nothing else in this column crosses the boundary.
 */
export function ReservationCard({ listing }: ReservationCardProps) {
  const { discount } = listing;

  return (
    <div className="sticky top-sticky-top-offset flex flex-col">
      <div className="flex items-center gap-4 rounded-card border border-border px-5 py-4">
        {/* The reference's own badge artwork, 32x32. It was a lucide `Tag` glyph until the
            real asset was pulled in — the shape and the green are not ours to approximate. */}
        <Image
          src="/photos/ref/discount.svg"
          alt=""
          width={32}
          height={32}
          className="h-discount-badge-size w-discount-badge-size shrink-0"
        />
        <div className="flex-1">
          <p className="text-card-body text-ink">{discount.label}</p>
          <p className="text-nav-label text-ink underline underline-offset-2">
            {discount.termsLabel}
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-sm bg-surface px-5 py-2 text-nav-label text-ink transition-colors duration-fast ease-standard hover:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {discount.ctaLabel}
        </button>
      </div>

      <div className="mt-promo-card-gap rounded-card border border-border-soft bg-canvas p-card-padding shadow-system">
        <PriceHeadline />

        <div className="mt-6">
          <DateGuestSelector />
        </div>

        <CancellationNotice />

        <button
          type="button"
          className="mt-4 h-reserve-button-height w-full rounded-pill bg-linear-to-r from-primary-gradient-from to-primary-gradient-to text-center text-nav-label text-canvas transition-opacity duration-fast ease-standard hover:opacity-90"
        >
          Reserve
        </button>

        <p className="mt-4 text-center text-body-sm text-muted">You won’t be charged yet</p>
      </div>

      <p className="mt-report-gap flex items-center justify-center gap-3 text-body-sm text-muted">
        <Flag className="h-4 w-4" aria-hidden="true" />
        <span className="underline underline-offset-2">Report this listing</span>
      </p>
    </div>
  );
}
