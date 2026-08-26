import Image from 'next/image';
import type { Listing } from '@/lib/listing';
import { getHighlightIcon } from './icon-map';
import { GuestFavouriteCard } from './GuestFavouriteCard';

type PropertySummaryProps = { listing: Listing };

/**
 * Renders below the hero gallery, left column: property heading, guest/bed/bath stats,
 * the Guest favourite badge card, the host row and the highlights.
 *
 * The 10%-off promo does NOT live here. In the reference it is a separate bordered card
 * at the top of the RIGHT column, above the reservation card — see `ReservationCard`.
 * Likewise "Free cancellation before …" sits inside the reservation card, not at the end
 * of this column.
 */
export function PropertySummary({ listing }: PropertySummaryProps) {
  const { propertyType, location, capacity, host, highlights } = listing;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-display-md text-ink">
          {propertyType} in {location.city}, {location.country}
        </h2>
        <p className="mt-2 text-body-md text-ink">
          {capacity.guests} guests · {capacity.bedrooms} bedroom · {capacity.beds} bed ·{' '}
          {capacity.bathrooms} bathroom
        </p>
      </div>

      <GuestFavouriteCard listing={listing} />

      <div className="flex items-center gap-4">
        <Image
          src={host.avatar}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-pill object-cover"
        />
        <div>
          <p className="text-title-md text-ink">Hosted by {host.name}</p>
          <p className="text-body-sm text-muted">{host.yearsHosting} years hosting</p>
        </div>
      </div>

      <ul className="flex flex-col gap-6 border-t border-border-soft pt-8">
        {highlights.map((highlight) => {
          const Icon = getHighlightIcon(highlight.icon);
          return (
            <li key={highlight.title} className="flex items-start gap-6">
              <Icon className="h-7 w-7 shrink-0 text-ink" aria-hidden="true" strokeWidth={1.5} />
              <div>
                <p className="text-nav-label text-ink">{highlight.title}</p>
                <p className="text-body-sm text-muted">{highlight.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
