---
name: MyStudents
description: Current visual system for the MyStudents tutoring-management web app.
colors:
  brand-primary: "#10b981"
  brand-secondary: "#0ea5e9"
  brand-accent: "#a7f3d0"
  surface-50: "#f0fdf4"
  surface-100: "#ecfdf5"
  surface-200: "#d1fae5"
  surface-300: "#a7f3d0"
  surface-400: "#527568"
  surface-500: "#47695c"
  surface-600: "#36584b"
  surface-700: "#24483a"
  surface-800: "#064e3b"
  surface-900: "#022c22"
  surface-950: "#011c16"
  brand-action: "#047857"
  brand-action-hover: "#065f46"
  canvas: "#ffffff"
  admin-canvas: "#020403"
  danger: "#ef4444"
typography:
  display:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.75rem–6rem"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem–3rem"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.625rem–0.75rem"
    fontWeight: 900
    letterSpacing: "0.1em–0.2em"
rounded:
  control: "0.75rem"
  card: "1rem–1.5rem"
  dialog: "2.5rem"
  feature: "3.5rem"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.25rem"
  6: "1.5rem"
  8: "2rem"
  10: "2.5rem"
  12: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.brand-action}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "0.625rem 1.25rem"
  button-secondary:
    backgroundColor: "#0369a1"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "0.625rem 1.25rem"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.brand-action}"
    rounded: "{rounded.control}"
    padding: "0.625rem 1.25rem"
  input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.surface-900}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1rem"
---

# Design System: MyStudents

## Overview

**Accessibility target:** WCAG 2.2 Level AA, as recorded in `PRODUCT.md`. This target guides future design and implementation verification; this document does not assert current conformance.

**Creative North Star: "Willow Study"**

The teacher-facing interface pairs a pale green canvas with emerald actions, Vietnamese-capable typography, and willow-themed background and motion details. Its current character is bright, friendly, nature-inspired, and visibly animated. The metaphor describes the implementation already in the repository; it does not establish a new brand requirement.

The product does not currently render as one unified visual system. Public and teacher screens use the light emerald-and-mint language, while administrator sign-in and management use a dark, high-contrast emerald “terminal” treatment. The global willow background is also applied behind the dark area. Record these as separate incumbent surface treatments until they are deliberately reconciled.

**Key Characteristics:**
- Emerald and mint are the main light-surface colors; sky blue is a secondary accent.
- Be Vietnam Pro gives headings a very heavy, tightly tracked display voice; Inter carries body text and controls.
- Rounded controls and generously rounded cards are common, with softer shadows, translucent surfaces, and motion used throughout.
- The administrator area is a distinct dark visual branch with some independently styled controls and English labels.

## Colors

The light application uses an emerald/mint palette with a sky-blue accent. Some roles are declared as CSS tokens; status colors, the administrator palette, and several component colors remain local literals.

### Primary
- **Emerald Brand** (`#10b981`, `--color-brand-primary`): brand emphasis, icons, selected states, and many page-specific actions in the public and teacher UI.
- **Deep Emerald Action** (`#047857`, `--color-brand-action`): default shared primary button and visible keyboard focus outline. Hover uses `#065f46` (`--color-brand-action-hover`).

### Secondary
- **Sky Blue** (`#0ea5e9`, `--color-brand-secondary`): secondary accent, including the home page's gradient text utility.
- **Mint Accent** (`#a7f3d0`, `--color-brand-accent`): pale accent; also repeated as `--color-surface-300`.

### Neutral
- **White Canvas** (`#ffffff`, `--background`): body, inputs, cards, and much of the teacher workspace.
- **Mint Surface 50** (`#f0fdf4`): pale tinted fills and low-emphasis containers.
- **Mint Surface 100** (`#ecfdf5`) and **Surface 200** (`#d1fae5`): subtle surfaces, borders, and selected backgrounds.
- **Surface 300** (`#a7f3d0`): declared token shared with the mint accent; it is notably lighter than the mid/dark surface text colors that follow.
- **Surface 400–700** (`#527568`, `#47695c`, `#36584b`, `#24483a`): subdued copy and progressively stronger green text, as used by Tailwind classes.
- **Surface 800–950** (`#064e3b`, `#022c22`, `#011c16`): deep green text and dark green surfaces.
- **Admin Canvas** (`#020403`) and **Admin Panel** (`#111814`): local near-black backgrounds in administrator screens; they are not part of the light surface ramp.
- **Status colors:** red, green, amber/yellow, blue, and emerald indicate destructive, active/present, delayed, excused, or completed states in individual components. These are mostly direct Tailwind or CSS values rather than semantic tokens.

