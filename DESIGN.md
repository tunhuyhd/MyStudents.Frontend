---
name: "MyStudents Clubhouse"
description: "A youthful tutoring clubhouse with connected classes, schedules and student context."
colors:
  club-ground: "#f8faf7"
  club-ink: "#092828"
  club-butter: "#fbf6d9"
  club-lilac: "#f1eefb"
  club-mint: "#eaf6ee"
  club-action: "#08755e"
  brand-action: "#047857"
  brand-action-hover: "#065f46"
  white: "#ffffff"
  nav-selected: "#e8f5ed"
  field-ground: "#f9fbf8"
  active-ground: "#ddf5e7"
  active-ink: "#06664d"
  paused-ground: "#fff4d8"
  paused-ink: "#865409"
typography:
  display:
    fontFamily: "\"Baloo 2\", \"Be Vietnam Pro\", \"Segoe UI\", sans-serif"
    fontSize: "76px"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "\"Baloo 2\", \"Be Vietnam Pro\", \"Segoe UI\", sans-serif"
    fontSize: "clamp(32px,3.5vw,48px)"
    fontWeight: 700
    lineHeight: 1.22
    letterSpacing: "-0.02em"
  title:
    fontFamily: "\"Baloo 2\", \"Be Vietnam Pro\", \"Segoe UI\", sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  body:
    fontFamily: "\"Be Vietnam Pro\", \"Segoe UI\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "\"Be Vietnam Pro\", \"Segoe UI\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.6
rounded:
  field: "14px"
  control: "24px"
  nav: "28px"
  card: "30px"
  auth: "32px"
  chip: "20px"
spacing:
  small: "12px"
  base: "16px"
  card-gap: "20px"
  section: "28px"
  workspace: "36px"
  hero: "44px"
components:
  button-primary:
    backgroundColor: "{colors.brand-action}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.brand-action-hover}"
  button-club:
    backgroundColor: "{colors.club-action}"
    textColor: "{colors.white}"
    rounded: "18px"
    padding: "13px 17px"
  input:
    backgroundColor: "{colors.field-ground}"
    rounded: "{rounded.field}"
    padding: "12px 16px"
  navigation:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.nav}"
    height: "82px"
    padding: "0 48px"
  chip:
    backgroundColor: "{colors.active-ground}"
    textColor: "{colors.active-ink}"
    rounded: "{rounded.chip}"
    padding: "6px 11px"
  class-card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.card}"
    padding: "30px 28px"
---

# Design System: MyStudents Clubhouse

## Overview

**Creative North Star: "Clubhouse"**

A youthful tutoring clubhouse pairs inset white navigation with an off-white ground, forest ink, emerald actions and butter, lilac and mint class groupings. Rounded surfaces and an asymmetric featured class bring student context close to the schedule and direct class actions.

The user selected B / Clubhouse and approved the implemented first viewport with “Tôi duyệt”. The composition reference is `.impeccable/review/hero-repro.png`; the direction contract is `.impeccable/questions/clubhouse-contract.md`. This records the implemented visual system; it does not assert a finish-review verdict or accessibility conformance. Preserve the existing SVG logo and BrandLogo lockup, BFF/API and authentication behavior, and Vietnamese/English support.

**Key Characteristics:**
- Inset horizontal navigation and generous rounded surfaces.
- Forest ink with restrained emerald actions and pastel class groupings.
- Self-hosted humanist typography with real student initials and honest data states.

## Colors

### Primary
Forest ink anchors headings and reading; club-action supplies class-opening links, signup and focus. Shared primary buttons retain brand-action and brand-action-hover. These are distinct implemented assignments, not interchangeable values.

### Secondary
Butter, lilac and mint distinguish relational class groups and weekly schedule tiles. Featured cards use a warm white surface with a broad clipped yellow wash; companion cards fade their local pastel tone toward white. Local card paints differ from the root palette tokens and should be copied from the component source.

### Neutral
Club ground surrounds opaque white navigation and work surfaces. Fields use pale green-white. Active and paused chips pair their named background and ink with written status labels; color is supplementary.

## Typography

