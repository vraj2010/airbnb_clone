import { z } from 'zod';
import raw from '@/data/listing.json';

/**
 * The listing shape, validated at module load.
 *
 * Parsing here rather than trusting the JSON means a malformed seed file fails the build
 * with a precise path instead of rendering `undefined` somewhere deep in a component.
 * When the optional Route Handler backend lands, the same schema types the response, so
 * client and server cannot drift.
 */

const PhotoSchema = z.object({
  /** Matches the reference's lightbox URL state: modalItem=1000, incrementing. */
  id: z.number().int(),
  src: z.string().startsWith('/'),
  alt: z.string().min(1),
  group: z.string().min(1),
  groupCaption: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /** Attribution for the stock photography. Not required by the Unsplash License. */
  credit: z.object({ photographer: z.string(), sourceUrl: z.string().url() }).optional(),
});

const ListingSchema = z.object({
  // Build bookkeeping: which fields came off the live reference and which are our own
  // writing. Optional because the service strips it before anything renders or is served.
  _provenance: z
    .object({
      verified: z.array(z.string()),
      placeholder: z.array(z.string()),
      note: z.string(),
    })
    .optional(),

  id: z.string().min(1),
  title: z.string().min(1),
  propertyType: z.string().min(1),
  location: z.object({
    city: z.string(),
    country: z.string(),
    region: z.string(),
  }),
  capacity: z.object({
    guests: z.number().int().positive(),
    bedrooms: z.number().int().nonnegative(),
    beds: z.number().int().nonnegative(),
    bathrooms: z.number().int().nonnegative(),
  }),

  discount: z.object({
    percentOff: z.number().int().positive(),
    label: z.string().min(1),
    termsLabel: z.string().min(1),
    ctaLabel: z.string().min(1),
  }),

  /** The cancellation line that sits under the promo, above the highlights. */
  freeCancellation: z.string().min(1),

  price: z.object({
    currency: z.string().length(3),
    symbol: z.string().min(1),
    total: z.number().positive(),
    nights: z.number().int().positive(),
    guests: z.number().int().positive(),
    cleaningFee: z.number().nonnegative(),
    serviceFee: z.number().nonnegative(),
  }),
  stay: z.object({
    from: z.string(),
    to: z.string(),
  }),

  photoCount: z.number().int().positive(),
  photos: z.array(PhotoSchema),
  /**
   * The five hero tiles, by photo id. NOT `photos.slice(0, 5)` — the reference's hero
   * draws from across the set (its large tile is the seventh photo in tour order), so the
   * selection has to be explicit.
   */
  heroPhotoIds: z.array(z.number().int()).length(5),
  photoGroups: z.array(z.object({ name: z.string(), caption: z.string() })),

  rating: z.object({
    overall: z.number().min(0).max(5),
    reviewCount: z.number().int().nonnegative(),
    isGuestFavourite: z.boolean(),
    /** The line under the Guest favourite badge in the Reviews section. */
    blurb: z.string().min(1),
    /**
     * The badge card above the fold uses different wording from the Reviews section —
     * both verbatim from the reference, hence two fields rather than one reused string.
     */
    cardBlurb: z.string().min(1),
    /** One row per star value, 5 down to 1. Drives the reviews histogram. */
    histogram: z.array(
      z.object({ stars: z.number().int().min(1).max(5), count: z.number().int().nonnegative() }),
    ),
  }),

  host: z.object({
    name: z.string(),
    isSuperhost: z.boolean(),
    yearsHosting: z.number().int().nonnegative(),
    joinedYear: z.number().int(),
    responseRate: z.number().min(0).max(100),
    responseTime: z.string(),
    /** Host-level totals across every listing they run — not this listing's 19 reviews. */
    reviewCount: z.number().int().nonnegative(),
    rating: z.number().min(0).max(5),
    bornIn: z.string(),
    school: z.string(),
    avatar: z.string().startsWith('/'),
    /**
     * The reference gives six of the eight co-hosts a photo and falls back to a tinted
     * initial disc for the last two, so `avatar` and `tint` are alternatives, not both.
     */
    coHosts: z.array(
      z.union([
        z.object({ name: z.string().min(1), avatar: z.string().startsWith('/') }),
        z.object({ name: z.string().min(1), tint: z.enum(['pink', 'blue']) }),
      ]),
    ),
  }),

  highlights: z.array(z.object({ icon: z.string(), title: z.string(), body: z.string() })),
  /** The reference shows a machine-translation banner above the description. */
  descriptionNotice: z.string().min(1),
  description: z.array(z.string().min(1)),

  sleepingArrangements: z.array(
    z.object({ name: z.string(), icon: z.string(), detail: z.string() }),
  ),

  /** Total amenities behind "Show all" — larger than the ten the page renders inline. */
  amenityCount: z.number().int().positive(),
  /**
   * The full list behind the "Show all N amenities" dialog, grouped exactly as the
   * reference groups it (Bathroom, Bedroom and laundry, …). Separate from `amenities`,
   * which is only the short inline grid.
   */
  amenityGroups: z.array(
    z.object({
      name: z.string().min(1),
      items: z.array(z.object({ label: z.string().min(1), icon: z.string().min(1) })).min(1),
    }),
  ),
  amenities: z.array(
    z.object({
      icon: z.string(),
      label: z.string(),
      /** Rendered struck through: the host has reported this one as absent. */
      unavailable: z.boolean().optional(),
    }),
  ),

  reviews: z.array(
    z.object({
      id: z.string(),
      author: z.string(),
      /** "3 years on Airbnb" — the reference shows account age, not the reviewer's city. */
      tenure: z.string(),
      /** Relative for recent reviews ("1 week ago"), absolute beyond that ("May 2026"). */
      date: z.string(),
      rating: z.number().min(0).max(5),
      body: z.string(),
      /** The captured body is cut short; the card offers "Show more" but has no more text. */
      truncated: z.boolean(),
      avatar: z.string().startsWith('/'),
    }),
  ),
  ratingBreakdown: z.array(z.object({ label: z.string(), score: z.number().min(0).max(5) })),
  /** The topic pills above the review grid, e.g. "Hospitality 8". */
  reviewTags: z.array(
    z.object({
      label: z.string(),
      count: z.number().int().nonnegative(),
      /** Leading icon on the pill — the reference ships a small raster per topic. */
      icon: z.string().startsWith('/'),
    }),
  ),

  neighbourhood: z.object({
    label: z.string().min(1),
    note: z.string().min(1),
    body: z.string().min(1),
    /**
     * The LOCALITY centroid, not the property. The listing promises "Exact location will
     * be provided after booking", so the map shows an approximate circle of this radius
     * and never a precise pin — publishing the real coordinates would break that promise.
     */
    coords: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      approximateRadiusMetres: z.number().positive(),
      zoom: z.number().int().min(1).max(20),
    }),
  }),

  houseRules: z.object({
    rules: z.array(z.string()),
    safety: z.array(z.string()),
    cancellation: z.array(z.string()),
  }),

  nearbyStays: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      price: z.number().positive(),
      rating: z.number().min(0).max(5),
      src: z.string().startsWith('/'),
      alt: z.string().min(1),
    }),
  ),
})
  // The reference's counter reads "1 of 43". If the seed and the count disagree, the
  // lightbox would lie - so make that a build error rather than a runtime surprise.
  .refine((l) => l.photos.length === l.photoCount, {
    message: 'photos.length must equal photoCount',
    path: ['photos'],
  })
  // A hero id that matches no photo renders an empty tile with no error anywhere.
  .refine((l) => l.heroPhotoIds.every((id) => l.photos.some((p) => p.id === id)), {
    message: 'every heroPhotoIds entry must match a photo id',
    path: ['heroPhotoIds'],
  })
  // The reservation card shows a fee breakdown that must sum to the headline total.
  // Without this, changing `total` in the seed silently produces a wrong - or negative -
  // nightly rate, and nothing catches it.
  .refine((l) => l.price.total - l.price.cleaningFee - l.price.serviceFee > 0, {
    message: 'price.total must exceed cleaningFee + serviceFee',
    path: ['price'],
  })
  // The amenities button reads "Show all 50 amenities" off `amenityCount` while the grid
  // renders `amenities`. A count below what is already on screen would be a visible lie.
  .refine((l) => l.amenityCount >= l.amenities.length, {
    message: 'amenityCount must be at least amenities.length',
    path: ['amenityCount'],
  })
  // The histogram bars are drawn as a share of `rating.reviewCount`. If the counts do not
  // add up, the tallest bar silently stops being full width.
  .refine((l) => l.rating.histogram.reduce((n, r) => n + r.count, 0) === l.rating.reviewCount, {
    message: 'rating.histogram counts must sum to rating.reviewCount',
    path: ['rating', 'histogram'],
  });

export type Listing = z.infer<typeof ListingSchema>;
export type Photo = z.infer<typeof PhotoSchema>;

export const listing: Listing = ListingSchema.parse(raw);

/** Photos in reference order, bucketed by room group for the photo tour. */
export function photosByGroup(l: Listing = listing) {
  return l.photoGroups.map((g) => ({
    ...g,
    photos: l.photos.filter((p) => p.group === g.name),
  }));
}


/**
 * The five hero tiles, in `heroPhotoIds` order.
 *
 * Not `photos.slice(0, 5)`: the reference's large left tile is the seventh photo in tour
 * order, and the four small tiles are drawn from four different rooms. Slicing would show
 * five consecutive living-room shots instead.
 *
 * The schema already refines that every id resolves, so the lookup cannot return a hole.
 */
export function heroTiles(l: Listing = listing) {
  return l.heroPhotoIds.map((id) => l.photos.find((p) => p.id === id)!);
}

