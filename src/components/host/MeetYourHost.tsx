import { Star, Cake, GraduationCap, MessageCircle, ShieldCheck, BadgeCheck } from 'lucide-react';
import Image from 'next/image';
import type { Listing } from '@/lib/listing';

/**
 * "Meet your host" — a 340px card beside the co-host roster and host details.
 *
 * Layout is measured off the live reference over CDP, and differs from the obvious
 * arrangement in three ways worth calling out:
 *  - The card is TWO columns: avatar + name + "Host" on the left, the three stats stacked
 *    in a narrow right cell behind a divider. Each stat is value-over-label, not a
 *    label/value row.
 *  - "Born in the 80s" and the school line sit in the LEFT column *below* the card, not
 *    beside the host details on the right.
 *  - "Message host" is a grey #F2F2F2 button with dark text, not a dark filled one.
 *
 * The card's numbers are host-level, not listing-level: 1,463 reviews and a 4.68 average
 * across everything they run, against this listing's own 19 reviews at 4.95. Reusing
 * `listing.rating` here would have quietly shown the wrong pair of numbers, which is why
 * the host carries its own.
 */
/**
 * Photoless co-hosts fall back to an initial on a tinted disc, exactly as the reference
 * does for Shruti and Amisha. The two tints are the reference's own, pixel-sampled into
 * REFERENCE-MEASURED.json; they are not a hash of the name, so they stay in the data.
 */
const COHOST_TINT = {
  pink: 'bg-avatar-pink text-avatar-pink-ink',
  blue: 'bg-avatar-blue text-avatar-blue-ink',
} as const;

export function MeetYourHost({ listing }: { listing: Listing }) {
  const { host } = listing;

  const stats = [
    { value: host.reviewCount.toLocaleString('en-IN'), label: 'Reviews', icon: null },
    { value: host.rating.toFixed(2), label: 'Rating', icon: Star },
    { value: String(host.yearsHosting), label: 'Years hosting', icon: null },
  ];

  const facts = [
    { icon: Cake, text: host.bornIn },
    { icon: GraduationCap, text: `Where I went to school: ${host.school}` },
  ];

  return (
    <section aria-labelledby="host-heading" className="border-t border-border-soft py-section-gap">
      <h2 id="host-heading" className="text-display-md text-ink">
        Meet your host
      </h2>

      <div className="mt-6 flex gap-host-column-gap">
        <div className="w-host-card-width shrink-0">
          <div className="flex items-stretch rounded-card border border-border bg-canvas p-6 shadow-system">
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <div className="relative">
                <Image
                  src={host.avatar}
                  alt=""
                  width={88}
                  height={88}
                  className="h-host-avatar-size w-host-avatar-size rounded-pill object-cover"
                />
                <BadgeCheck
                  className="absolute bottom-0 right-1 h-6 w-6 rounded-pill bg-canvas text-primary"
                  aria-hidden="true"
                />
              </div>
              <p className="text-display-lg leading-tight text-ink">{host.name}</p>
              <p className="text-note text-ink">Host</p>
            </div>

            <dl className="flex shrink-0 flex-col justify-center gap-5 border-l border-border-soft pl-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dd className="flex items-center gap-1 text-stat-value text-ink">
                    {stat.value}
                    {stat.icon && (
                      <stat.icon className="h-3.5 w-3.5 fill-ink text-ink" aria-hidden="true" />
                    )}
                  </dd>
                  <dt className="text-micro text-ink">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <ul className="mt-6 flex flex-col gap-3">
            {facts.map((fact) => (
              <li key={fact.text} className="flex items-center gap-4 text-body-lg text-ink">
                <fact.icon
                  className="h-6 w-6 shrink-0 text-ink"
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
                {fact.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1">
          {host.coHosts.length > 0 && (
            <>
              <h3 className="text-heading-sm text-ink">Co-Hosts</h3>
              <ul className="mt-4 grid grid-cols-3 gap-y-3">
                {host.coHosts.map((coHost) => (
                  <li key={coHost.name} className="flex items-center gap-3 text-body-sm text-ink">
                    {'avatar' in coHost ? (
                      <Image
                        src={coHost.avatar}
                        alt=""
                        width={32}
                        height={32}
                        className="h-8 w-8 shrink-0 rounded-pill object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-body-sm font-medium ${COHOST_TINT[coHost.tint]}`}
                      >
                        {coHost.name.charAt(0)}
                      </span>
                    )}
                    {coHost.name}
                  </li>
                ))}
              </ul>
            </>
          )}

          <h3 className="mt-8 text-heading-sm text-ink">Host details</h3>
          <p className="mt-2 text-body-lg text-ink">Response rate: {host.responseRate}%</p>
          <p className="text-body-lg text-ink">Responds {host.responseTime}</p>

          <button
            type="button"
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-sm bg-header-control px-6 py-3 text-price-sm text-ink transition-colors duration-fast ease-standard hover:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Message host
          </button>

          <p className="mt-8 flex items-center gap-3 text-body-sm text-muted">
            <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
            To help protect your payment, always use Airbnb to send money and communicate
            with hosts.
          </p>
        </div>
      </div>
    </section>
  );
}
