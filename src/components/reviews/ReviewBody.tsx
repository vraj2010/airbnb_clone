'use client';

import { useState } from 'react';

/**
 * Roughly what fits in the clamped four lines at the measured review-card width. Not a
 * design value — it only decides whether a "Show more" is worth offering, and the clamp
 * itself does the real work either way.
 */
const CLAMP_HINT_CHARS = 240;

/**
 * Client leaf: the per-review "Show more" clamp toggle, and the only interactive part of
 * a review card. Short reviews render as a plain paragraph and ship no state.
 *
 * `truncated` means the seed itself is short of the full review — the capture was cut off
 * mid-sentence. Expanding shows everything we hold, so the card says so plainly instead
 * of pretending the rest is one click away.
 */
export function ReviewBody({ body, truncated }: { body: string; truncated: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const clamps = truncated || body.length > CLAMP_HINT_CHARS;

  if (!clamps) return <p className="text-body-md text-ink">{body}</p>;

  return (
    <div>
      <p className={expanded ? 'text-body-md text-ink' : 'text-body-md text-ink line-clamp-4'}>
        {body}
        {truncated && <span aria-hidden="true">…</span>}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="mt-2 rounded-sm text-body-sm text-ink underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {expanded ? 'Show less' : 'Show more'}
      </button>
      {expanded && truncated && (
        <p className="mt-2 text-body-sm text-muted">
          This review was captured in full only up to this point.
        </p>
      )}
    </div>
  );
}
