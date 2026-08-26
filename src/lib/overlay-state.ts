/**
 * Overlay state lives in the URL, not in component state.
 *
 * Measured from the reference: the photo tour is `?modal=PHOTO_TOUR_SCROLLABLE`, and the
 * lightbox adds `&modalItem=<photo id>` where ids start at 1000 and increment. Keeping
 * this in one module means the hero, the tour and the lightbox cannot disagree about the
 * contract, and both overlays stay linkable and back-button-friendly.
 */

const MODAL_PARAM = 'modal';
const MODAL_ITEM_PARAM = 'modalItem';
const PHOTO_TOUR = 'PHOTO_TOUR_SCROLLABLE';

/** Raw search params as Next hands them to a page. */
export type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function photoTourHref() {
  return `?${MODAL_PARAM}=${PHOTO_TOUR}`;
}

export function lightboxHref(photoId: number) {
  return `?${MODAL_PARAM}=${PHOTO_TOUR}&${MODAL_ITEM_PARAM}=${photoId}`;
}

export type OverlayState = {
  /** True when either overlay is open — the photo tour is the base layer of both. */
  tourOpen: boolean;
  /** Photo id when the lightbox is open, otherwise null. */
  lightboxPhotoId: number | null;
};

export function readOverlayState(params: SearchParams): OverlayState {
  const tourOpen = first(params[MODAL_PARAM]) === PHOTO_TOUR;
  const rawItem = first(params[MODAL_ITEM_PARAM]);
  const parsed = rawItem === undefined ? Number.NaN : Number(rawItem);

  return {
    tourOpen,
    lightboxPhotoId: tourOpen && Number.isFinite(parsed) ? parsed : null,
  };
}
