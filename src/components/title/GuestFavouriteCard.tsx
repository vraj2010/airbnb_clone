import type { Listing } from '@/lib/listing';
import { LaurelBranch } from '../reviews/LaurelWreath';

export function GuestFavouriteCard({ listing }: { listing: Listing }) {
  if (!listing.rating.isGuestFavourite) return null;

  return (
    <div className="flex items-center justify-between rounded-card border border-border p-6 shadow-system">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center gap-2">
          <LaurelBranch className="text-ink" />
          <div className="flex flex-col items-center leading-tight">
            <span className="text-display-sm text-ink">Guest</span>
            <span className="text-display-sm text-ink">favourite</span>
          </div>
          <LaurelBranch flip className="text-ink" />
        </div>
      </div>

      <div className="mx-6 flex-1 text-center">
        <p className="text-title-md text-ink">
          {listing.rating.cardBlurb}
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center">
          <span className="text-display-md text-ink">{listing.rating.overall}</span>
          <span className="mt-1 text-micro text-ink tracking-widest">★★★★★</span>
        </div>
        <div className="h-10 w-[1px] bg-border" />
        <div className="flex flex-col items-center">
          <span className="text-display-md text-ink">{listing.rating.reviewCount}</span>
          <span className="mt-1 text-micro text-ink underline decoration-ink">Reviews</span>
        </div>
      </div>
    </div>
  );
}
