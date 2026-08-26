'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * One source of truth for the stay: the calendar in the left column, the check-in /
 * checkout / guests control in the sidebar, the card's price headline and the sticky
 * sub-nav all read and write the same range.
 *
 * Dates are held as UTC midnight so day arithmetic never drifts across a DST boundary —
 * the same reason every formatter here pins `timeZone: 'UTC'`. A local-midnight Date
 * would land on the previous day for anyone west of Greenwich once you subtract a day for
 * the cancellation cutoff.
 *
 * `checkOut` is nullable on purpose: mid-selection the user has picked a start and not yet
 * an end, and the UI has to render that honestly rather than pretend a range exists.
 */

export type BookingState = {
  checkIn: Date | null;
  checkOut: Date | null;
  hoverDate: Date | null;
  guests: number;
  /** Nights in the current range; 0 while the range is incomplete. */
  nights: number;
  /** nights × nightlyRate; 0 while the range is incomplete. */
  total: number;
  nightlyRate: number;
  currency: string;
  maxGuests: number;
  /** The day before check-in — the free-cancellation cutoff. */
  cancellationCutoff: Date | null;
  /** Range end used for painting the calendar: the real end, or the hovered one. */
  previewEnd: Date | null;
  selectDate: (day: Date) => void;
  setHoverDate: (day: Date | null) => void;
  setGuests: (n: number) => void;
  clearDates: () => void;
};

const BookingContext = createContext<BookingState | null>(null);

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside <BookingProvider>');
  return ctx;
}

const MS_PER_DAY = 86_400_000;

/** Midnight-UTC Date from a `YYYY-MM-DD` seed string. */
function parseISODate(iso: string) {
  return new Date(`${iso}T00:00:00Z`);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function sameDay(a: Date | null, b: Date | null) {
  return (
    !!a &&
    !!b &&
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function nightsBetween(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export function BookingProvider({
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  nightlyRate,
  currency,
  maxGuests,
  children,
}: {
  initialCheckIn: string;
  initialCheckOut: string;
  initialGuests: number;
  nightlyRate: number;
  currency: string;
  maxGuests: number;
  children: React.ReactNode;
}) {
  /*
   * The two ends live in ONE state object, not two. A click can move both at once
   * (completing a range, or restarting from a day before the current start), and driving
   * that through two setters means nesting one updater inside the other — which runs a
   * side effect during the update phase and double-fires under StrictMode.
   */
  const [range, setRange] = useState<{ in: Date | null; out: Date | null }>(() => ({
    in: parseISODate(initialCheckIn),
    out: parseISODate(initialCheckOut),
  }));
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [guests, setGuestsState] = useState(initialGuests);

  const { in: checkIn, out: checkOut } = range;

  /**
   * Standard range-picker rules: a click either starts a new range or closes the open one.
   * Clicking on or before the current check-in restarts rather than producing a zero or
   * negative stay.
   */
  const selectDate = useCallback((day: Date) => {
    setRange((current) => {
      if (!current.in || current.out) return { in: day, out: null };
      if (day.getTime() <= current.in.getTime()) return { in: day, out: null };
      return { in: current.in, out: day };
    });
    setHoverDate(null);
  }, []);

  const clearDates = useCallback(() => {
    setRange({ in: null, out: null });
    setHoverDate(null);
  }, []);

  const setGuests = useCallback(
    (n: number) => setGuestsState(Math.min(Math.max(1, n), maxGuests)),
    [maxGuests],
  );

  const value = useMemo<BookingState>(() => {
    // While only a start is chosen, a hover to its right previews the range.
    const previewEnd =
      checkOut ?? (checkIn && hoverDate && hoverDate.getTime() > checkIn.getTime() ? hoverDate : null);
    const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;

    return {
      checkIn,
      checkOut,
      hoverDate,
      guests,
      nights,
      total: nights * nightlyRate,
      nightlyRate,
      currency,
      maxGuests,
      cancellationCutoff: checkIn ? addDays(checkIn, -1) : null,
      previewEnd,
      selectDate,
      setHoverDate,
      setGuests,
      clearDates,
    };
  }, [checkIn, checkOut, hoverDate, guests, nightlyRate, currency, maxGuests, selectDate, setGuests, clearDates]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
