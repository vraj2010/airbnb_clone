import {
  DoorOpen,
  Sparkles,
  CalendarCheck,
  Key,
  Wifi,
  Shield,
  Star,
  Waves,
  Snowflake,
  Info,
  type LucideIcon,
} from 'lucide-react';

/**
 * Maps a highlight's kebab-case `icon` string (as authored in the seed JSON) to a
 * lucide-react icon component. Only static imports are used so this stays a plain
 * value module - no client-side icon fetching, no layout shift on first paint.
 *
 * Extend this map as new highlight icon names show up in the seed data. Unknown
 * names fall back to `Info` rather than throwing.
 */
const HIGHLIGHT_ICON_MAP: Record<string, LucideIcon> = {
  'door-open': DoorOpen,
  sparkles: Sparkles,
  'calendar-check': CalendarCheck,
  key: Key,
  wifi: Wifi,
  shield: Shield,
  star: Star,
  waves: Waves,
  snowflake: Snowflake,
};

export function getHighlightIcon(name: string): LucideIcon {
  return HIGHLIGHT_ICON_MAP[name] ?? Info;
}
