import { Star } from 'lucide-react';
import Image from 'next/image';
import type { Listing } from '@/lib/listing';
import { ReviewBody } from './ReviewBody';

type Review = Listing['reviews'][number];

/**
 * One reviewer's card: avatar, author, account tenure, a star row and the
 * date, then the body. `<article>` + `<h3>` since these sit under the section's
 * (visually hidden) `<h2>`.
 *
 * `date` is rendered verbatim rather than parsed and reformatted: the reference mixes
 * relative labels for recent reviews ("1 week ago") with absolute ones for older ones
 * ("May 2026"), and re-deriving "1 week ago" would need a review timestamp the page
 * never exposes.
 */
export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Image
          src={review.avatar}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-pill object-cover"
        />
        <div>
          <h3 className="text-title-md text-ink">{review.author}</h3>
          <p className="text-body-sm text-muted">{review.tenure}</p>
        </div>
      </div>

      <p className="flex items-center gap-2 text-body-sm text-ink">
        <span className="flex items-center gap-0.5" aria-hidden="true">
          {/* Rounded: the schema allows a fractional score, and `Array.from` on 4.5
              would silently drop the half star rather than fail. */}
          {Array.from({ length: Math.round(review.rating) }, (_, i) => (
            <Star key={i} className="h-3 w-3 fill-ink text-ink" />
          ))}
        </span>
        <span className="sr-only">Rated {review.rating} out of 5.</span>
        <span aria-hidden="true">&middot;</span>
        <span>{review.date}</span>
      </p>

      <ReviewBody body={review.body} truncated={review.truncated} />
    </article>
  );
}
