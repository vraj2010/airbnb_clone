import { z } from 'zod';
import { getAvailability } from '@/server/services/listing-service';
import { handleError, ok } from '@/server/http';

/** Longest span one request may ask for. A calendar view never needs more than a year. */
const MAX_DAYS = 365;
const DAY_MS = 86_400_000;

/**
 * A regex only checks shape. `\d{2}` happily accepts `2026-99-99`, which produced an
 * Invalid Date, an empty day loop, and a 200 echoing the garbage back as an answer —
 * so the calendar itself has to be validated.
 */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD')
  .refine((s) => {
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }, 'not a real calendar date');

const QuerySchema = z
  .object({ from: isoDate, to: isoDate })
  .refine((q) => q.from <= q.to, {
    message: '`from` must not be after `to`',
    path: ['from'],
  })
  // Without this bound, `from=1000-01-01&to=9999-12-31` materialised ~3.3M day objects
  // and returned 128 MB from a single unauthenticated GET. `limit` on /reviews is capped
  // for exactly this reason; this is the same class of bug.
  .refine(
    (q) =>
      (Date.parse(`${q.to}T00:00:00Z`) - Date.parse(`${q.from}T00:00:00Z`)) / DAY_MS <= MAX_DAYS,
    { message: `range must not exceed ${MAX_DAYS} days`, path: ['to'] },
  );

/** GET /api/listings/[id]/availability?from=&to= — per-day available/blocked. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const query = QuerySchema.parse(Object.fromEntries(url.searchParams));
    return ok(await getAvailability(id, query.from, query.to));
  } catch (err) {
    return handleError(err);
  }
}
