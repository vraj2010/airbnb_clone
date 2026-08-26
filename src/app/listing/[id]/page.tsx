import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ListingPage } from '@/components/ListingPage';
import { getListing, NotFoundError } from '@/server/services/listing-service';
import type { SearchParams } from '@/lib/overlay-state';

/**
 * The clone ships a single listing, so `/` and `/listing/[id]` render the same page.
 * The parameterised route exists because the API layer is keyed by id and a real
 * marketplace would route this way — it is the shape the architecture assumes.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  // Next runs generateMetadata alongside the page, so an unknown id threw here too — the
  // page still 404'd (its own guard caught it) but this throw surfaced as an unhandled
  // error in the server log on every 404. Metadata for a page that is about to 404 is not
  // worth an error: return the not-found title and let the route own the status.
  let listing;
  try {
    listing = await getListing(id);
  } catch (err) {
    if (err instanceof NotFoundError) return { title: 'Listing not found' };
    throw err;
  }

  const { title, propertyType, location, description } = listing;
  return {
    title: `${title} - ${propertyType} for Rent in ${location.city}, ${location.region}, ${location.country}`,
    description: description[0],
  };
}

export default async function ListingRoute({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;

  // An unknown id is a 404, not a 500. The service throws NotFoundError; the route is the
  // layer that turns that into HTTP semantics — the same split the API handlers use.
  // This has to be awaited HERE: <ListingPage> is an async Server Component, so wrapping
  // the JSX in try/catch catches nothing — the error is thrown later, during React's
  // render. Without it the page returned Next's 500 while /api/listings/<same id>
  // correctly returned 404.
  try {
    await getListing(id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  return <ListingPage listingId={id} searchParams={await searchParams} />;
}
