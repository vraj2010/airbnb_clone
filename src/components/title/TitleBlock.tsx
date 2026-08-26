import type { Listing } from '@/lib/listing';
import { ShareSaveActions } from './ShareSaveActions';

type TitleBlockProps = { listing: Listing };

/**
 * Renders above the hero gallery: the listing's single `<h1>` plus the pinned-right
 * Share/Save row. Server component - the only interactive piece (Share/Save) is
 * isolated in `ShareSaveActions`.
 */
export function TitleBlock({ listing }: TitleBlockProps) {
  return (
    <div className="flex items-end justify-between gap-4 pb-3">
      <h1 className="text-display-lg text-ink">{listing.title}</h1>
      <ShareSaveActions />
    </div>
  );
}
