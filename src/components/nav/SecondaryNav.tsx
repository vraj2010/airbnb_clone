'use client';

import { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import type { Listing } from '@/lib/listing';
import { NavPriceSummary } from '@/components/booking';

const TABS = [
  { href: '#photos', label: 'Photos' },
  { href: '#amenities', label: 'Amenities' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#location-heading', label: 'Location' },
];

/**
 * Sticky secondary nav: anchor tabs to the section landmarks below, plus a compact
 * price/rating/Reserve summary. Hidden until the hero mosaic scrolls out of view — a
 * sentinel just above it drives an IntersectionObserver rather than a scroll listener,
 * so there is no per-frame work while it stays visible or stays hidden.
 *
 * A client leaf, not part of `SiteHeader`: the primary header stays a Server Component,
 * and this bar sits directly beneath it (`top-header-height`) rather than replacing it.
 */
export function SecondaryNav({ listing }: { listing: Listing }) {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const { rating } = listing;

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" />
      {/*
        `inert` alongside `aria-hidden`, not instead of it. Faded out, the bar still held
        its own Reserve button and four section links in the tab order, so a keyboard user
        tabbed into controls that were invisible and announced as hidden — axe files that
        as `aria-hidden-focus`, and it is a real trap, not a rule technicality. `inert`
        is what actually removes them; `pointer-events-none` only stops the mouse.
      */}
      <div
        aria-hidden={!visible}
        inert={!visible}
        className={[
          'fixed inset-x-0 top-0 z-40 border-b border-border-soft bg-canvas transition-opacity duration-base ease-standard',
          visible ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
      >
        <div className="container-page flex h-secondary-nav-height items-center justify-between">
          <nav aria-label="Listing sections" className="flex items-center gap-8">
            {TABS.map((tab, index) => (
              <a
                key={tab.href}
                href={tab.href}
                className={
                  index === 0
                    ? 'text-nav-label text-ink underline decoration-2 underline-offset-8'
                    : 'text-nav-label text-ink transition-colors duration-fast ease-standard hover:underline'
                }
              >
                {tab.label}
              </a>
            ))}
          </nav>

          {/* Price and rating stack on two right-aligned lines, then the pill CTA —
              measured from /output/output-1.png (the CTA is 50px tall, radius = h/2). */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <NavPriceSummary rating={rating.overall} reviewCount={rating.reviewCount} />
              <p className="flex items-center justify-end gap-1 text-note text-ink" aria-hidden="true">
                <Star className="h-3.5 w-3.5 fill-ink text-ink" />
                <span>{rating.overall.toFixed(2)}</span>
                <span>&middot;</span>
                <span>{rating.reviewCount} reviews</span>
              </p>
            </div>
            <button
              type="button"
              className="h-12 shrink-0 rounded-pill bg-linear-to-r from-primary-gradient-from to-primary-gradient-to px-8 text-nav-label text-canvas transition-opacity duration-fast ease-standard hover:opacity-90"
            >
              Reserve
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
