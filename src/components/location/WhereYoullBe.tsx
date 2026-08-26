import { House } from 'lucide-react';
import type { Listing } from '@/lib/listing';
import { NeighbourhoodToggle } from './NeighbourhoodToggle';
import { LocationMap } from './LocationMap';

/**
 * "Where you'll be": the map panel, the approximate locality, and the neighbourhood
 * blurb. Server component — only the blurb's expand/collapse is a client leaf.
 *
 * The panel is layered. Underneath is the stylised drawing that mirrors the reference;
 * over it, `LocationMap` paints a real OpenStreetMap slippy map once Leaflet has loaded
 * on the client. If tiles are blocked or the network is down, the drawing simply stays —
 * the section never renders as an empty grey box.
 *
 * The reference ships only the placeholder; the real map is a deliberate improvement.
 */
export function WhereYoullBe({ listing }: { listing: Listing }) {
  const { neighbourhood } = listing;

  return (
    <section aria-labelledby="location-heading" className="border-t border-border-soft py-section-gap">
      <h2 id="location-heading" className="text-display-md text-ink">
        Where you’ll be
      </h2>

      <p className="mt-2 text-body-md text-body">{neighbourhood.label}</p>

      <div
        role="img"
        aria-label={`Approximate location: ${neighbourhood.label}. ${neighbourhood.note}`}
        className="map-panel relative mt-6 overflow-hidden rounded-hero bg-map-water"
      >
        {/* Decorative, not real geography: a diagonal land/water split with a hairline
            grid and two greenspace discs, echoing the reference's stylised
            (non-photographic) map panel. Colours and grid pitch are pixel-sampled — see
            colour.map-* and layout.mapGridCell in REFERENCE-MEASURED.json. */}
        <div
          className="absolute inset-0 bg-map-land"
          style={{ clipPath: 'polygon(28% 0, 100% 0, 100% 100%, 0 100%)' }}
        />
        <div className="map-grid absolute inset-0" />
        <div className="absolute left-[34%] top-[38%] aspect-square w-[9%] rounded-pill bg-map-park" />
        <div className="absolute left-[64%] top-[54%] aspect-square w-[12%] rounded-pill bg-map-park" />

        {/* Fallback marker. Leaflet draws its own zoom controls and the approximate
            circle, so only this disc belongs to the drawn layer. */}
        <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill bg-ink shadow-system">
          <House className="h-6 w-6 text-canvas" aria-hidden="true" />
        </span>

        <LocationMap coords={neighbourhood.coords} label={neighbourhood.label} />
      </div>

      <p className="mt-4 text-body-md text-body">{neighbourhood.note}</p>

      <div className="mt-8 border-t border-border-soft pt-8">
        <h3 className="text-title-md text-ink">Neighbourhood highlights</h3>
        <div className="mt-2">
          <NeighbourhoodToggle body={neighbourhood.body} />
        </div>
      </div>
    </section>
  );
}
