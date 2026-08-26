import { z } from 'zod';
import { getReviews } from '@/server/services/listing-service';
import { handleError, ok } from '@/server/http';

// Coerced and bounded: `?limit=abc` is a 400, and `?limit=100000` cannot be used to pull
// the whole table in one request.
const QuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

/** GET /api/listings/[id]/reviews?limit=&offset= — paginated. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const query = QuerySchema.parse(Object.fromEntries(url.searchParams));
    return ok(await getReviews(id, query));
  } catch (err) {
    return handleError(err);
  }
}
