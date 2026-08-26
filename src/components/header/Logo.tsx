import Image from 'next/image';

/**
 * Header lockup: Airbnb's Bélo mark and wordmark, rendered from the raster asset the
 * project owner supplied (1000logos.net) rather than a hand-drawn approximation, which
 * never matched the real curve.
 *
 * The file is cropped to its ink bounds, so the intrinsic 719x226 ratio reproduces the
 * measured lockup exactly: at the 40px logo height of `top.png` it lays out 127px wide
 * against the 129px measured there.
 *
 * Airbnb and the Bélo are trademarks of Airbnb, Inc. This is a non-commercial clone
 * assignment; the asset is used for evaluation fidelity only and is not owned here.
 *
 * Exposed as a single `role="img"` named "Airbnb" — it is one graphic, not an icon beside
 * a word — which is also why the <Image> itself carries an empty alt.
 */
export function Logo() {
  return (
    <div role="img" aria-label="Airbnb" className="flex items-center">
      <Image
        src="/brand/airbnb-logo.png"
        alt=""
        width={719}
        height={226}
        priority
        className="h-logo-height w-auto"
      />
    </div>
  );
}
