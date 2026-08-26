'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Keyboard } from 'lucide-react';
import type { Listing } from '@/lib/listing';
import { useBooking, sameDay } from './BookingContext';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const rangeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const dayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** Today at UTC midnight, so "before today" compares like-for-like with the grid cells. */
function todayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** One month's day grid. Every in-range day is a real button. */
function MonthGrid({ year, month }: { year: number; month: number }) {
  const { checkIn, previewEnd, selectDate, setHoverDate } = useBooking();
  const first = new Date(Date.UTC(year, month, 1));
  const today = todayUTC();

  const cells: (Date | null)[] = [
    ...Array.from({ length: first.getUTCDay() }, () => null),
    ...Array.from({ length: daysInMonth(year, month) }, (_, i) => new Date(Date.UTC(year, month, i + 1))),
  ];

  return (
    <div className="flex-1">
      <p className="text-center text-title-md text-ink">{monthFormatter.format(first)}</p>
      {/*
        Deliberately NOT `role="grid"`. It was, and axe flagged `aria-required-children`
        (critical) because a grid must hold rows holding gridcells, while this is one flat
        seven-column CSS grid. Wrapping rows to satisfy the shape would have been the
        smaller lie: `grid` also promises two-dimensional arrow-key navigation, which this
        calendar does not implement. Each day is a button carrying its full date in
        `aria-label`, under a month heading — announced correctly, and no promise broken.
      */}
      {/*
        `role="group"` is not decoration: a bare <div> exposes no role, and a role-less
        element may not carry `aria-label` at all (axe: `aria-prohibited-attr`, serious).
        Dropping the grid role without this left the month name on an element that could
        not own a name. `group` can, and claims only what is true — these days belong
        together.
      */}
      <div
        role="group"
        aria-label={monthFormatter.format(first)}
        className="mt-4 grid grid-cols-7 gap-y-1"
      >
        {WEEKDAYS.map((day, i) => (
          <span key={i} className="text-center text-body-sm text-muted" aria-hidden="true">
            {day}
          </span>
        ))}

        {cells.map((date, i) => {
          if (!date) return <span key={`blank-${i}`} />;

          const past = date.getTime() < today.getTime();
          const isStart = sameDay(date, checkIn);
          const isEnd = sameDay(date, previewEnd);
          const inRange =
            !!checkIn && !!previewEnd && date > checkIn && date < previewEnd;
          const selected = isStart || isEnd;

          return (
            <div key={date.toISOString()} className="relative flex h-10 items-center justify-center">
              {(inRange || selected) && (
                <span
                  aria-hidden="true"
                  className={[
                    'absolute inset-y-0 bg-surface',
                    isStart && isEnd
                      ? 'hidden'
                      : isStart
                        ? 'left-1/2 right-0'
                        : isEnd
                          ? 'left-0 right-1/2'
                          : 'inset-x-0',
                  ].join(' ')}
                />
              )}
              <button
                type="button"
                disabled={past}
                aria-pressed={selected}
                aria-label={`${dayFormatter.format(date)}${
                  isStart ? ', check-in' : isEnd ? ', checkout' : ''
                }`}
                onClick={() => selectDate(date)}
                onMouseEnter={() => setHoverDate(date)}
                onMouseLeave={() => setHoverDate(null)}
                className={[
                  'relative z-10 flex h-10 w-10 items-center justify-center rounded-pill text-body-sm',
                  'transition-colors duration-fast ease-standard',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary',
                  past
                    ? 'cursor-not-allowed text-muted line-through'
                    : selected
                      ? 'bg-ink text-canvas'
                      : 'text-ink hover:border hover:border-ink',
                ].join(' ')}
              >
                {date.getUTCDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Inline two-month range picker under "What this place offers".
 *
 * Every day is clickable: the first click sets check-in, the next sets checkout, and a
 * click at or before the current start begins a new range. Hovering previews the
 * tentative range. The selection lives in `BookingContext`, so the sidebar control, the
 * price headline, the cancellation cutoff and the sticky sub-nav all move with it.
 *
 * The visible months are local state — paging the calendar is not part of the booking,
 * and keeping it here avoids re-rendering the price row every time someone browses ahead.
 */
export function StayCalendar({ listing }: { listing: Listing }) {
  const { checkIn, checkOut, nights, clearDates } = useBooking();

  /*
   * The visible month is its own state, seeded once from the initial check-in — not
   * derived from the current one. Deriving it meant "Clear dates" snapped the view back to
   * today's month and yanked the user out of whatever month they were browsing.
   */
  const [monthIndex, setMonthIndex] = useState(() => {
    const base = checkIn ?? todayUTC();
    return base.getUTCFullYear() * 12 + base.getUTCMonth();
  });

  const anchor = { year: Math.floor(monthIndex / 12), month: monthIndex % 12 };
  const next = { year: Math.floor((monthIndex + 1) / 12), month: (monthIndex + 1) % 12 };

  const heading =
    nights > 0
      ? `${nights} night${nights === 1 ? '' : 's'} in ${listing.location.city}`
      : `Select dates in ${listing.location.city}`;

  const subtitle =
    checkIn && checkOut
      ? `${rangeFormatter.format(checkIn)} - ${rangeFormatter.format(checkOut)}`
      : checkIn
        ? `${rangeFormatter.format(checkIn)} - add a checkout date`
        : 'Add your travel dates for exact pricing';

  return (
    <section aria-labelledby="stay-calendar-heading" className="border-t border-border-soft py-section-gap">
      <h2 id="stay-calendar-heading" className="text-display-md text-ink">
        {heading}
      </h2>
      {/* Announces the range as it changes, for anyone not watching the grid. */}
      <p className="mt-1 text-body-md text-body" aria-live="polite">
        {subtitle}
      </p>

      <div className="mt-6 flex items-start gap-8">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setMonthIndex((value) => value - 1)}
          className="mt-8 flex h-8 w-8 shrink-0 items-center justify-center rounded-pill border border-border text-ink transition-colors duration-fast ease-standard hover:bg-surface"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <MonthGrid year={anchor.year} month={anchor.month} />
        <MonthGrid year={next.year} month={next.month} />

        <button
          type="button"
          aria-label="Next month"
          onClick={() => setMonthIndex((value) => value + 1)}
          className="mt-8 flex h-8 w-8 shrink-0 items-center justify-center rounded-pill border border-border text-ink transition-colors duration-fast ease-standard hover:bg-surface"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          aria-label="Enter dates with a keyboard"
          className="flex h-10 w-10 items-center justify-center rounded-sm border border-border text-ink transition-colors duration-fast ease-standard hover:bg-surface"
        >
          <Keyboard className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={clearDates}
          className="rounded-sm text-body-md text-ink underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Clear dates
        </button>
      </div>
    </section>
  );
}
