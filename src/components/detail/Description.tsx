import type { Listing } from '@/lib/listing';
import { DescriptionToggle } from './DescriptionToggle';

/** Server component: composes the static section shell, delegates the expand/collapse
 * interaction to the client leaf.
 *
 * The translation notice sits above the copy because that is where the reference puts
 * it, and because it qualifies the text that follows — a reader who meets it afterwards
 * has already taken the description at face value. "Show original" is a link with no
 * original to show: the seed holds one language, so it is rendered as plain text rather
 * than a control that would do nothing. */
export function Description({ listing }: { listing: Listing }) {
  return (
    <section className="border-t border-border-soft py-section-gap">
      {/* A filled grey bar, not loose muted text — see /output/output-1.png. */}
      <p className="mb-8 rounded-card bg-surface px-6 py-5 text-body-sm text-ink">
        {listing.descriptionNotice}{' '}
        <span className="font-semibold underline underline-offset-2">Show original</span>
      </p>
      <DescriptionToggle paragraphs={listing.description} />
    </section>
  );
}
