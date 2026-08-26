import { getListing, getPhotos } from '@/server/services/listing-service';
import { SiteHeader } from '@/components/header';
import { HeroGallery } from '@/components/hero';
import { TitleBlock, PropertySummary } from '@/components/title';
import { Description, SleepingArrangement, Amenities } from '@/components/detail';
import { BookingProvider, ReservationCard, StayCalendar } from '@/components/booking';
import { Reviews, SiteFooter } from '@/components/reviews';
import { WhereYoullBe } from '@/components/location';
import { MeetYourHost } from '@/components/host';
import { ThingsToKnow } from '@/components/policies';
import { NearbyStays } from '@/components/nearby';
import { SecondaryNav } from '@/components/nav';
import { Overlays } from '@/components/overlay';
import { readOverlayState, type SearchParams } from '@/lib/overlay-state';
import { heroTiles } from '@/lib/listing';

/**
 * Composes the six independently-built sections into the listing page.
 *
 * Written by the orchestrator only — the six section agents each own their own directory
 * and never touch this file, which is what stopped them colliding while running in
 * parallel.
 *
 * `<main>` shares `container-page px-10 2xl:px-20` with the header's inner wrapper, so
 * both land on one vertical grid line. The two-column split below is a proportional grid
 * (`layout-two-column`), so the left column and reservation card keep their ratio at any
 * container width.
 *
 * This is a Server Component. Only the six interactive leaves below it are client
 * components; nothing here forces a boundary.
 */
/**
 * Reads through the service layer, not by importing the seed JSON — the same functions the
 * Route Handlers under `src/app/api/` call. A direct HTTP self-fetch during SSR would add
 * a pointless round trip and a hard dependency on the server's own origin; sharing the
 * service gives the same guarantee (page and API can never disagree) without either.
 */
export async function ListingPage({
  listingId,
  searchParams,
}: {
  listingId: string;
  searchParams?: SearchParams;
}) {
  const listing = await getListing(listingId);
  const { groups } = await getPhotos(listingId);
  const { tourOpen, lightboxPhotoId } = readOverlayState(searchParams ?? {});

  /*
   * NIGHTLY_RATE is derived, not stored: the seed's total already equals
   * rate x nights, so dividing keeps the default range showing exactly the price the
   * reference shows while letting any other range price itself correctly.
   */
  const nightlyRate = listing.price.total / listing.price.nights;

  return (
    <BookingProvider
      initialCheckIn={listing.stay.from}
      initialCheckOut={listing.stay.to}
      initialGuests={listing.price.guests}
      nightlyRate={nightlyRate}
      currency={listing.price.currency}
      maxGuests={listing.capacity.guests}
    >
      <SiteHeader />

      <main id="main" tabIndex={-1} className="container-page pt-6 outline-none">
        <TitleBlock listing={listing} />

        <div id="photos">
          <HeroGallery tiles={heroTiles(listing)} total={listing.photoCount} />
        </div>
        <SecondaryNav listing={listing} />

        <div className="mt-hero-to-body-gap layout-two-column">
          <div>
            <PropertySummary listing={listing} />
            <Description listing={listing} />
            <SleepingArrangement listing={listing} />
            <Amenities listing={listing} />
            <StayCalendar listing={listing} />
          </div>

          <aside aria-label="Reservation">
            <ReservationCard listing={listing} />
          </aside>
        </div>

        {/*
          Below the two-column fold the reference runs full container width, in this
          order: reviews, map, host, policies, nearby. Each section owns its own top
          border and vertical rhythm, so the skeleton just stacks them.
        */}
        <Reviews listing={listing} />
        <WhereYoullBe listing={listing} />
        <MeetYourHost listing={listing} />
        <ThingsToKnow listing={listing} />
        <NearbyStays listing={listing} />
      </main>

      <SiteFooter />

      {/*
        The only client boundary the overlays need. Everything above stays a Server
        Component; the overlays receive plain serializable props and read their open
        state from the URL.
      */}
      <Overlays
        tourOpen={tourOpen}
        lightboxPhotoId={lightboxPhotoId}
        groups={groups}
        photos={listing.photos}
      />
    </BookingProvider>
  );
}
