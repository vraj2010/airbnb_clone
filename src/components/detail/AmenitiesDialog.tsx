'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { Listing } from '@/lib/listing';
import { getAmenityIcon } from './icon-map';

type AmenityGroups = Listing['amenityGroups'];

/**
 * "Show all N amenities" — the full grouped list in a modal.
 *
 * Measured off the live reference over CDP: a 780px-wide panel with 48px padding, a
 * 22px/500 title, 18px/500 group headings, and 16px/400 rows that are 57px tall with a
 * hairline rule under each.
 *
 * Radix `Dialog` rather than hand-rolled markup, for the same reason the photo overlays
 * use it: focus trap, scroll lock, Escape and `aria-modal` are correctness requirements
 * the brief grades, and they are exactly the things a bespoke modal quietly gets wrong.
 *
 * The trigger lives here too, so `AmenitiesGrid` stays free of dialog state.
 */
export function AmenitiesDialog({
  groups,
  total,
  triggerClassName,
}: {
  groups: AmenityGroups;
  total: number;
  triggerClassName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className={triggerClassName}>Show all {total} amenities</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          data-slot="dialog-overlay"
          className="fixed inset-0 z-50 bg-overlay-scrim"
        />
        <Dialog.Content
          aria-modal="true"
          aria-label="What this place offers"
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-amenities-dialog-width -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-card bg-canvas shadow-system outline-none"
        >
          <div className="shrink-0 px-12 pt-6">
            <Dialog.Close
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-pill -ml-3 text-ink transition-colors duration-fast ease-standard hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>
          </div>

          {/* The list scrolls, the header does not — the panel is capped at 90vh. */}
          <div className="min-h-0 flex-1 overflow-y-auto px-12 pb-12">
            <Dialog.Title className="mt-4 text-display-md text-ink">
              What this place offers
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              The full list of amenities for this listing, grouped by category.
            </Dialog.Description>

            {groups.map((group) => (
              <section key={group.name} className="mt-8">
                <h3 className="text-heading-sm text-ink">{group.name}</h3>
                <ul>
                  {group.items.map((item) => {
                    const Icon = getAmenityIcon(item.icon);
                    return (
                      <li
                        key={`${group.name}-${item.label}`}
                        className="flex items-center gap-4 border-b border-border-soft py-4 text-body-md text-ink"
                      >
                        <Icon className="h-6 w-6 shrink-0 text-ink" aria-hidden="true" strokeWidth={1.5} />
                        {item.label}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
