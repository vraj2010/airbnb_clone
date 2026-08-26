'use client';

import { ChevronDown } from 'lucide-react';
import { useBooking } from './BookingContext';

/** The reference prints stay dates as MM/DD/YYYY, not "Oct 18". */
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: '2-digit',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * Check-in / checkout / guests control.
 *
 * The two date cells are now live: they read the shared range and clicking either one
 * scrolls the inline calendar into view and restarts the selection, because that calendar
 * is where dates are actually picked. Guests is a real `<select>` bounded by the
 * listing's capacity — a native control keeps keyboard and screen-reader behaviour
 * correct for free, which a div-based dropdown would have to reimplement.
 */
export function DateGuestSelector() {
  const { checkIn, checkOut, guests, maxGuests, setGuests, clearDates } = useBooking();

  const focusCalendar = () => {
    clearDates();
    document
      .getElementById('stay-calendar-heading')
      ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  const cellClass =
    'flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left transition-colors duration-fast ease-standard hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';

  const show = (d: Date | null) => (d ? dateFormatter.format(d) : 'Add date');

  return (
    <div className="overflow-hidden rounded-sm border border-border">
      <div className="grid grid-cols-2">
        <button
          type="button"
          className={`${cellClass} border-r border-border`}
          aria-label={`Check-in date, ${show(checkIn)}. Choose dates on the calendar.`}
          onClick={focusCalendar}
        >
          <span className="text-badge uppercase text-ink">Check-in</span>
          <span className="text-body-sm text-ink">{show(checkIn)}</span>
        </button>
        <button
          type="button"
          className={cellClass}
          aria-label={`Checkout date, ${show(checkOut)}. Choose dates on the calendar.`}
          onClick={focusCalendar}
        >
          <span className="text-badge uppercase text-ink">Checkout</span>
          <span className="text-body-sm text-ink">{show(checkOut)}</span>
        </button>
      </div>

      <div className="relative border-t border-border">
        <div className="pointer-events-none flex flex-col items-start gap-0.5 px-4 py-3">
          <span className="text-badge uppercase text-ink">Guests</span>
          <span className="text-body-sm text-ink">
            {guests} guest{guests === 1 ? '' : 's'}
          </span>
        </div>
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink"
          aria-hidden="true"
        />
        {/*
          A transparent native <select> laid over the styled cell: the visible text above
          stays pixel-identical to the reference while the real control keeps native
          keyboard, mobile and assistive-tech behaviour.
        */}
        <select
          aria-label="Guests"
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} guest{n === 1 ? '' : 's'}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
