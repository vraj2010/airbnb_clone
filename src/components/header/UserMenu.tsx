'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';

/**
 * Static placeholder items — the reference's real menu is auth-gated content this build
 * has no backend for. Kept as real <button role="menuitem"> so keyboard/AT users get
 * correct semantics even though the items are inert.
 */
const MENU_ITEMS = ['Sign up', 'Log in', 'Gift cards', 'Airbnb your home', 'Help'];

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-header-icon-button-size w-header-icon-button-size shrink-0 items-center justify-center rounded-pill bg-header-control transition-colors duration-fast ease-standard hover:bg-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {/* Hamburger only: top.png shows a plain 50px disc, no avatar. */}
        <Menu className="h-5 w-5 text-ink" aria-hidden="true" />
        <span className="sr-only">Open user menu</span>
      </button>

      <div
        role="menu"
        aria-label="User menu"
        aria-hidden={!open}
        className={`absolute right-0 top-full mt-2 w-56 origin-top-right rounded-card border border-border bg-canvas py-2 shadow-system transition-all duration-fast ease-standard ${
          open ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        {MENU_ITEMS.map((item) => (
          <button
            key={item}
            type="button"
            role="menuitem"
            tabIndex={open ? 0 : -1}
            className="block w-full px-4 py-2 text-left text-body-sm text-ink transition-colors duration-fast ease-standard hover:bg-surface"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
