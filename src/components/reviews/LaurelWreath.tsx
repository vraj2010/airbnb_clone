import Image from 'next/image';

type LaurelBranchProps = {
  /** Mirrors the branch horizontally so the pair frames the rating number symmetrically. */
  flip?: boolean;
  className?: string;
};

/**
 * A single laurel branch: a curved stem with a run of leaf shapes, authored as plain
 * SVG primitives (a path + ellipses) rather than traced from any reference artwork.
 * `GuestFavouriteCard` renders it twice - once with `flip` - to frame the badge text,
 * echoing the classic "guest favourite" laurel motif without copying anyone's icon set.
 * Colour comes from `currentColor`, so callers set it via a text-colour token.
 *
 * This is the right tool for the badge card specifically: the reference draws those
 * laurels inline, so there is no image asset to match. See `LaurelImage` for the reviews
 * header, where there is.
 */
export function LaurelBranch({ flip = false, className }: LaurelBranchProps) {
  return (
    <svg
      viewBox="0 0 40 68"
      width="32"
      height="54"
      fill="none"
      aria-hidden="true"
      className={`${flip ? '-scale-x-100' : ''} ${className ?? ''}`}
    >
      <path
        d="M22 2 C15 14, 15 32, 20 66"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <ellipse cx="15" cy="10" rx="6" ry="2.6" transform="rotate(-35 15 10)" fill="currentColor" />
      <ellipse cx="13" cy="20" rx="6.5" ry="2.8" transform="rotate(-22 13 20)" fill="currentColor" />
      <ellipse cx="12" cy="31" rx="7" ry="3" transform="rotate(-10 12 31)" fill="currentColor" />
      <ellipse cx="13" cy="42" rx="7" ry="3" transform="rotate(2 13 42)" fill="currentColor" />
      <ellipse cx="15" cy="52" rx="6.5" ry="2.8" transform="rotate(12 15 52)" fill="currentColor" />
      <ellipse cx="18" cy="61" rx="5.5" ry="2.4" transform="rotate(20 18 61)" fill="currentColor" />
    </svg>
  );
}

/**
 * The reviews header's laurel pair — the reference's own artwork, not the glyph above.
 *
 * Two places on the page show laurels and they are not the same thing. The badge card
 * under the title draws them inline (no image request goes out for it), which is what
 * `LaurelBranch` stands in for. The reviews header serves two 240x365 PNGs drawn at
 * 72x110, and they are NOT mirrors of each other — the leaf runs differ — so `flip` picks
 * a file rather than applying `-scale-x-100` to one.
 *
 * Scoped to that one header on purpose: squeezed down to badge size the raster turns to
 * mud, and there is no image there to match anyway.
 */
export function LaurelImage({ flip = false }: { flip?: boolean }) {
  return (
    <Image
      src={flip ? '/photos/ref/laurel-right.png' : '/photos/ref/laurel-left.png'}
      alt=""
      width={72}
      height={110}
      className="h-laurel-height w-laurel-width object-contain"
    />
  );
}