**Display Font:** Baloo 2, with Be Vietnam Pro, Segoe UI and sans-serif fallbacks.
**Body Font:** Be Vietnam Pro, with Segoe UI, system and sans-serif fallbacks.

Baloo 2 gives headings a rounded, expressive voice while Be Vietnam Pro keeps Vietnamese reading and controls clear. This is the user's explicitly requested typography extension to Clubhouse; the previously approved composition is not an exact font reference. The final typography overrides at the bottom of `src/app/clubhouse.css` take precedence over earlier declarations.

Both families are self-hosted with font-display swap and Vietnamese, Latin and Latin Extended unicode subsets. The 15 WOFF2 files total 260,116 bytes: Baloo 2 is variable 400–800, with heading use at 600/700; Be Vietnam Pro provides 400/500/600/700. Runtime delivery needs no font CDN. Provenance and SIL licenses live in `public/fonts/SOURCES.md`, `Baloo2-OFL.txt` and `BeVietnamPro-OFL.txt`. The replaced eight TTF files and their two licenses were removed after source references were cleared. The BrandLogo wordmark uses Baloo 2 at 700; its original SVG symbol is unchanged.

The dashboard greeting is 76px desktop, 68px at 1280–1450px, clamp(42px,5.2vw,64px) at 901–1279px, and clamp(44px,7.8vw,70px) at 900px and below. At 600px and below it uses clamp(34px,9.5vw,50px), line-height 1.16 and tracking -.02em. Page headings use the headline token and become 34px on mobile. Global headings use line-height 1.22 and tracking -.015em, while class titles use 30px/1.2, featured titles 40px, and 28px/36px respectively at 1280–1450px. Both card title variants become 27px/1.22 on mobile.

Body is 16px/1.65 at 400. Labels are 14px/1.6 at 500; buttons default to 14px/1.5 at 600. Inputs use 15px/1.6 and 16px on mobile; search and compact filter controls retain their explicit contextual overrides. Dense class metadata is 15px desktop and 13px mobile; roster names and status chips step down further where needed. Schedule times use tabular numerals. Keep display type on headings and the wordmark, and Be Vietnam Pro on controls, metadata and reading text.

Public hero headings use clamp(46px,5.4vw,80px)/1.1 and clamp(38px,10.6vw,54px) on mobile. Account form headings are 38px/1.25, reducing to 32px on mobile; the desktop story uses clamp(40px,4.3vw,66px)/1.15. Public prose uses line-height 1.8 with a 60ch maximum. Rendered evidence is `.impeccable/review/{home,classes,profile,login}-1440.png` and the corresponding `-390.png` files; these are implementation evidence, not a new global review verdict.

## Layout

Horizontal navigation is inset 36px with 28px top clearance, capped at 1464px and 82px tall. Workspace content caps at 1536px with 36px horizontal padding. The dashboard hero pairs the large introduction with weekly schedule tiles using 1.06fr/1fr columns; filters form a separate white rounded bar. The class grid uses 1.37fr/1fr columns and 18px by 20px gaps; the first class spans two rows. Subsequent work screens use readable rows, forms and tables rather than copying this featured composition everywhere.

At 1279px and below the featured card spans both equal-width columns and metadata returns to normal document flow. At 900px and below navigation links become a menu, the hero stacks, and search occupies a full filter row. At 600px and below classes form a single column, workspace gutters shrink to 14px, card padding becomes 24px by 20px and four featured initials fit per row. The greeting follows the responsive typography scale above, with wrapping enabled. Student records stack through their existing responsive row rules; admin tables retain horizontal containment.

Account screens pair a pale green story panel and white form panel with 32px corners; the story uses existing lg visibility and is absent below 1024px. At 900px and below the account layout is block flow; mobile form corners reduce to 26px. Public pages reuse the ground, rounded preview and pastel class tiles; their hero collapses to one column at 900px.

## Elevation & Depth

Tonal surfaces and clipped color washes supply most depth. Card hover adds a faint 0 10px 26px shadow; menus use stronger local shadows, while the public preview uses a restrained 0 18px 50px shadow and 2-degree rotation, removed below 900px. Keep the featured paint behind content and decorative gestures non-interactive.

