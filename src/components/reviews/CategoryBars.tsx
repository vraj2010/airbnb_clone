import { SprayCan, CircleCheckBig, Search, MessageSquare, Map, Tag } from 'lucide-react';
import type { Listing } from '@/lib/listing';

type Category = Listing['ratingBreakdown'][number];

/** One icon per category, keyed by label rather than position — order-independent. */
const CATEGORY_ICON: Record<string, typeof SprayCan> = {
  Cleanliness: SprayCan,
  Accuracy: CircleCheckBig,
  'Check-in': Search,
  Communication: MessageSquare,
  Location: Map,
  Value: Tag,
};

function CategoryScore({ label, score }: Category) {
  const Icon = CATEGORY_ICON[label] ?? CircleCheckBig;

  return (
    <div className="flex flex-col gap-3 px-6">
      <span className="text-nav-label text-ink">{label}</span>
      <span className="text-display-md text-ink" aria-hidden="true">
        {score.toFixed(1)}
      </span>
      <Icon className="h-7 w-7 text-ink" aria-hidden="true" strokeWidth={1.5} />
      <span className="sr-only">
        {label}: {score.toFixed(1)} out of 5
      </span>
    </div>
  );
}

/** Six-across row of rating-category scores (Cleanliness, Accuracy, Check-in, …), each
 * with its own icon and separated by hairline rules — the reference does not use progress
 * bars here, only the overall rating (`RatingHistogram`) does. */
export function CategoryBars({ breakdown }: { breakdown: Listing['ratingBreakdown'] }) {
  return (
    <div className="grid grid-cols-6 divide-x divide-border-soft">
      {breakdown.map((category) => (
        <CategoryScore key={category.label} {...category} />
      ))}
    </div>
  );
}
