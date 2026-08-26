import type { Listing } from '@/lib/listing';
import { LaurelImage } from './LaurelWreath';

/**
 * The header of the Reviews section: overall score flanked by laurel branches,
 * the "Guest favourite" title, and a one-line explainer. Ratings are shown as a
 * plain number in ink, not gold stars - that's a deliberate Airbnb brand choice.
 */
export function RatingSummary({ listing }: { listing: Listing }) {
  const { overall, isGuestFavourite, blurb } = listing.rating;
  const formatted = overall.toFixed(2);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex items-center gap-3 text-ink">
        <LaurelImage />
        <span className="text-rating" aria-hidden="true">
          {formatted}
        </span>
        <LaurelImage flip />
      </div>
      <span className="sr-only">Overall rating: {formatted} out of 5</span>
      {isGuestFavourite && <h3 className="text-display-md text-ink">Guest favourite</h3>}
      {/* The explainer is seed content, not a constant: it is the reference's own
          wording for the badge and belongs with the rest of the captured copy. */}
      <p className="max-w-md text-body-md text-body">{blurb}</p>
      {/* Static text, not a link: the reference opens a policy dialog this build has no
          content for, and a link that goes nowhere is worse than none. */}
      <p className="text-body-md text-ink underline underline-offset-2">How reviews work</p>
    </div>
  );
}
