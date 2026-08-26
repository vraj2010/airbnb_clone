import Image from 'next/image';
import type { Listing } from '@/lib/listing';

/**
 * The topic pills above the review grid — "Hospitality 8", "Comfort 6", …
 *
 * A list rather than a row of buttons: on the reference these filter the reviews, but
 * with six seeded reviews there is nothing to filter down to, and a control that looks
 * clickable and does nothing is worse than no control.
 */
export function ReviewTags({ tags }: { tags: Listing['reviewTags'] }) {
  if (tags.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <li
          key={tag.label}
          className="flex items-center gap-2 rounded-pill border border-border px-4 py-3 text-body-md text-ink"
        >
          <Image src={tag.icon} alt="" width={20} height={20} className="h-5 w-5 shrink-0" />
          <span>{tag.label}</span>
          <span className="text-muted">{tag.count}</span>
        </li>
      ))}
    </ul>
  );
}
