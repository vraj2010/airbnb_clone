import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility gate across all three views: listing page, photo tour, lightbox.
 *
 * The bar is zero `serious` and zero `critical` axe violations. Moderate/minor are
 * reported but do not fail — they are logged for the punch list rather than silently
 * swallowed or allowed to block the build on cosmetic findings.
 *
 * The overlay specs are written against the URL contract measured on the reference:
 *   photo tour -> ?modal=PHOTO_TOUR_SCROLLABLE
 *   lightbox   -> ?modal=PHOTO_TOUR_SCROLLABLE&modalItem=<id>
 */

const SERIOUS = new Set(['serious', 'critical']);

/**
 * Declared, deliberate exceptions. These are NOT suppressed — every match is printed on
 * every run, so the gate can never quietly go green over one. A violation that is not
 * listed here still fails.
 *
 * Keep this list at zero entries wherever the defect is ours to fix.
 */
const KNOWN_EXCEPTIONS: { id: string; target: string; reason: string }[] = [
  {
    id: 'color-contrast',
    // Prefix, not the full selector: axe names a node by whichever attribute it finds
    // unique, and it switched from aria-live to aria-atomic when the counter gained the
    // latter — silently un-matching this entry and turning the gate red on an unchanged
    // element. Matching the attribute name alone survives that.
    target: 'p[aria-atomic=',
    reason:
      'Lightbox counter. axe reports this with messageKey "elmPartiallyObscuring" and a ' +
      'ratio of 0 - it cannot compute a background because the element overlaps the ' +
      'letterboxed photo. Computed by hand it is rgb(34,34,34) on rgb(255,255,255) = ' +
      '15.9:1, comfortably past AA. A measurement limitation, not a defect.',
  },
  {
    id: 'color-contrast',
    target: '.text-primary.text-title-md',
    reason:
      'The "airbnb" wordmark. WCAG 1.4.3 exempts text that is part of a logo or brand ' +
      'name from the contrast requirement; axe cannot infer that intent. The lockup is ' +
      'already marked role="img" with an accessible name so it is announced once, as a ' +
      'logo. Recolouring a brand mark to satisfy a rule it is exempt from would be wrong.',
  },
  {
    id: 'color-contrast',
    target: '.h-reserve-button-height',
    reason:
      'Reserve CTA. axe reports messageKey "bgGradient" — it cannot compute a background ' +
      'behind a gradient, so it files the node rather than measuring it. Measured by hand ' +
      'the button passes at both ends: white on #E31C5F = 4.57:1 and on #D70466 = 5.12:1, ' +
      'each over the 4.5:1 AA threshold. Note this replaced an earlier entry for the flat ' +
      '#FF385C button, which genuinely failed at 3.52:1 — matching the reference took the ' +
      'CTA to the gradient and incidentally fixed it. A measurement limitation, not a defect.',
  },
  {
    id: 'color-contrast',
    target: '.bg-avatar-pink',
    reason:
      'Co-host initial disc (Shruti). Unlike every other entry here this one does NOT ' +
      'pass when measured by hand: #D4356E on #FDE7EF is 3.93:1, short of AA. The colours ' +
      'are the reference\'s own, pixel-sampled from /output screenshot 092850, and the ' +
      'brief is to match it. Nothing is lost by keeping them: the glyph is a single ' +
      'decorative letter, aria-hidden, and the co-host\'s full name sits beside it in the ' +
      'same list item at text-ink on white = 15.9:1. axe itself files this as incomplete ' +
      'with messageKey "shortTextContent" for exactly that reason. If the reference is ' +
      'ever allowed to diverge, darkening the ink to #C22D62 clears 4.5:1.',
  },
  {
    id: 'color-contrast',
    target: '.bg-avatar-blue',
    reason:
      'Co-host initial disc (Amisha). Same case as .bg-avatar-pink above: #3A6ECC on ' +
      '#E7F0FD is 4.26:1, the reference\'s own pair, decorative and aria-hidden with the ' +
      'name rendered beside it. #3465C0 would clear 4.5:1 if fidelity ever gives way.',
  },
  {
    id: 'color-contrast',
    target: '.w-nearby-card-width',
    reason:
      '"More stays nearby" is a scrolling track, matching the reference: cards are 208px ' +
      'and step 228px, so five fill the 1120px content width and the rest are clipped by ' +
      'the overflow. axe reports the clipped card with messageKey "elmPartiallyObscured" ' +
      'and a ratio of 0 — it cannot sample a background it cannot see. The text is ' +
      'text-ink rgb(34,34,34) on bg-canvas rgb(255,255,255) = 15.9:1, the same pair as the ' +
      'five cards beside it that pass. Same class of measurement limitation as the ' +
      'lightbox counter above, not a defect.',
  },
];