Control transitions run around 180ms, weekly tiles 200ms, and cards 220ms with cubic-bezier(.16,1,.3,1). Weekly tiles rise 3px on hover; arrow links move 3px horizontally; buttons settle 1px on press. The greeting enters over 480ms and the arc reveals over 700ms only with no reduced-motion preference. Reduced-motion CSS collapses animation/transition duration to .01ms; this does not independently certify every JavaScript animation.

## Shapes

Rounded rectangles define navigation and cards, pill-like buttons and status chips support actions, and circular initials provide student context. Cards use 30px corners on desktop and 24px on small screens; student rows use 22px, generic shared buttons 24px, fields 14px and account panels 32px. Local action buttons intentionally use 18px or 30px corners. Preserve those role differences rather than imposing one radius everywhere.

## Components

**Buttons and fields.** Shared primary buttons remain emerald; class-opening actions use club-action. Shared inputs retain existing validation, disabled and loading behavior. Filter search has a borderless pale surface and 22px corners. Focus-visible uses an emerald 2px outline offset 4px in Clubhouse; local component focus rules may override it and must be checked in context.

**Select dropdowns.** `src/components/ui/Select.tsx` is the shared select-only combobox for student-status filtering, administrator role selection and localized enrollment-status selection. These dropdown lists use custom Clubhouse markup; other existing hand-built menus retain their own implementations. Date inputs are outside this dropdown policy. The trigger has a 46px minimum height, 16px corners, white surface and a fine green border. The status filter is 208px on desktop and flexes on mobile; role selectors fill their cell with a 140px minimum width. The white list has 6px padding, 18px corners and a local 0 10px 32px shadow. Options have a 44px minimum height, 12px corners, a green selected treatment with a check on the actual current value, and an inset outline for the active option; selected and keyboard-active states are distinct.

Focus remains on the labelled combobox button, with expanded/controls/active-descendant attributes identifying its portalled listbox and active option. Options expose selected and disabled state. The body portal and fixed positioning avoid table/modal-body clipping; geometry is measured on open, captured scroll and resize, chooses above/below placement from available space, and clamps width within 8px viewport margins. The list scrolls with a maximum expected height of 280px, keeping the active option in view. Arrow keys open or move through enabled options with wrapping; Home/End reach the first/last enabled option; Enter/Space opens or commits. Escape closes without committing, Tab closes and continues normal focus movement, and outside pointer or blur closes. Typeahead matches normalized label prefixes with an 800ms buffer. Disabled or empty/all-disabled controls cannot open, and disabled options are skipped. These are implemented behaviors, not a claim of comprehensive assistive-technology conformance.

**Navigation.** White horizontal capsule, pale green current link, real user avatar or initials, language switcher and account popover. Below 900px a toggle opens the navigation menu; Escape dismisses it. Do not describe this as the previous fixed emerald sidebar or infer a focus trap.

**Class cards and schedule.** The first class is featured, with a large subject mark, roster initials, direct opening action and footer. Companion cards keep status, schedule, count and visible opening arrow; edit/delete live in the labelled overflow menu. Initials derive from real roster names. Loading, absent roster data and retry remain explicit; no portraits are synthesized. Long names switch metadata spacing to avoid overlap.

**Iconography.** The user-requested extension uses Phosphor (`@phosphor-icons/react`, installed 2.1.10) throughout the frontend through `src/components/ui/icons.tsx`, with direct per-icon CSR imports. Content and subject glyphs default to duotone; utility and compact controls use bold. Account navigation uses contextual fill/bold glyphs, rather than applying duotone indiscriminately. Shared control icon slots are 20px; the duotone secondary layer is strengthened to opacity .32 by shared CSS. Wrappers default to size 20 and inherit currentColor; contextual classes may set size. Icons are decorative and non-focusable by default. Supplying alt, aria-label or aria-labelledby removes the default aria-hidden value; explicit props can override defaults. Keep an accessible name on icon-only controls rather than relying on the drawing.

