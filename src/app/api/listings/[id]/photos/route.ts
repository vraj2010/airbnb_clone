import { getPhotos } from '@/server/services/listing-service';
import { handleError, ok } from '@/server/http';

/** GET /api/listings/[id]/photos — gallery, grouped by room. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return ok(await getPhotos(id));
  } catch (err) {
    return handleError(err);
  }
}
