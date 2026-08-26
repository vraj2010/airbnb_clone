'use client';

import { useState } from 'react';
/*
 * `Share`, not `Share2`. Magnifying the reference's title row shows the iOS-style upload
 * glyph — a tray open at the top with an arrow rising out of it — where `Share2` is the
 * three-connected-dots network mark. Different icon, not a different weight.
 */
import { Share, Heart } from 'lucide-react';

/**
 * Share/Save row pinned to the right of the title.
 *
 * Client leaf: Save needs local toggle state (`aria-pressed`) and both actions need
 * click handlers. Share has no real target yet (no native share/OS integration wired
 * up) so it is a no-op placeholder; Save toggles a local "saved" boolean only - it does
 * not persist anywhere yet.
 */
export function ShareSaveActions() {
  const [saved, setSaved] = useState(false);

  return (
    /*
     * Measured in /output/Screenshot…092538: the two controls span x1467..1637 with the
     * labels permanently underlined (not underline-on-hover) at body size, each preceded
     * by a 20px outline icon.
     */
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-sm p-2 text-nav-label text-ink transition-colors duration-fast ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Share className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
        <span className="underline underline-offset-2">Share</span>
      </button>
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => setSaved((prev) => !prev)}
        className={`inline-flex items-center gap-2 rounded-sm p-2 text-nav-label transition-colors duration-fast ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${saved ? 'text-primary' : 'text-ink'}`}
      >
        <Heart
          className="h-4 w-4"
          aria-hidden="true"
          strokeWidth={2}
          fill={saved ? 'currentColor' : 'none'}
        />
        <span className="underline underline-offset-2">{saved ? 'Saved' : 'Save'}</span>
      </button>
    </div>
  );
}
