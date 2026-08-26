import type { Metadata } from 'next';
import { ListingPage } from '@/components/ListingPage';
import type { SearchParams } from '@/lib/overlay-state';
import { DEFAULT_LISTING_ID, getListing } from '@/server/services/listing-service';

export async function generateMetadata(): Promise<Metadata> {
  // Reads through the service like everything else — `app/` routes and composes, it does
  // not reach into storage. getListing is request-cached, so this is not an extra read.
  const { title, propertyType, location, description } = await getListing(DEFAULT_LISTING_ID);
  return {
    title: `${title} - ${propertyType} for Rent in ${location.city}, ${location.region}, ${location.country}`,
    description: description[0],
  };
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <ListingPage listingId={DEFAULT_LISTING_ID} searchParams={await searchParams} />;
}
