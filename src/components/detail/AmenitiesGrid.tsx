'use client';

import { useState } from 'react';
import type { Listing } from '@/lib/listing';
import { getAmenityIcon } from './icon-map';
import { AmenitiesDialog } from './AmenitiesDialog';

type Amenity = { icon: string; label: string; unavailable?: boolean };

const VISIBLE_COUNT = 8;

/** Client leaf: only the "show all" expansion is interactive. Receives the plain
 * amenities array as a prop rather than the full listing object.
 *
 * `total` is the listing's real amenity count, which is larger than what the seed
 * carries — the reference lists ten and hides forty behind the button. Labelling the
 * button with `amenities.length` would have promised 10 and delivered 10. */
export function AmenitiesGrid({
  amenities,
  total,
  groups,
}: {
  amenities: Amenity[];
  total: number;
  groups: Listing['amenityGroups'];
}) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = amenities.length > VISIBLE_COUNT;
  const visible = expanded ? amenities : amenities.slice(0, VISIBLE_COUNT);

  return (
    <div>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-4">
        {visible.map((amenity, index) => {
          const Icon = getAmenityIcon(amenity.icon);
          return (
            <li key={`${amenity.icon}-${index}`} className="flex items-center gap-4">
              {/*
                An unavailable amenity is struck through and dimmed. The strike is
                decorative — `line-through` is not exposed to assistive tech — so the
                state is also spelled out in a visually hidden suffix rather than left
                to the styling alone.
              */}
              <Icon
                className={amenity.unavailable ? 'h-6 w-6 text-muted' : 'h-6 w-6 text-ink'}
                aria-hidden="true"
              />
              <span
                className={
                  amenity.unavailable
                    ? 'text-body-md text-muted line-through'
                    : 'text-body-md text-ink'
                }
              >
                {amenity.label}
              </span>
              {amenity.unavailable && <span className="sr-only">not available</span>}
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <AmenitiesDialog
          groups={groups}
          total={total}
          triggerClassName="mt-6 rounded-sm border border-ink bg-canvas px-6 py-3 text-title-md text-ink transition-colors duration-fast ease-standard hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        />
      )}
    </div>
  );
}
