import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import './theme.css';

/**
 * The typeface was the real reason the fonts never matched: the theme *named*
 * Circular / Airbnb Cereal, but nothing ever LOADED a webfont, so every browser fell
 * through the whole stack to its generic sans — Arial on Windows. Arial is a
 * neo-grotesque; Cereal and Circular are geometric sans, so no amount of size tuning
 * could make the letterforms agree.
 *
 * Figtree is the closest open substitute (geometric, near-identical cap ratio ~0.72) and
 * was already the intended fallback in the original stack. Both proprietary faces stay
 * named ahead of it so anyone who genuinely has them still gets them; neither is
 * redistributed here.
 *
 * `variable` exposes it as --font-figtree, which theme.css's --font-sans points at.
 */
const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-figtree',
  display: 'swap',
});

/**
 * Root layout. Deliberately knows nothing about any particular listing — per-listing
 * <title>/<description> come from the routes via generateMetadata, so a future route
 * does not inherit one property's metadata.
 */
export const metadata: Metadata = {
  title: { default: 'Airbnb Clone', template: '%s' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={figtree.variable}>
      <body className="bg-canvas font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only rounded-sm bg-canvas px-4 py-2 text-title-md text-ink shadow-system focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
