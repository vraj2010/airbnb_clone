'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Client leaf: only the expand/collapse state is interactive. Collapsed shows the
 * first paragraph (clamped to 3 lines as a safety net for a long opener); expanded
 * shows every paragraph. Receives plain strings as props, no listing object needed.
 */
/**
 * Roughly what fits in the collapsed three lines at the measured left-column width.
 * Not a design value — it decides whether a toggle is worth offering, and being a little
 * out either way costs nothing worse than a "Show more" that reveals one extra line.
 */
const CLAMP_HINT_CHARS = 180;

export function DescriptionToggle({ paragraphs }: { paragraphs: string[] }) {
  const [expanded, setExpanded] = useState(false);

  if (paragraphs.length === 0) return null;

  // The reference's description is a single long paragraph, so counting paragraphs alone
  // hid the toggle and left the copy permanently clamped with no way to read the rest.
  const hasMore = paragraphs.length > 1 || paragraphs[0].length > CLAMP_HINT_CHARS;

  return (
    <div>
      {expanded ? (
        <div className="space-y-4">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-body-md text-body">
              {paragraph}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-body-md text-body line-clamp-3">{paragraphs[0]}</p>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mt-4 inline-flex items-center gap-1 text-body-md text-ink underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
        >
          {expanded ? 'Show less' : 'Show more'}
          {expanded ? (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}
