import { test, expect } from '@playwright/test';

/**
 * Route Handler contract tests.
 *
 * These assert the HTTP surface — status codes, the single error shape, pagination and
 * input bounds — rather than re-testing the service logic. The point is that a client can
 * rely on the contract.
 */

const ID = 'mirashya-ug10-candolim';
const BASE = `/api/listings/${ID}`;

test.describe('GET /api/listings/[id]', () => {
  test('returns the listing', async ({ request }) => {
    const res = await request.get(BASE);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(ID);
    expect(body.photos).toHaveLength(43);
    expect(body.photoCount).toBe(43);
  });

  test('404s an unknown id with the standard error shape', async ({ request }) => {
    const res = await request.get('/api/listings/does-not-exist');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('not_found');
    expect(body.error.message).toContain('does-not-exist');
  });
});

test.describe('GET /api/listings/[id]/photos', () => {
  test('groups all 43 photos into the 9 measured room groups', async ({ request }) => {
    const res = await request.get(`${BASE}/photos`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(43);
    expect(body.groups).toHaveLength(9);
    expect(body.groups.map((g: { name: string }) => g.name)).toEqual([
      'Living room 1',
      'Living room 2',
      'Full kitchen',
      'Bedroom',
      'Full bathroom',
      'Gym',
      'Exterior',
      'Pool',
      'Additional photos',
    ]);
    const counted = body.groups.reduce(
      (n: number, g: { photos: unknown[] }) => n + g.photos.length,
      0,
    );
    expect(counted, 'grouped photos must account for every photo').toBe(43);
  });
});

test.describe('GET /api/listings/[id]/reviews', () => {
  test('paginates and reports hasMore correctly', async ({ request }) => {
    const first = await (await request.get(`${BASE}/reviews?limit=2&offset=0`)).json();
    expect(first.items).toHaveLength(2);
    expect(first.total).toBe(6);
    expect(first.hasMore).toBe(true);

    const last = await (await request.get(`${BASE}/reviews?limit=2&offset=4`)).json();
    expect(last.items).toHaveLength(2);
    expect(last.hasMore).toBe(false);
  });

  test('rejects a non-numeric limit', async ({ request }) => {
    const res = await request.get(`${BASE}/reviews?limit=abc`);
    expect(res.status()).toBe(400);
    expect((await res.json()).error.code).toBe('invalid_request');
  });

  test('bounds limit so one request cannot pull everything', async ({ request }) => {
    const res = await request.get(`${BASE}/reviews?limit=999`);
    expect(res.status()).toBe(400);
  });
});

test.describe('GET /api/listings/[id]/availability', () => {
  test('blocks the days covered by the seeded stay', async ({ request }) => {
    // Seeded stay is 18-23 Oct, so 16-17 are open and 18-20 are blocked.
    const res = await request.get(`${BASE}/availability?from=2026-10-16&to=2026-10-20`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.days.map((d: { available: boolean }) => d.available)).toEqual([
      true,
      true,
      false,
      false,
      false,
    ]);
  });

  test('caps the range so one GET cannot materialise millions of days', async ({ request }) => {
    // Unbounded, `from=1000-01-01&to=9999-12-31` returned 200 with a 128 MB body from a
    // single unauthenticated request. /reviews bounds `limit` for the same reason.
    const res = await request.get(`${BASE}/availability?from=1000-01-01&to=9999-12-31`);
    expect(res.status()).toBe(400);
    expect((await res.json()).error.code).toBe('invalid_request');

    // A year still works — that is more than any calendar view needs.
    expect((await request.get(`${BASE}/availability?from=2026-01-01&to=2026-12-31`)).status()).toBe(200);
  });

  test('rejects dates that are well-formed but not real', async ({ request }) => {
    // The regex only checks shape: `\d{2}` accepts 99, which gave an Invalid Date, an
    // empty day loop, and a 200 echoing the garbage back as an answer.
    const res = await request.get(`${BASE}/availability?from=2026-99-99&to=2026-99-99`);
    expect(res.status()).toBe(400);
    expect((await request.get(`${BASE}/availability?from=2026-02-30&to=2026-03-01`)).status()).toBe(400);
  });

  test('rejects a reversed range and a malformed date', async ({ request }) => {
    expect((await request.get(`${BASE}/availability?from=2026-10-20&to=2026-10-16`)).status()).toBe(400);
    expect((await request.get(`${BASE}/availability?from=nope&to=2026-10-16`)).status()).toBe(400);
  });
});

test.describe('response shape', () => {
  test('does not leak internal build bookkeeping', async ({ request }) => {
    const body = await (await request.get(BASE)).json();
    expect(body._provenance, '_provenance is build metadata, not part of the API').toBeUndefined();
  });
});

test.describe('page routes', () => {
  test('the root page resolves a real listing', async ({ request }) => {
    // DEFAULT_LISTING_ID in the service duplicates the seed id as a literal. If they ever
    // drift, `/` 500s — its generateMetadata has no NotFoundError guard, unlike /listing/[id].
    // An assert here is cheaper than a refactor and fails loudly.
    expect((await request.get('/')).status()).toBe(200);
  });


  test('an unknown listing id renders 404, not 500', async ({ request }) => {
    // Regression: the service throws NotFoundError, and because <ListingPage> is an async
    // Server Component the throw happens during React's render — so it has to be caught in
    // the route, before the component is returned. It previously surfaced as a 500 while
    // the equivalent API route correctly returned 404.
    expect((await request.get('/listing/bogus')).status()).toBe(404);
    expect((await request.get(`/listing/${ID}`)).status()).toBe(200);
  });
});
