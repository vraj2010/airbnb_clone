# API

Next.js Route Handlers under `src/app/api/`. Optional per the brief; built as the bonus
deliverable.

## Layering

```
route.ts   HTTP only — parse, validate, map errors to status codes
   ↓
service    business logic — no Request, no Response, no status codes
   ↓
repository storage — the only file that knows data lives in a JSON seed
```

Swapping the seeded JSON for Postgres means rewriting
`src/server/repository/listing-repository.ts` and nothing else. Every repository function
already returns a `Promise`, so no caller changes shape when the read stops being
synchronous.

**The listing page reads through the same service functions**, not by importing the seed
JSON — otherwise the backend would be decorative. It calls the service directly rather
than HTTP-fetching its own routes during SSR: same guarantee that page and API cannot
disagree, without a wasted round trip or a dependency on the server's own origin.

## Endpoints

Base: `/api/listings/{id}` — the seeded id is `mirashya-ug10-candolim`.

| method | path | notes |
|---|---|---|
| `GET` | `/api/listings/{id}` | listing detail |
| `GET` | `/api/listings/{id}/photos` | 43 photos grouped into 9 room groups |
| `GET` | `/api/listings/{id}/reviews?limit=&offset=` | paginated; `limit` 1–50, default 10 |
| `GET` | `/api/listings/{id}/availability?from=&to=` | per-day available/blocked, `YYYY-MM-DD` |

### Errors

One shape everywhere, so a client never has to guess:

```json
{ "error": { "code": "not_found", "message": "listing 'nope' not found" } }
```

| status | code | when |
|---|---|---|
| `400` | `invalid_request` | query validation failed; `details` carries the Zod issues |
| `404` | `not_found` | no listing with that id |
| `500` | `internal_error` | unexpected — logged server-side, never leaks a stack trace |

### Verified

```
GET /api/listings/mirashya-ug10-candolim                          200  43 photos
GET .../photos                                                    200  total=43 groups=9
GET .../reviews?limit=2&offset=0                                  200  items=2 hasMore=true
GET .../reviews?limit=2&offset=4                                  200  items=2 hasMore=false
GET .../availability?from=2026-10-16&to=2026-10-20                200  ..XXX
GET /api/listings/nope                                            404  not_found
GET .../reviews?limit=abc                                         400  invalid_request
GET .../reviews?limit=999                                         400  invalid_request   (bounded at 50)
GET .../availability?from=2026-10-20&to=2026-10-16                400  invalid_request   (from > to)
GET .../availability?from=nope&to=2026-10-16                      400  invalid_request
```

`..XXX` is 16–17 Oct available, 18–20 blocked — the seeded stay is 18–23 Oct.

## Trade-offs

- **Seeded JSON, not a database.** The brief allows it. The cost is that availability is
  computed against a single hard-coded stay rather than queried from a bookings table with
  an exclusion constraint — which is what the architecture diagram relies on to make
  double-booking impossible rather than merely unlikely.
- **No auth, no rate limiting, no caching headers.** Out of scope for a read-only clone;
  in the production design they live at the API gateway, not in the handlers.
- **No write endpoints.** A real booking POST needs an idempotency key and a transaction;
  half-building that would be worse than not building it.
