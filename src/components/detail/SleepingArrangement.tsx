import type { Listing } from '@/lib/listing';
import { getAmenityIcon } from './icon-map';

/**
 * Server component, no interactivity.
 *
 * The cards come straight from `listing.sleepingArrangements` rather than being derived
 * from `capacity`. Derivation was wrong for this listing in a way no amount of arithmetic
 * fixes: the reference sleeps three across a bedroom and a living-room sofa, so the count
 * of *rooms with a bed in them* is not the count of bedrooms, and the bed type differs
 * per room.
 */
export function SleepingArrangement({ listing }: { listing: Listing }) {
  const rooms = listing.sleepingArrangements;

  if (rooms.length === 0) return null;

  return (
    <section className="border-t border-border-soft py-section-gap">
      <h2 className="text-display-md text-ink">Where you’ll sleep</h2>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {rooms.map((room) => {
          const Icon = getAmenityIcon(room.icon);
          return (
            <div key={room.name} className="rounded-card border border-border p-6">
              <Icon className="h-6 w-6 text-ink" aria-hidden="true" />
              <p className="mt-4 text-title-md text-ink">{room.name}</p>
              <p className="text-body-sm text-muted">{room.detail}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