The exported component names are compatibility aliases, not Lucide drawings: Camera renders CameraPlus bold, Save renders FloppyDiskBack bold, KeyRound renders Password bold, Eye is bold and User renders UserCircle duotone. Profile navigation uses IdentificationCard fill and Fingerprint bold, each a 28px glyph in the same 38px mint slot with 12px corners; active slots deepen the green treatment. The persistent avatar camera badge uses a 36px green circular shell and 22px CameraPlus glyph, darkening on hover or keyboard focus. The wrapper adds `app-icon`, `data-icon-library="phosphor"`, `data-icon-glyph` and the effective `data-icon-weight` for rendered audits while retaining the accessible-label behavior above.

Subject glyphs follow the actual subject name through `SubjectIcon` and `getSubjectKind`, including Vietnamese accent normalization: mathematics uses Calculator, languages ChatCircle, physics Atom, chemistry Flask, biology Leaf, computing Code, visual art Palette, music MusicNote, and geography/history Compass. Unknown or empty subjects use BookOpen. Class cards and landing preview cards use this shared classification rather than choosing a subject icon by card index. The preview subject shell is 48px with 16px corners and a 32px glyph; at 600px and below it is 40px with 13px corners and a 28px glyph. Preserve the original SVG brand logo; Phosphor supplies interface glyphs, not a replacement identity. This extends the approved Clubhouse system and makes no additional visual-review claim.

**Form dialogs.** Class and student forms use an auto-height flex frame capped at the viewport: width min(820px,100vw - 48px), maximum height 100dvh - 48px, and 26px corners. Session-recording and class-enrollment frames use a 680px cap. Below 600px all use full width, maximum height 100dvh and 22px corners. The single header and action footer remain outside the scrolling content area; only the body scrolls. Header titles are Baloo 2 at 28px/1.2 (26px mobile), with a concise 13px hint (12px mobile) and a 44px close control. Modal labels/fields use compact contextual sizes: labels 13px, text fields 14px desktop and 16px mobile. Textareas start at 92px. Preserve existing validation, dirty-close confirmation, focus containment and handlers; the composition change does not establish new accessibility conformance.

Class creation has one heading, no decorative left sidebar or duplicate content heading, and a compact horizontal two-step strip above the scroll body. Details, dates and schedule entry stay close to their labels. Schedule rows use three field columns, two below 600px with the final field spanning the row, and one below 380px so native time inputs fit. The footer remains available when many schedule rows overflow. Student forms group student identity and the student's own phone together; parent/contact information forms the second column. Sections have an 18px internal gap; the two groups stack below 700px and date-of-birth/gender stack below 600px. Session recording and enrollment use the same compact frame; remove redundant header edit actions and give note-field icons enough text inset. Their heading groups flex to fill available space while the close control stays anchored at the right. Session recording places the date on its own full-width row, followed by paired start/end fields, to keep native time controls within the frame. On mobile, enrollment identity occupies a full-width row with the Add action on its own full-width row (44px minimum height). Enrollment email stays on one line with ellipsis; its native title exposes the complete value.

Dialog capture evidence uses `.impeccable/review/modal-{class-details,class-schedule,class-many-schedules,student-create,student-edit}-{1440,825,390,320}.png` and `modal-{record-session,add-to-class}-{1440,390}.png`. Independent review remains pending; captures document the implementation without a new global review claim.

**Other surfaces.** Student rows cycle warm, lilac and mint surfaces. Detail panels, profile, administrator tables and dialogs adopt rounded light surfaces while retaining their original controls and feedback flows. Public preview records are illustrative rather than live customer evidence.

## Do's and Don'ts

- Do preserve the existing SVG logo, real data flows and Vietnamese/English content.
- Do retain creation, search, class actions and roster retry or empty states on narrow screens.
- Do use Baloo 2 for headings and Be Vietnam Pro for reading and controls.
- Don't restore the rejected sidebar and identical-record composition as the Clubhouse identity.
- Don't invent student portraits, chat, resource libraries or usage evidence.
- Don't treat viewport approval or this document as a finish-review or WCAG conformance verdict.
