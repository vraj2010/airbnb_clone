# Estimates — the measurement punch list

**Generated from `REFERENCE-MEASURED.json` by `npm run theme`. Do not hand-edit.**

Phase 2 measurement was blocked by the reference's Vercel checkpoint (see the dead-path header in `scripts/measure/00-bootstrap.mjs`). Layout geometry had already been captured in a live browser session and is trustworthy. Everything else below is a placeholder.

| | count |
|---|---|
| measured | **90** |
| estimated | **26** |

Replacing an estimate is a one-line change in `REFERENCE-MEASURED.json` followed by
`npm run theme`. No component is touched.

## Confidence: low — 12 values

_Measure these first. Most likely to be visibly wrong._

| token | estimate | role / note |
|---|---|---|
| `color.success` | `#007A04` | discount banner — hue explicitly unverified. Darkened from the #008A05 guess, which measured 4.22:1 on the surface colour and failed WCAG AA. Nothing was measured here, so an accessible green beats an inaccessible guess; re-measure like any other estimate. |
| `color.overlay-scrim` | `rgba(0,0,0,0.60)` | photo tour scrim |
| `radius.image` | `12` | photo tour / lightbox images |
| `radius.hero` | `18` | hero mosaic OUTER corners only; inner edges square |
| `shadow.search-hover` | `rgba(0,0,0,0.18) 0 2px 4px 0` | search pill hover shadow |
| `motion.duration-fast` | `150` | hover transitions |
| `motion.duration-base` | `200` | button/state transitions |
| `motion.duration-modal` | `250` | overlay enter/exit |
| `motion.ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | default easing |
| `motion.ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | enter transitions |
| `motion.overlay-enter-scale` | `0.99` | scale the overlay content grows from on open |
| `motion.header-lift-range` | `4rem` | scroll distance over which the sticky header gains its shadow |

## Confidence: medium — 9 values


| token | estimate | role / note |
|---|---|---|
| `layout.sectionGap` | `48` |  |
| `color.body` | `#3F3F3F` | long-form copy |
| `color.surface` | `#F7F7F7` | hover surfaces, disabled fields |
| `color.primary-active` | `#E00B41` | pressed state |
| `color.error` | `#C13515` | form validation |
| `type.search-icon` | `{"size":34,"weight":400,"lineHeight":1,"letterSpacing":"normal"}` | house glyph at the head of the search pill |
| `radius.sm` | `8` | buttons, inputs |
| `radius.card` | `14` | reservation card |
| `shadow.system` | `rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px 0, rgba(0,0,0,0.10) 0 4px 8px 0` | the ONE system shadow — reservation card, floating buttons, badges |

## Confidence: high — 5 values

_Still unverified, but well-attested for Airbnb generally._

| token | estimate | role / note |
|---|---|---|
| `color.canvas` | `#FFFFFF` | page background |
| `color.border` | `#DDDDDD` | card borders |
| `color.border-soft` | `#EBEBEB` | section dividers (CSS borders — reference has zero <hr>) |
| `radius.pill` | `999` | badges, circular lightbox arrows |
| `zIndex.lightbox` | `60` | lightbox layers above the photo tour |

## Measured — verified against the live reference

