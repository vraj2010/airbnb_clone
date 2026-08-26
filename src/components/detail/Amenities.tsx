import type { Listing } from '@/lib/listing';
import { AmenitiesGrid } from './AmenitiesGrid';

/** Server component: composes the static section shell, delegates the "show all"
 * interaction to the client leaf. */
export function Amenities({ listing }: { listing: Listing }) {
  return (
    <section id="amenities" className="border-t border-border-soft py-section-gap">
      <h2 className="text-display-md text-ink">What this place offers</h2>
      <div className="mt-6">
        <AmenitiesGrid
          amenities={listing.amenities}
          total={listing.amenityCount}
          groups={listing.amenityGroups}
        />
      </div>
    </section>
  );
}