function isKnown(id: string, target: string) {
  return KNOWN_EXCEPTIONS.some((k) => k.id === id && target.includes(k.target));
}

/**
 * `scope` restricts the scan to a selector. Overlay scans use `[role="dialog"]` on
 * purpose: while an overlay is open the page behind it is `aria-hidden` and covered by an
 * opaque layer, so its findings are neither the overlay's fault nor visible to anyone.
 * Scanning the whole document there reports the listing page's issues three more times and
 * flags Radix's own (correct) background hiding as a defect.
 */
async function axeScan(page: Page, label: string, scope?: string) {
  const builder = new AxeBuilder({ page });
  if (scope) builder.include(scope);
  const results = await builder.analyze();

  // `incomplete` is not noise — axe files aria-hidden-focus there because it cannot decide
  // tabbability itself, and reading only `violations` hid a real serious defect for a
  // whole phase.
  //
  // This deliberately accepts EVERY serious incomplete, not just aria-hidden-focus. The
  // narrower filter was dead code in the overlay scans: their scope is
  // `[role="dialog"]:not([aria-hidden="true"])`, which excludes aria-hidden subtrees by
  // construction, so the one rule it accepted could never appear there. Anything genuinely
  // not-a-defect goes in KNOWN_EXCEPTIONS with its reasoning, where it stays visible.
  const incompleteSerious = results.incomplete.filter((v) => SERIOUS.has(v.impact ?? 'serious'));

  const serious = [
    ...results.violations.filter((v) => SERIOUS.has(v.impact ?? '')),
    ...incompleteSerious,
  ];
  const advisory = results.violations.filter((v) => !SERIOUS.has(v.impact ?? ''));

  // Split node-by-node, not violation-by-violation: one known node must never excuse a
  // second, unknown node under the same rule id.
  const known: string[] = [];
  const blocking = serious
    .map((v) => {
      const nodes = v.nodes.filter((n) => {
        const t = n.target.join(' ');
        if (isKnown(v.id, t)) {
          known.push(`${v.id} @ ${t}`);
          return false;
        }
        return true;
      });
      return { ...v, nodes };
    })
    .filter((v) => v.nodes.length > 0);

  if (known.length) {
    console.log(`[${label}] known documented exceptions (see BLOCKERS B6):`);
    for (const k of known) console.log(`  ALLOWED  ${k}`);
  }

  if (advisory.length) {
    console.log(`[${label}] advisory (non-blocking):`);
    for (const v of advisory) {
      console.log(`  ${v.impact} ${v.id} x${v.nodes.length} — ${v.help}`);
    }
  }
  if (blocking.length) {
    console.log(`[${label}] BLOCKING:`);
    for (const v of blocking) {
      console.log(`  ${v.impact} ${v.id} x${v.nodes.length} — ${v.help}`);
      for (const n of v.nodes.slice(0, 3)) console.log(`    ${n.target.join(' ')}`);
    }
  }
  expect(blocking, `${label}: ${blocking.map((v) => v.id).join(', ')}`).toEqual([]);
}

test.describe('listing page', () => {
  test('has no serious or critical axe violations', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await axeScan(page, 'listing');
  });

  test('exposes the expected landmarks and a single h1', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
  });

  test('has a skip link that moves focus to main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.locator('a[href="#main"]');
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('the reference has zero <hr> elements — dividers must be CSS borders', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('hr')).toHaveCount(0);
  });
});