| token | value | note |
|---|---|---|
| `layout.contentWidth` | `1120` | Body container, centred. Fixed max-width: still 1120 at a 1886px client width, so it does not grow. |
| `layout.contentMaxWidth` | `1120` | Same as contentWidth - the container is capped, not fluid. |
| `layout.contentSideGutter` | `24` | Gutter only matters below 1120+2*24; the cap binds on desktop. |
| `layout.headerHeight` | `89` | Live header box height. |
| `layout.searchPillHeight` | `48` | Pill 404x48, border #DDDDDD, padding 0 8px. |
| `layout.searchButtonSize` | `32` | Pink search circle 32x32, background #FF385C. |
| `layout.headerIconButtonSize` | `40` | Globe and menu 40x40 on #F2F2F2 at x=1718 and x=1766. |
| `layout.logoHeight` | `32` | Logo lockup 103x32 at x=80. |
| `layout.heroHeight` | `494` | Large tile 560x494 at x=383. |
| `layout.heroToBodyGap` | `48` |  |
| `layout.leftColumnWidth` | `652` | Left column; 652 + 96 + 372 = 1120. |
| `layout.columnGutter` | `96` | Left column ends x=1035, card starts x=1131. |
| `layout.reservationCardWidth` | `372` | Card box 372x368 at x=1131. |
| `layout.heroTileLarge` | `{"w":560,"h":494}` |  |
| `layout.heroTileSmall` | `{"w":272,"h":243}` |  |
| `layout.heroGap` | `8` | 383+560=943 -> next tile at 951; rows 243+8. |
| `layout.stickyTopOffset` | `100` | The right column's sticky wrapper is position:sticky; top:100px. With the 70px promo card and a 24px gap above it, the booking card pins with its top at 194px. |
| `layout.mapHeight` | `480` | AT 1120 content width. Measured 600px at a 1400 container (y288..y887), and 600/1400 == 480/1120, so the panel scales with the container -- generated CSS gives it aspect-ratio 1120/480 rather than a fixed height. |
| `layout.documentScrollHeight` | `6256` | informational only — not a token |
| `layout.reserveButtonHeight` | `48` | Card Reserve button 322x48. |
| `layout.cardPadding` | `22` | Booking card padding measured 22px (was 24). |
| `layout.mapGridCell` | `90` | Vertical grid lines 112.5px apart at a 1400 container => 8.036% of the container. |
| `layout.headerSideGutter` | `80` | Header is full-bleed with 80px padding: logo starts x=80, last icon button ends x=1806 in an 1886px client. |
| `layout.secondaryNavHeight` | `67` | Pinned sub-nav measured 67px tall over CDP while the page was scrolled; the header above it is position:relative and scrolls away. |
| `layout.hostCardWidth` | `340` | Host card box measured 340x261 at x=391. |
| `layout.hostAvatarSize` | `88` | Avatar image 88x88, centred in the card's left cell. |
| `layout.hostColumnGap` | `48` | Card ends x=731, the co-hosts column starts x=779. |
| `layout.promoCardGap` | `24` | Promo card ends y=785, booking card starts y=809. |
| `layout.reportGap` | `26` | Booking card ends y=1177, 'Report this listing' starts y=1203. |
| `layout.promoCardHeight` | `70` | Promo card box 372x70. |
| `layout.amenitiesDialogWidth` | `780` | Amenities dialog panel measured 780x709 with 48px side padding (title/content column 669px). |
| `layout.tourContentWidth` | `976` | Two 458px columns with a 60px gutter. The LEFT column holds the room name and caption, the RIGHT column its photos — the name is beside the photos, not above them. |
| `layout.tourColumnGap` | `60` | Room-name column ends x=898, photo column starts x=958. |
| `layout.tourChipWidth` | `112` | Chip thumbnail width. Eight chips per row across the 976px content width with 12px gaps ((976 - 7*12)/8 = 111.5), so the ninth wraps to a second row — the strip wraps, it does not scroll. |
| `layout.tourChipImageHeight` | `105` | Thumbnail height inside a jump-nav chip. |
| `layout.tourChipGap` | `12` | Chips sit 124px apart at 112 wide => 12px gap. |
| `layout.tourIconButtonSize` | `40` | Back / Share / Save controls in the tour top bar are 40x40. |
| `layout.tourPhotoGap` | `12` | Within the photo column: the lead photo is 458x305, the rest are 223x149 two-up (223 + 12 + 223 = 458). |
| `layout.searchPillPadding` | `8` | Pill inner padding is 8px on both sides (404x48 outer). The segments themselves carry 16px. |
| `layout.searchSegmentPadding` | `16` | Each segment (Anywhere 149x48, Anytime 88x48, Add guests 106x48) has 0 16px padding. |
| `layout.searchLeadIconSize` | `48` | The house glyph is a 48x48 image inside the Anywhere segment — full pill height — not a small inline emoji. |
| `layout.searchDividerHeight` | `24` | 1x24 dividers in #DDDDDD between the segments. |
| `layout.laurelWidth` | `72` | Laurel branch rendered 72x110 from a 240x365 source; the two branches are separate assets, not one mirrored. |
| `layout.laurelHeight` | `110` | Laurel branch rendered 72x110. Taller than the rating number it frames, so it sets the row height. |
| `layout.discountBadgeSize` | `32` | Promo-card badge 32x32, an SVG in the reference (a Lottie still), replacing the earlier lucide Tag glyph. |
| `layout.nearbyCardGap` | `20` | Nearby-stay cards step 228px apart at 208px wide, so the gap is 20px. Five cards plus four gaps = 1120, exactly the content width. |
| `layout.nearbyCardWidth` | `208` | Square 208x208 thumbnail. Cards step 228px apart, so five fit the 1120px content width exactly and the sixth overflows into the carousel track. |
| `font.sans` | `Circular, 'Airbnb Cereal VF', var(--font-figtree), -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif` | Figtree is LOADED as a webfont via next/font/google in src/app/layout.tsx and exposed as --font-figtree. Before this, the stack only NAMED Circular / Airbnb Cereal — neither of which is installed anywhere — so every browser fell through to its generic sans (Arial on Windows), which is a neo-grotesque and could never match a geometric face at any size. Circular and Cereal stay ahead of it for anyone who genuinely licenses them; neither is redistributed here. |
| `color.ink` | `#222222` | primary text |
| `color.muted` | `#717171` | secondary text |
| `color.primary` | `#FF385C` | brand - search circle, active accents |
| `color.lightbox-backdrop` | `#FFFFFF` | lightbox backdrop is WHITE — research doc guessed near-black and was wrong |
| `color.map-water` | `#ADD1E1` | "Where you'll be" stylised map panel, water region |
| `color.map-land` | `#E5EBDF` | map panel, land region |
| `color.header-control` | `#F2F2F2` | globe + menu discs |
| `color.primary-gradient-from` | `#E31C5F` | Reserve CTA gradient, left stop — the reference button is not a flat fill |
| `color.primary-gradient-to` | `#D70466` | Reserve CTA gradient, right stop |
| `color.map-park` | `#CFE3C8` | map panel, park/greenspace discs |
| `color.map-grid` | `#DFE5DA` | map panel hairline grid |
| `color.avatar-pink` | `#FDE7EF` | co-host initial avatar, pink disc fill (Shruti) |
| `color.avatar-pink-ink` | `#D4356E` | co-host initial avatar, pink disc letter |
| `color.avatar-blue` | `#E7F0FD` | co-host initial avatar, blue disc fill (Amisha) |
| `color.avatar-blue-ink` | `#3A6ECC` | co-host initial avatar, blue disc letter |
| `type.display-lg` | `{"size":26,"weight":500,"lineHeight":"30px","letterSpacing":"normal"}` | listing H1 |
| `type.display-md` | `{"size":22,"weight":500,"lineHeight":"26px","letterSpacing":"normal"}` | section headings, main property H2, booking-card price |
| `type.display-sm` | `{"size":20,"weight":700,"lineHeight":"28.6px","letterSpacing":"normal"}` | guest-favourite score and review count |
| `type.title-md` | `{"size":16,"weight":500,"lineHeight":"22.88px","letterSpacing":"normal"}` | host name, Show all amenities |
| `type.body-md` | `{"size":16,"weight":400,"lineHeight":"22.88px","letterSpacing":"normal"}` | listing metadata, amenity labels |
| `type.body-sm` | `{"size":14,"weight":400,"lineHeight":"20px","letterSpacing":"normal"}` | default body copy, promo text, input values |
| `type.nav-label` | `{"size":14,"weight":500,"lineHeight":"20px","letterSpacing":"normal"}` | nav tabs, pill labels, Share/Save, Reserve, feature titles |
| `type.price-sm` | `{"size":15,"weight":500,"lineHeight":"18px","letterSpacing":"normal"}` | sub-nav price |
| `type.note` | `{"size":13,"weight":400,"lineHeight":"18.59px","letterSpacing":"normal"}` | free-cancellation notice, sub-nav rating |
| `type.micro` | `{"size":12,"weight":400,"lineHeight":"17.16px","letterSpacing":"normal"}` | host-card stat labels |
| `type.caption` | `{"size":12,"weight":500,"lineHeight":"16px","letterSpacing":"normal"}` | Show all photos |
| `type.badge` | `{"size":10,"weight":700,"lineHeight":"14.3px","letterSpacing":"0.4px"}` | uppercase form labels |
| `type.card-body` | `{"size":14,"weight":400,"lineHeight":"18.2px","letterSpacing":"normal"}` | guest-favourite blurb |
| `type.logo` | `{"size":26,"weight":700,"lineHeight":1.2,"letterSpacing":"normal"}` | wordmark fallback (image asset is used) |
| `type.rating` | `{"size":100,"weight":500,"lineHeight":"143px","letterSpacing":"-3px"}` | the large guest-favourite score in the Reviews section |
| `type.label-sm` | `{"size":13,"weight":500,"lineHeight":"18px","letterSpacing":"normal"}` | guest-favourite card 'Reviews' label |
| `type.heading-sm` | `{"size":18,"weight":500,"lineHeight":"26px","letterSpacing":"normal"}` | Co-Hosts / Host details sub-headings |
| `type.stat-value` | `{"size":20,"weight":500,"lineHeight":"29px","letterSpacing":"normal"}` | host-card stat values (1,463 / 4.68 / 2) |
| `type.body-lg` | `{"size":15,"weight":400,"lineHeight":"24px","letterSpacing":"normal"}` | host details copy, Born in / school lines |
| `shadow.search` | `rgba(0,0,0,0.08) 0 1px 4px 0` | search pill resting shadow |
| `behaviour.photoTourModalParam` | `?modal=PHOTO_TOUR_SCROLLABLE` |  |
| `behaviour.lightboxItemParam` | `&modalItem=1000` | increments 1000 -> 1001 with arrow keys |
| `behaviour.photoTourAriaLabel` | `Photo tour` |  |
| `behaviour.photoTourRoomGroups` | `["Living room 1","Living room 2","Full kitchen","Bedroom","Full bathroom","Gym","Exterior","Pool","Additional photos"]` |  |
| `behaviour.photoTourThumbSize` | `48` |  |
| `behaviour.lightboxPhotoCount` | `43` | counter reads '1 of 43' |
| `behaviour.scrollbarShiftBug` | `8` | reference shifts content 8px on modal open (uncompensated scrollbar). Deliberately FIXED in the clone — see README. |
