type LinkColumn = { heading: string; links: string[]; wide?: boolean };

const COLUMNS: LinkColumn[] = [
  {
    heading: 'Support',
    links: ['Help Centre', 'Get help with a safety issue', 'AirCover', 'Anti-discrimination', 'Disability support', 'Cancellation options', 'Report neighbourhood concern'],
    // Seven links — twice the next group. Given its own double-width cell it flows into
    // two sub-columns instead of dictating the footer's height.
    wide: true,
  },
  {
    heading: 'Hosting',
    links: ['Airbnb your home', 'AirCover for Hosts', 'Explore hosting resources', 'Visit our community forum', 'How to host responsibly'],
  },
  {
    heading: 'Airbnb',
    links: ['Newsroom', 'New features', 'Careers', 'Investors', 'Airbnb.org emergency stays'],
  },
];

const LEGAL_LINKS = ['Privacy', 'Terms', 'Sitemap'];

const LINK_CLASS =
  'rounded-sm text-body-sm text-muted underline-offset-2 transition-colors duration-fast ease-standard hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

/**
 * Page footer: link columns, then a bottom bar with copyright and legal links.
 * Static content only, so it needs no client-side behaviour and takes no props.
 *
 * Laid out on a four-column grid rather than three. With three equal columns each cell was
 * ~350px wide holding ~150px of link text, so the footer wasted horizontal space while
 * stacking seven rows deep. Support now spans two cells and flows its links in two
 * sub-columns, which drops the tallest column from seven rows to five and takes the
 * footer from 461px to roughly 300px without dropping a single link.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border-soft">
      {/* The border is full-bleed; the content aligns to the page container. */}
      <div className="container-page flex flex-col gap-6 py-8">
        <div className="grid grid-cols-4 gap-x-8 gap-y-6">
          {COLUMNS.map((column) => (
            <div key={column.heading} className={column.wide ? 'col-span-2' : undefined}>
              <h2 className="text-title-md text-ink">{column.heading}</h2>
              <ul
                className={[
                  'mt-3 flex flex-col gap-2',
                  // `columns-2` would reflow on resize and split mid-list unpredictably;
                  // an explicit two-track grid keeps the pairing stable.
                  column.wide ? 'sm:grid sm:grid-cols-2 sm:gap-x-8' : '',
                ].join(' ')}
              >
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className={LINK_CLASS}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border-soft pt-4">
          <p className="text-body-sm text-muted">
            &copy; {new Date().getFullYear()} Airbnb Clone, Inc.
          </p>
          <ul className="flex items-center gap-2 text-body-sm text-muted">
            {LEGAL_LINKS.map((link, i) => (
              <li key={link} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">·</span>}
                <a href="#" className={LINK_CLASS}>
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
