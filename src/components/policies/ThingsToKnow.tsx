import { CalendarX2, Search, Shield } from 'lucide-react';
import type { Listing } from '@/lib/listing';

/**
 * "Things to know": cancellation policy, house rules, and safety & property, in three
 * equal columns — reference order, each with its own icon and a "Learn more" link.
 * Server component — the links point at no dialog the page exposes, so they are static
 * text rather than a control that would do nothing.
 */
export function ThingsToKnow({ listing }: { listing: Listing }) {
  const { houseRules } = listing;

  const columns = [
    { heading: 'Cancellation policy', items: houseRules.cancellation, icon: CalendarX2 },
    { heading: 'House rules', items: houseRules.rules, icon: Search },
    { heading: 'Safety & property', items: houseRules.safety, icon: Shield },
  ];

  return (
    <section
      aria-labelledby="things-to-know-heading"
      className="border-t border-border-soft py-section-gap"
    >
      <h2 id="things-to-know-heading" className="text-display-md text-ink">
        Things to know
      </h2>

      <div className="mt-6 grid grid-cols-3 gap-12">
        {columns.map((column) => (
          <div key={column.heading}>
            <column.icon className="h-6 w-6 text-ink" aria-hidden="true" />
            <h3 className="mt-4 text-title-md text-ink">{column.heading}</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {column.items.map((item) => (
                <li key={item} className="text-body-md text-body">
                  {item}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-4 text-body-md text-ink underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
            >
              Learn more
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
