import type { Listing } from '@/lib/listing';

/**
 * "Overall rating" — one bar per star value, 5 at the top down to 1.
 *
 * Bars are sized against the largest bucket rather than the review total, so a listing
 * whose reviews are almost all five-star (this one: 18 of 19) still fills the row instead
 * of rendering four invisible slivers next to one full bar. The schema guarantees the
 * counts sum to `reviewCount`, so the proportions can be trusted.
 */
export function RatingHistogram({ rating }: { rating: Listing['rating'] }) {
  const peak = Math.max(...rating.histogram.map((row) => row.count), 1);

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-title-md text-ink">Overall rating</p>
      {rating.histogram.map((row) => (
        <div key={row.stars} className="flex items-center gap-3">
          <span className="w-4 text-body-sm text-ink">{row.stars}</span>
          {/* Computed layout, not a design value — the one inline style this section
              allows itself, matching the convention in CategoryBars. */}
          <div className="h-1 flex-1 rounded-pill bg-surface" aria-hidden="true">
            <div
              className="h-1 rounded-pill bg-ink"
              style={{ width: `${(row.count / peak) * 100}%` }}
            />
          </div>
          <span className="sr-only">
            {row.stars} stars: {row.count} of {rating.reviewCount} reviews
          </span>
        </div>
      ))}
    </div>
  );
}