test.describe('photo tour overlay', () => {
  test('opens from "Show all photos" and traps focus', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /show all photos/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAccessibleName(/photo tour/i);

    // Focus must have moved inside the dialog.
    const inside = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      return !!d && d.contains(document.activeElement);
    });
    expect(inside).toBe(true);
  });

  test('traps focus: tabbing never escapes and the cycle wraps', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /show all photos/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const first = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));

    // Walk far enough to wrap (3 chrome + 9 thumbnails + 43 photos = 55 stops).
    const escaped: string[] = [];
    const visited = new Set<string>();
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      visited.add(
        (await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? '')) || '',
      );
      const outside = await page.evaluate(() => {
        const d = document.querySelector('[role="dialog"]');
        const a = document.activeElement;
        if (!d || !a || a === document.body) return 'BODY';
        return d.contains(a) ? null : (a.tagName + ' ' + (a.textContent ?? '').trim().slice(0, 20));
      });
      if (outside) escaped.push(`step ${i}: ${outside}`);
    }
    expect(escaped, 'focus left the dialog').toEqual([]);

    // The cycle must actually WRAP. Asserting only "focus stayed inside" would pass for a
    // dialog that pinned focus to one element forever.
    expect(visited.size, 'focus never moved - that is a pin, not a trap').toBeGreaterThan(10);
    expect(visited.has(first!), 'tabbing did not return to the first stop').toBe(true);

    // Shift+Tab from the first stop must wrap backwards to the LAST stop, not merely stay
    // somewhere inside.
    await page.keyboard.press('Escape');
    await page.getByRole('link', { name: /show all photos/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Shift+Tab');
    const back = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
    expect(back, 'Shift+Tab from the first stop should land on the last').toMatch(/view photo 43 of 43/i);
  });

  test('reflects open state in the URL', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /show all photos/i }).click();
    await expect(page).toHaveURL(/modal=PHOTO_TOUR_SCROLLABLE/);
  });

  test('Escape closes it and restores focus to the trigger', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('link', { name: /show all photos/i });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('locks body scroll without shifting the page', async ({ page }) => {
    await page.goto('/');
    // Measure the scrollbar BEFORE opening — once body overflow is hidden it is gone, so
    // checking afterwards always reads 0 and the guard would never fire.
    const scrollbar = await page.evaluate(
      () => window.innerWidth - document.documentElement.clientWidth,
    );
    expect(scrollbar, 'no scrollbar present - the shift assertion would be vacuous').toBeGreaterThan(0);

    const before = await page.evaluate(() => document.querySelector('main')!.getBoundingClientRect().x);

    await page.getByRole('link', { name: /show all photos/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const after = await page.evaluate(() => document.querySelector('main')!.getBoundingClientRect().x);
    const overflow = await page.evaluate(() => getComputedStyle(document.body).overflow);

    expect(overflow).toBe('hidden');
    // The reference shifts content 8px here (uncompensated scrollbar). That is a bug we
    // deliberately do not reproduce — see README.
    expect(after).toBe(before);
  });

  test('has no serious or critical axe violations while open', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /show all photos/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await axeScan(page, 'photo-tour', '[role="dialog"]');
  });
});

