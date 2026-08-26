import { getListing } from '@/server/services/listing-service';
import { handleError, ok } from '@/server/http';

/** GET /api/listings/[id] — listing detail. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return ok(await getListing(id));
  } catch (err) {
    return handleError(err);
  }
}
