import type { Listing } from '@/lib/listing';

type Coords = Listing['neighbourhood']['coords'];

/**
 * Google Maps for the "Where you'll be" panel.
 *
 * No API key required as shipped. Google's JavaScript API and its official Embed API both
 * need a billable key, so this uses the keyless `maps.google.com/maps?...&output=embed`
 * endpoint instead — the map works the moment you clone the repo, with nothing to sign up
 * for. If `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set, it switches to the official Embed API
 * (`/maps/embed/v1/place`), which is the supported, rate-limited path for production.
 *
 * It queries the LOCALITY by name, not the coordinates. The listing promises "Exact
 * location will be provided after booking", and `q=<lat>,<lng>` would drop a precise pin
 * on the property — quietly breaking that promise. Searching "Candolim, Goa, India"
 * centres the town instead.
 *
 * A Server Component: an iframe needs no client JavaScript, so unlike the Leaflet version
 * this replaced, the map costs the client bundle nothing.
 *
 * The stylised panel rendered by the parent stays underneath — if the frame is blocked or
 * offline, the section still shows a map-like graphic rather than an empty box.
 */
export function LocationMap({ coords, label }: { coords: Coords; label: string }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const src = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(label)}&zoom=${coords.zoom}`
    : `https://maps.google.com/maps?q=${encodeURIComponent(label)}&z=${coords.zoom}&output=embed`;

  return (
    <iframe
      src={src}
      title={`Map showing the approximate area of ${label}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      className="absolute inset-0 h-full w-full border-0"
    />
  );
}