test.describe('lightbox overlay', () => {
  /**
   * The lightbox layers over the photo tour, so `dialog.last()` is the lightbox.
   * Waiting on the URL before the rendered counter matters: the key handler mounts with
   * the dialog, so asserting the counter first races the mount and reports a rendering
   * failure for what is really a navigation timing issue.
   */
  async function openLightbox(page: Page) {
    await page.goto('/');
    await page.getByRole('link', { name: /show all photos/i }).click();
    await page.getByRole('button', { name: /^view photo 1 of 43$/i }).click();
    await expect(page).toHaveURL(/modalItem=1000/);
    await expect(page.getByRole('dialog').last()).toContainText('1 of 43');
  }

  test('opens with a counter reading "1 of 43"', async ({ page }) => {
    await openLightbox(page);
  });

  test('right arrow advances the photo and the URL', async ({ page }) => {
    await openLightbox(page);
    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/modalItem=1001/);
    await expect(page.getByRole('dialog').last()).toContainText('2 of 43');
  });

  test('left arrow is a no-op on the first photo', async ({ page }) => {
    await openLightbox(page);
    await page.keyboard.press('ArrowLeft');
    await expect(page).toHaveURL(/modalItem=1000/);
    await expect(page.getByRole('dialog').last()).toContainText('1 of 43');
    await expect(page.getByRole('button', { name: /previous photo/i })).toBeDisabled();
  });

  test('Escape closes it and leaves the photo tour open beneath', async ({ page }) => {
    await openLightbox(page);
    await page.keyboard.press('Escape');
    await expect(page).not.toHaveURL(/modalItem=/);
    await expect(page).toHaveURL(/modal=PHOTO_TOUR_SCROLLABLE/);
  });

  test('restores focus to the gallery photo that opened it', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /show all photos/i }).click();
    const trigger = page.getByRole('button', { name: /^view photo 3 of 43$/i });
    await trigger.click();
    await expect(page).toHaveURL(/modalItem=1002/);

    await page.keyboard.press('Escape');
    await expect(page).not.toHaveURL(/modalItem=/);
    // Not the hero link, and not <body>: the exact photo button.
    await expect(trigger).toBeFocused();
  });

  test('restores focus when closed with the back-to-tour button', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /show all photos/i }).click();
    const trigger = page.getByRole('button', { name: /^view photo 5 of 43$/i });
    await trigger.click();
    await expect(page).toHaveURL(/modalItem=1004/);

    await page.getByRole('button', { name: /back to photo tour/i }).click();
    await expect(page).not.toHaveURL(/modalItem=/);
    await expect(trigger).toBeFocused();
  });

  test('keeps focus inside when an arrow disables itself at a boundary', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /show all photos/i }).click();
    await page.getByRole('button', { name: /^view photo 2 of 43$/i }).click();
    await expect(page).toHaveURL(/modalItem=1001/);

    // Clicking Prev lands on photo 1, which disables Prev itself.
    await page.getByRole('button', { name: /previous photo/i }).click();
    await expect(page).toHaveURL(/modalItem=1000/);
    await expect(page.getByRole('button', { name: /previous photo/i })).toBeDisabled();

    // Not just "something is focused" — it must be inside the lightbox, and specifically
    // the arrow that is still enabled.
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const dialog = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
            const a = document.activeElement;
            if (!dialog || !a || a === document.body || !dialog.contains(a)) return 'BODY';
            return a.getAttribute('aria-label') ?? '';
          }),
        { message: 'focus fell outside the lightbox when the control disabled itself' },
      )
      .toMatch(/next photo/i);
  });

  test('deep-linked lightbox exposes its controls to assistive tech', async ({ page }) => {
    // The click path and the deep-link path mount differently. This one is the shape the
    // README advertises as linkable, and it is where an aria-hidden defect hid.
    await page.goto('/?modal=PHOTO_TOUR_SCROLLABLE&modalItem=1002');
    await expect(page.getByRole('dialog').last()).toContainText('3 of 43');

    for (const name of [/^close$/i, /previous photo/i, /next photo/i, /back to photo tour/i]) {
      await expect(page.getByRole('button', { name })).toBeVisible();
    }
  });

  test('has no serious or critical axe violations while open', async ({ page }) => {
    await openLightbox(page);
    await axeScan(page, 'lightbox', '[role="dialog"]:not([aria-hidden="true"])');
  });

  test('deep-linked lightbox has no serious or critical axe violations', async ({ page }) => {
    await page.goto('/?modal=PHOTO_TOUR_SCROLLABLE&modalItem=1002');
    await expect(page.getByRole('dialog').last()).toContainText('3 of 43');
    await axeScan(page, 'lightbox-deeplink', '[role="dialog"]:not([aria-hidden="true"])');
  });
});

