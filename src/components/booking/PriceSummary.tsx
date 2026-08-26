'use client';

import { useBooking } from './BookingContext';

/**
 * The two live text rows in the reservation card, split out as their own client leaves so
 * `ReservationCard` itself can stay a Server Component — only the parts that actually
 * change with the date range cross the boundary.
 */

function money(currency: string, amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const cutoffFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

/** "₹28,499 for 5 nights", falling back to the nightly rate when no range is chosen. */
export function PriceHeadline() {
  const { total, nights, nightlyRate, currency } = useBooking();

  if (nights === 0) {
    return (
      <p className="flex items-baseline gap-2">
        <span className="text-display-md text-ink">{money(currency, nightlyRate)}</span>
        <span className="text-body-md text-ink">night</span>
      </p>
    );
  }

  return (
    <p className="flex items-baseline gap-2" aria-live="polite">
      <span className="text-display-md text-ink underline underline-offset-4">
        {money(currency, total)}
      </span>
      <span className="text-body-md text-ink">
        for {nights} night{nights === 1 ? '' : 's'}
      </span>
    </p>
  );
}

/** "Free cancellation before 17 October" — the day before check-in, so it moves with it. */
export function CancellationNotice() {
  const { cancellationCutoff } = useBooking();

  return (
    <p className="mt-4 rounded-sm bg-surface py-2 text-center text-note text-muted">
      {cancellationCutoff ? (
        <>
          Free cancellation before{' '}
          <span className="font-semibold">{cutoffFormatter.format(cancellationCutoff)}</span>
        </>
      ) : (
        'Add dates to see the cancellation policy'
      )}
    </p>
  );
}

/** Compact price + rating for the sticky sub-nav. */
export function NavPriceSummary({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const { total, nights, nightlyRate, currency } = useBooking();

  return (
    <p className="text-price-sm text-ink">
      {nights > 0 ? (
        <>
          {money(currency, total)}{' '}
          <span className="font-normal">
            for {nights} night{nights === 1 ? '' : 's'}
          </span>
        </>
      ) : (
        <>
          {money(currency, nightlyRate)} <span className="font-normal">night</span>
        </>
      )}
      <span className="sr-only">
        , rated {rating} from {reviewCount} reviews
      </span>
    </p>
  );
}
