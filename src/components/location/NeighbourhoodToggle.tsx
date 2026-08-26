'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Roughly what fits in the collapsed two lines at the full container width. Not a design
 * value — it only decides whether the toggle is offered.
 */
const CLAMP_HINT_CHARS = 200;

/**
 * Client leaf: the neighbourhood blurb's expand/collapse, mirroring the description's
 * "Show more". Short blurbs render as a plain paragraph and ship no state.
 */
export function NeighbourhoodToggle({ body }: { body: string }) {
  const [expanded, setExpanded] = useState(false);

  if (body.length <= CLAMP_HINT_CHARS) return <p className="text-body-md text-body">{body}</p>;

  return (
    <div>
      <p className={expanded ? 'text-body-md text-body' : 'text-body-md text-body line-clamp-2'}>
        {body}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="mt-4 inline-flex items-center gap-1 rounded-sm text-body-md text-ink underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {expanded ? 'Show less' : 'Show more'}
        {expanded ? (
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