test.describe('motion', () => {
  test('overlays animate in by default', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /show all photos/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const anim = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]')!;
      const s = getComputedStyle(d);
      return { name: s.animationName, duration: s.animationDuration };
    });
    expect(anim.name).not.toBe('none');
    // `!== '0s'` would also be satisfied by the 0.01ms reduced-motion value.
    expect(parseFloat(anim.duration), 'animation is present but effectively instant').toBeGreaterThan(0.05);
  });

  test.describe('with prefers-reduced-motion: reduce', () => {
    // emulateMedia rather than test.use: explicit, applied to this exact page, and
    // verified by asserting the media query itself below.
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
    });

    test('the reduce preference is actually in effect', async ({ page }) => {
      await page.goto('/');
      const mq = await page.evaluate(
        () => matchMedia('(prefers-reduced-motion: reduce)').matches,
      );
      expect(mq, 'emulation did not apply - the tests below would be meaningless').toBe(true);
    });

    test('overlay animation is suppressed', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('link', { name: /show all photos/i }).click();
      await expect(page.getByRole('dialog')).toBeVisible();

      const d = await page.evaluate(
        () => getComputedStyle(document.querySelector('[role="dialog"]')!).animationDuration,
      );
      // The global reset collapses every duration to 0.01ms.
      expect(parseFloat(d)).toBeLessThan(0.001);
    });

    test('the thumbnail jump does not smooth-scroll', async ({ page }) => {
      // CSS `scroll-behavior: auto !important` does NOT override scrollIntoView's JS
      // `behavior` argument, so this has to be checked at the call site. Sample the
      // scroller: an instant jump produces one position, a smooth one produces many.
      await page.goto('/?modal=PHOTO_TOUR_SCROLLABLE');
      await expect(page.getByRole('dialog')).toBeVisible();

      await page.evaluate(() => {
        const el = document.querySelector('[role="dialog"] .overflow-y-auto')!;
        (window as unknown as { __pos: number[] }).__pos = [];
        el.addEventListener('scroll', () => {
          (window as unknown as { __pos: number[] }).__pos.push(el.scrollTop);
        });
      });

      await page.getByRole('button', { name: 'Gym' }).click();
      await page.waitForTimeout(700);

      const positions = await page.evaluate(
        () => [...new Set((window as unknown as { __pos: number[] }).__pos)].length,
      );
      expect(positions, 'scroll was animated under reduced motion').toBeLessThanOrEqual(2);
    });
  });
});

test.describe('coverage the audit found missing', () => {
  test('scroll lock is RESTORED on close, not just applied on open', async ({ page }) => {
    await page.goto('/');
    const before = await page.evaluate(() => getComputedStyle(document.body).overflow);

    await page.getByRole('link', { name: /show all photos/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden');

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(
      await page.evaluate(() => getComputedStyle(document.body).overflow),
      'body overflow was not restored to its prior value',
    ).toBe(before);
  });

  test('browser Back closes the tour and restores focus to the trigger', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('link', { name: /show all photos/i });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.goBack();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('a deep-linked overlay does not strand focus on <body> when closed', async ({ page }) => {
    // No click ever fires on a deep link, so there is no trigger to restore to. Deferring
    // to Radix parked focus on <body> while the photo tour was still open.
    await page.goto('/?modal=PHOTO_TOUR_SCROLLABLE&modalItem=1000');
    await expect(page.getByRole('dialog').last()).toContainText('1 of 43');

    await page.keyboard.press('Escape');
    await expect(page).not.toHaveURL(/modalItem=/);
    await expect(page).toHaveURL(/modal=PHOTO_TOUR_SCROLLABLE/);

    // Radix defers onCloseAutoFocus until the exit animation finishes, so a single sample
    // taken immediately reads <body> and is misleading. Poll until focus settles.
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const dialog = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
            const a = document.activeElement;
            return !!dialog && !!a && a !== document.body && dialog.contains(a);
          }),
        { message: 'focus never landed inside the still-open photo tour', timeout: 5000 },
      )
      .toBe(true);
  });
});
