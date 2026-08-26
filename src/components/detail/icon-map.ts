import {
  Waves,
  Wifi,
  Car,
  Wind,
  Utensils,
  Tv,
  Dumbbell,
  WashingMachine,
  Bath,
  Shield,
  Laptop,
  PawPrint,
  Cctv,
  AlarmSmoke,
  BedDouble,
  Sofa,
  HelpCircle,
  Wine,
  Coffee,
  Refrigerator,
  Microwave,
  Snowflake,
  Fan,
  Shirt,
  Droplets,
  SprayCan,
  Blinds,
  CookingPot,
  Soup,
  Beef,
  ChefHat,
  Baby,
  DoorOpen,
  Trees,
  UtensilsCrossed,
  CalendarCheck,
  Flame,
  ShowerHead,
  Thermometer,
  type LucideIcon,
} from 'lucide-react';

/**
 * Maps the `icon` string from the seed data to a lucide-react component.
 * Unknown names fall back to a generic icon so a new amenity never breaks the grid.
 *
 * The sleeping-arrangement cards and the full-amenities dialog read from the same map — a
 * bed is an amenity icon by any other name, and a second lookup table would only be a
 * second place to forget an entry.
 */
const AMENITY_ICONS: Record<string, LucideIcon> = {
  waves: Waves,
  wifi: Wifi,
  car: Car,
  wind: Wind,
  utensils: Utensils,
  tv: Tv,
  dumbbell: Dumbbell,
  'washing-machine': WashingMachine,
  bath: Bath,
  shield: Shield,
  laptop: Laptop,
  'paw-print': PawPrint,
  cctv: Cctv,
  'alarm-smoke': AlarmSmoke,
  'bed-double': BedDouble,
  sofa: Sofa,

  // Bathroom
  hairdryer: Wind,
  spray: SprayCan,
  shampoo: Droplets,
  'hot-water': Thermometer,
  'shower-gel': ShowerHead,

  // Bedroom and laundry
  hangers: Shirt,
  'bed-linen': BedDouble,
  blinds: Blinds,
  iron: Flame,
  'clothes-storage': Shirt,
  cot: Baby,

  // Heating and cooling
  'air-conditioning': Snowflake,
  'ceiling-fan': Fan,

  // Home safety
  'co-alarm': AlarmSmoke,

  // Kitchen and dining
  fridge: Refrigerator,
  freezer: Snowflake,
  microwave: Microwave,
  'cooking-basics': CookingPot,
  crockery: Soup,
  kettle: Beef,
  coffee: Coffee,
  wine: Wine,
  toaster: Microwave,
  cooker: ChefHat,

  // Location, outdoor and services
  'private-entrance': DoorOpen,
  patio: Trees,
  'outdoor-dining': UtensilsCrossed,
  'calendar-check': CalendarCheck,
  door: DoorOpen,
};

export function getAmenityIcon(name: string): LucideIcon {
  return AMENITY_ICONS[name] ?? HelpCircle;
}
