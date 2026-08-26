import type { Listing } from '@/lib/listing';
import { RatingSummary } from './RatingSummary';
import { RatingHistogram } from './RatingHistogram';
import { CategoryBars } from './CategoryBars';
import { ReviewTags } from './ReviewTags';
import { ReviewCard } from './ReviewCard';

/**
 * Reviews section: rating summary, the star histogram beside the category bars, the
 * topic pills, then a divider and the review card grid. Static apart from each card's
 * "Show more", which is its own client leaf, so this stays a Server Component.
 * The section heading is visually hidden; "Guest favourite" (inside `RatingSummary`)
 * carries the visible title, so it doubles as the on-page h3.
 *
 * `rating.reviewCount` (19) is the listing's real total and `reviews.length` (6) is what
 * the seed carries — the button says 19 because that is what the reference promises, and
 * the two numbers are deliberately allowed to differ.
 */
export function Reviews({ listing }: { listing: Listing }) {
  const { rating, ratingBreakdown, reviewTags, reviews } = listing;

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="flex flex-col gap-8 py-section-gap">
      <h2 id="reviews-heading" className="sr-only">
        Ratings and reviews
      </h2>

      <RatingSummary listing={listing} />

      <div className="flex items-center gap-12">
        <div className="w-64 shrink-0">
          <RatingHistogram rating={rating} />
        </div>
        <div className="flex-1">
          <CategoryBars breakdown={ratingBreakdown} />
        </div>
      </div>

      <ReviewTags tags={reviewTags} />

      <div className="flex flex-col gap-8 border-t border-border-soft pt-8">
        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        <button
          type="button"
          className="self-start rounded-sm border border-ink bg-canvas px-6 py-3 text-title-md text-ink transition-colors duration-fast ease-standard hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Show all {rating.reviewCount} reviews
        </button>
      </div>
    </section>
  );
}