## Typography

**Display Font:** Be Vietnam Pro (with `ui-sans-serif, system-ui, sans-serif` fallbacks)
**Body Font:** Inter (with `ui-sans-serif, system-ui, sans-serif` fallbacks)
**Label/Mono Font:** No separate label or monospace family is defined.

Both fonts load through `next/font/google`; Be Vietnam Pro includes Vietnamese and Latin subsets, while Inter uses Latin. The pairing supports Vietnamese content, but the document language remains hard-coded to English in the root layout.

### Hierarchy
- **Display** (900, `text-6xl` to `text-8xl`: 3.75rem–6rem, line-height 1.1): landing hero; the largest end is used on wide screens.
- **Headline** (900, typically `text-3xl` to `text-5xl`: 1.875rem–3rem, line-height 1.1): teacher dashboard and major page titles. The student list scales from `text-4xl` on mobile to `text-6xl` from `md`.
- **Title** (700–900, commonly `text-lg` to `text-3xl`): card titles, modal headings, and section headings. Actual weight varies by page.
- **Body** (Inter, default 1rem / 400; frequently 500–700): descriptions, form content, and supporting copy. The global body tracking is `-0.01em`; line-height is generally supplied by Tailwind utilities or browser defaults.
- **Label** (often 900, 0.625rem–0.75rem, tracking from `0.1em` to `0.2em`, frequently uppercase): status badges, field headings, and compact metadata.

All `h1` through `h6` inherit Be Vietnam Pro, weight 900, tracking `-0.04em`, and line-height `1.1`. Individual screens frequently override size, color, weight, tracking, and spacing, so the hierarchy is an observed range rather than a centrally enforced type scale.

## Layout

Tailwind CSS 4 supplies the spacing utilities; the project does not define a separate spacing scale. Repeated utility steps include 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, and 48px, but page-specific padding and gaps are common. Layouts favor generous whitespace, vertically stacked page headers, and card grids.

The teacher shell has a fixed 18rem sidebar at `lg` and above, a full-screen navigation drawer below `lg`, and a centered content region capped at 1600px. Content padding grows from 16px to 24px (`sm`), 32px (`lg`), and 40px (`xl`). The landing page and student list use containers near Tailwind's `max-w-7xl` (80rem). Teacher class cards form a responsive grid; student cards use one column by default, two from `md`, and three from `lg`. The administrator user table scrolls horizontally when its columns do not fit.

Tailwind's standard responsive breakpoints are used: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, and `2xl` 1536px. A custom `xs` breakpoint is declared at 320px. The teacher drawer switches at 1024px; other pages use a mixture of `sm`, `md`, `lg`, and `xl` behaviors. Layout adaptation is page-specific rather than governed by a shared grid component.

## Elevation & Depth

Elevation combines pale or translucent tinted surfaces with soft shadows, sometimes adding an emerald glow. White cards commonly sit on white or pale mint backgrounds; modal backdrops use dark translucent overlays and blur. Some pages also use large ambient shadows or glass blur as decoration. This is a mixed, locally authored vocabulary, not a single elevation scale.

### Shadow Vocabulary
- **Soft control/card lift:** Tailwind `shadow-sm`, `shadow-lg`, or `shadow-xl`, often paired with a thin pale border.
- **Ambient emerald glow:** custom `shadow-brand-primary/*` and emerald-colored box shadows, especially on prominent actions and hover states.
- **Deep dialog lift:** custom broad shadows such as the destructive confirmation dialog's `0 32px 64px -12px rgba(0,0,0,0.15)`.
- **Translucent layering:** `bg-white/*` plus `backdrop-blur-*` for some headers, cards, dropdowns, and modal overlays.

## Shapes

The shape language is rounded and soft, but radius is not standardized. Shared Button and Input defaults use `rounded-xl` (12px). Common cards use `rounded-2xl`/`rounded-3xl` (16px/24px), while many feature cards and modals use bespoke radii from roughly 28px to 56px. Pills appear for badges and compact status indicators. Borders are usually thin pale green or white; dark administrator panels use translucent white/emerald borders. Page-level implementations often override the shared component radius.

## Components

Components share an emerald/rounded vocabulary, though many page-specific Tailwind classes override their shared defaults.

