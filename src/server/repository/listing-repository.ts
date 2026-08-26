import { listing, type Listing } from '@/lib/listing';

/**
 * Repository — the only thing that knows where listing data physically lives.
 *
 * Today that is a seeded JSON file validated by Zod at module load. Swapping it for
 * Postgres means rewriting this file and nothing else: the service layer above it sees
 * the same async interface, and every function already returns a Promise so no caller
 * changes shape when the read stops being synchronous.
 */
export async function findListingById(id: string): Promise<Listing | null> {
  return listing.id === id ? listing : null;
}
