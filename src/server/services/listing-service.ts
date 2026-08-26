import { cache } from 'react';
import { photosByGroup, type Listing, type Photo } from '@/lib/listing';
import { findListingById } from '@/server/repository/listing-repository';

/** The single seeded listing. Routes name it through the service, not the seed file. */
export const DEFAULT_LISTING_ID = 'mirashya-ug10-candolim';

/**
 * Service — business logic. Knows nothing about HTTP (no Request, no Response, no status
 * codes) and nothing about storage. That is what lets the listing page call these
 * functions directly during server rendering while the Route Handlers call the exact same
 * ones, so the page and the API can never disagree about what a listing is.
 */

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} '${id}' not found`);
    this.name = 'NotFoundError';
  }
}

/**
 * Wrapped in React's `cache()` so one render reads storage once. Rendering a listing page
 * calls this three times — the route's 404 guard, `ListingPage`, and `getPhotos` — which
 * is free against a JSON singleton and three round trips against Postgres. No-op outside
 * a render, so the Route Handlers are unaffected.
 *
 * `_provenance` is build bookkeeping (which fields are measured vs. placeholder) and is
 * stripped here, so the public API response shape is deliberate rather than "whatever the
 * seed file happens to contain".
 */
export const getListing = cache(async (id: string): Promise<Listing> => {
  const found = await findListingById(id);
  if (!found) throw new NotFoundError('listing', id);
  const { _provenance, ...listing } = found;
  void _provenance;
  return listing;
});

export type PhotoGroupPayload = { name: string; caption: string; photos: Photo[] };

export async function getPhotos(id: string): Promise<{
  total: number;
  groups: PhotoGroupPayload[];
}> {
  const found = await getListing(id);
  return { total: found.photoCount, groups: photosByGroup(found) };
}

export type Page<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export async function getReviews(
  id: string,
  { limit = 10, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<Page<Listing['reviews'][number]>> {
  const found = await getListing(id);
  const items = found.reviews.slice(offset, offset + limit);
  return {
    items,
    total: found.reviews.length,
    limit,
    offset,
    hasMore: offset + items.length < found.reviews.length,
  };
}

export type AvailabilityDay = { date: string; available: boolean };

/**
 * Availability for a date range. The seeded listing has one booked stay, so days inside
 * it are blocked and everything else is open.
 *
 * A real implementation queries a bookings table with an exclusion constraint on the date
 * range — the same constraint the architecture diagram relies on to make double-booking
 * impossible rather than merely unlikely.
 */
export async function getAvailability(
  id: string,
  from: string,
  to: string,
): Promise<{ from: string; to: string; days: AvailabilityDay[] }> {
  const found = await getListing(id);

  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  const bookedFrom = new Date(`${found.stay.from}T00:00:00Z`);
  const bookedTo = new Date(`${found.stay.to}T00:00:00Z`);

  const days: AvailabilityDay[] = [];
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    days.push({ date: iso, available: !(d >= bookedFrom && d < bookedTo) });
  }

  return { from, to, days };
}