### Buttons
- **Shape:** 12px default radius (`rounded-xl`); page code often overrides it with larger radii.
- **Primary:** deep emerald `#047857`, white text, `px-5 py-2.5`; hover deepens to `#065f46`.
- **Secondary:** sky blue (`sky-700`) with white text; hover uses `sky-800`.
- **Outline:** transparent fill, one-pixel deep-emerald border/text, pale mint hover fill.
- **Ghost:** deep-green text with a pale surface hover.
- **Sizes:** `sm` has a 40px minimum height; `md` uses default padding; `lg` uses `px-8 py-3.5` and larger text.
- **Interaction:** shared component disables while loading, shows a current-color spinner, and applies a slight active scale. Global `:focus-visible` uses a 2px deep-emerald outline with 3px offset. Call-site classes frequently replace variant colors, radius, height, and shadows.

### Cards / Containers
- **Corner Style:** usually 16px–24px, with larger custom radii common on the home hero, empty states, dashboards, and modal shells.
- **Background:** white, pale mint, or translucent white; admin cards instead use translucent near-black.
- **Shadow Strategy:** soft elevation with occasional emerald glow; some cards use borders and shadows together.
- **Internal Padding:** commonly 16px–48px depending on the screen and card prominence.
- Global `.soft-card` and `.glass-nature` utilities exist, but many screens define their own card classes instead.

### Inputs / Fields
- **Style:** shared `Input` uses a white fill, one-pixel `surface-300` border, 12px radius, `px-4 py-3`, and `surface-900` text. Placeholder text uses `surface-500`.
- **Focus:** 2px deep-emerald ring with offset; errors use red border/ring, `aria-invalid`, and an associated alert description.
- **Disabled:** reduced opacity and disabled cursor in the shared component.
- **Inconsistency:** many forms use raw `<input>` elements and local labels/backgrounds, so the shared 16px mobile / 14px desktop typography, borders, and error behavior are not universal.

### Navigation
- **Public:** sticky, translucent white top navigation with brand mark, language switcher, account links, and a collapsible mobile menu.
- **Teacher:** fixed white 18rem sidebar at desktop; at mobile, a left drawer with overlay, close control, scroll lock, Escape handling, focus return, active route styling, profile, language switcher, and logout.
- **Administrator:** reuses the public Navbar above a dark dashboard; its tabs are locally styled and labeled in English.

### Tables and Lists
- Student and class collections are card grids with local status badges and actions. The administrator user list is a semantic table inside a horizontal overflow container. There is no shared table, pagination, or data-list component, so density and responsive behavior differ by route.

### Dialogs and Pickers
- Class, student, add-student, session, and confirmation flows use custom Framer Motion overlays. They vary in width, radius, padding, and internal steps; backdrops commonly close the dialog when clicked. Most do not expose dialog semantics or a consistent focus-trap/return pattern.
- `CustomDatePicker` is a compact custom calendar popover with previous/next month and selectable day buttons. Date fields in other forms may use native or raw input controls.

### Status and Feedback
- Status chips and dropdowns use color to distinguish active, inactive, completed, cancelled, attendance, and enrollment states; option labels and colors are defined locally.
- Toast notifications appear at the top center with a white translucent surface, icon, and success/error colors, then auto-dismiss after three seconds. Some workflows use inline errors, while others only write errors to the console.

## Do's and Don'ts

These notes document the incumbent implementation and its known variation; they are not a claim that every current screen follows one unified standard.

### Do:
- **Do** use the declared emerald/mint surface tokens and the Inter / Be Vietnam Pro stacks when matching the light public and teacher interface.
- **Do** match the shared Button and Input defaults when the target screen uses those components: 12px radius, pale borders, clear green focus, and the documented variants.
- **Do** use responsive Tailwind utilities and preserve the teacher shell's mobile drawer / desktop sidebar behavior when extending teacher routes.
- **Do** preserve the administrator area's dark treatment when extending that existing surface unless a separately authorized redesign unifies it.
- **Do** treat token values above as code-derived and treat descriptive names such as “Willow Study” as language confirmed for this documentation, not as evidence of a formal external brand standard.

### Don't:
- **Don't** assume the admin dark palette is interchangeable with the light teacher palette; the difference is an existing surface-level inconsistency.
- **Don't** treat `surface-50` through `surface-950` as a mathematically even or consistently tinted ramp; the declared values change character and lightness nonlinearly.
- **Don't** assume shared component styles are enforced at call sites; pages often replace color, sizing, radius, shadow, and typography.
- **Don't** rely on hover alone to reveal an action; some list actions are opacity-hidden until hover.
- **Don't** assume all dialogs, raw form fields, language strings, or reduced-motion behavior follow the shared accessible patterns; implementation coverage is uneven.
