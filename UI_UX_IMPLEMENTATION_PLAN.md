# MyStudents.Frontend UI/UX Implementation Plan

**Status:** Proposed work plan; no implementation changes made.  
**Scope:** Teacher light theme, admin dark theme, shared UI, and the tests needed to verify the listed work.  
**Accessibility target:** WCAG 2.2 Level AA, recorded in `PRODUCT.md` and referenced by `DESIGN.md`. This is a target, not a statement of current conformance.  
**Product constraints:** Preserve existing business behavior, API contracts, authentication, authorization, and route structure. Keep teacher light and admin dark. Make targeted fixes only where findings support them.

## Planning rules

- Findings repeated in `UI_UX_CRITIQUE.md`, the project audit, or the parent-directory `FRONTEND_UI_AUDIT.md` are consolidated below rather than scheduled multiple times.
- Confirmed P1 correctness, usability, and accessibility issues come before polish and redesign.
- A source finding that needs browser/device/API verification is explicitly gated; do not redesign based on an unverified impact.
- Each batch should be independently reviewable and testable. Avoid unrelated refactors and do not treat pre-existing lint warnings as work items unless a touched line causes a relevant regression.
- Existing successful patterns (student list retry/error handling, form value retention, teacher drawer keyboard handling) should be reused where they fit.

## Functional UX and accessibility fixes

### F1 — Correct student-list Vietnamese copy

- **Priority/type:** P1 · Functional UX / localization.
- **Consolidated findings:** Corrupted question-mark strings in the Vietnamese student-management catalog (critique T-03; audit finding for `vi.json`).
- **Affected files:** `src/locales/vi.json`; focused locale test file under `tests/` (add only if no suitable test exists).
- **Exact scope:** Replace malformed user-facing Vietnamese values for student search, filters, loading/retry, empty/results, pagination and actions with reviewed Vietnamese copy. Do not alter keys, English strings, API behavior, filtering semantics or page layout.
- **Dependencies:** None.
- **Acceptance criteria:** Relevant Vietnamese values render as valid readable text; keys and placeholders remain compatible with their call sites; changing locale still selects the corresponding English values; a regression check catches corrupted strings in this scope.
- **Regression risks:** Incorrect placeholder/format-token changes; copy that overflows compact controls; accidental modification of unrelated locale entries.
- **Verification:** Validate JSON; run focused locale test and project test suite; inspect student list in vi/en at narrow and desktop widths for truncation.

### F2 — Make dashboard impact metric scope truthful

- **Priority/type:** P1 · Functional correctness / usability.
- **Consolidated findings:** Teacher dashboard current-page subtotal presented as overall “Total Impact” (critique T-01 and both audits).
- **Affected files:** `src/app/teacher/page.tsx`; related API type/service only if an authoritative aggregate already exists; focused dashboard test/fixture.
- **Exact scope:** Determine and document what the displayed metric counts (unique students vs enrollments). Use an existing authoritative all-record aggregate if available; otherwise relabel the value to state its actual page/filter scope. Do not change endpoint contracts or pagination behavior without evidence that the existing API exposes a compatible aggregate.
- **Dependencies:** Product meaning of the metric must be resolved from existing data semantics; if code cannot establish it, keep the calculation truthful to its known scope and flag unresolved meaning rather than inventing an aggregate.
- **Acceptance criteria:** A dataset spanning multiple pages cannot make a page subtotal appear to be a global total; labels and filtering behavior match the calculation; pagination and class loading remain unchanged.
- **Regression risks:** Counting enrollments as people, changing filter scope, or introducing an unbounded extra fetch/API request.
- **Verification:** Unit/component test with more than nine classes and different student counts across pages; compare displayed value/label as pagination and filters change; test normal API response path.

### F3 — Associate labels and descriptions in teacher forms

- **Priority/type:** P1 · Accessibility / functional UX.
- **Consolidated findings:** Visible labels not associated with fields (both audits); uneven raw-field error associations (audit).
- **Affected files:** `src/components/teacher/ClassModal.tsx`, `src/components/teacher/StudentModal.tsx`, `src/components/teacher/RecordSessionModal.tsx`; focused component tests.
- **Exact scope:** Add unique stable input IDs and matching `htmlFor`, or wrap each control in its label. Associate existing help/error text with the correct field using `aria-describedby` and `aria-invalid` where validation applies. Preserve field names, validation rules, form state, request payloads and modal flow.
- **Dependencies:** None; use existing shared `Input` behavior only where it does not change visual or validation behavior.
- **Acceptance criteria:** Every visible field label resolves to its input in the accessibility tree; existing validation and submit payloads remain identical; error/help text is exposed with the relevant field.
- **Regression risks:** Duplicate IDs in repeated fields; changing controlled input behavior or native validation; layout changes if shared components are substituted wholesale.
- **Verification:** Component tests assert accessible names and error descriptions; keyboard and screen-reader smoke test all three forms; compare submitted payload and validation cases before/after.

### F4 — Synchronize root language with selected locale

- **Priority/type:** P1 · Accessibility / localization.
- **Consolidated findings:** Fixed English document language while Vietnamese is default (critique C-02; audits A11y-04).
- **Affected files:** `src/app/layout.tsx`, `src/context/LanguageContext.tsx` (or actual context path if project structure differs), locale-related tests.
- **Exact scope:** Set the document `lang` to the active vi/en locale on initial load and locale change, including persisted preference. Keep locale storage key, translation behavior and routes unchanged.
- **Dependencies:** Confirm hydration-safe way to apply the current client locale within the existing Next.js layout/context arrangement.
- **Acceptance criteria:** First render and subsequent language switch expose the matching root language; no hydration warning; stored preference is respected; translations remain unchanged.
- **Regression risks:** Server/client language mismatch, flash of incorrect language metadata, hydration errors, touching unrelated auth state.
- **Verification:** Test default locale, stored en/vi locale and runtime switching; inspect rendered `<html lang>` and console for hydration warnings; manually verify screen-reader pronunciation sample.

### F5 — Give toast feedback accessible semantics and controls

- **Priority/type:** P1 · Accessibility / feedback UX.
- **Consolidated findings:** Toast lacks live-region semantics, close name and sufficient error persistence (critique C-04; audits A11y-05).
- **Affected files:** `src/components/ui/Toast.tsx`; toast consumers only if message urgency/persistence cannot be represented by existing props; focused component tests.
- **Exact scope:** Expose success/info feedback as a polite status and urgent failures as an appropriate alert; name the close control; provide a sensible reading/dismissal policy for important errors. Preserve the existing toast API where possible and keep appearance compatible with both themes.
- **Dependencies:** Inventory current toast callers and props before extending the API; avoid adding a new global notification framework.
- **Acceptance criteria:** Toast text is announced when inserted; close control has a localized accessible name; important errors do not disappear before a user can reasonably act; existing call sites still compile and render.
- **Regression risks:** Repeated live-region announcements; assertive alerts interrupting speech; toast covering controls at 320px; changing timing expected by callers.
- **Verification:** Component tests for roles/names/timing; screen-reader smoke test; test long messages, repeated messages, 320px viewport and both theme contexts.

### F6 — Make admin subject actions discoverable and named

- **Priority/type:** P1 · Accessibility / admin usability.
- **Consolidated findings:** Hover-only icon actions are inaccessible to keyboard/touch and unnamed; critique A-02 and audits A11y-03.
- **Affected files:** `src/components/admin/SubjectManagement.tsx`; locale files for action names if no reusable keys exist; focused component tests.
- **Exact scope:** Keep actions visible or reveal them on keyboard focus as well as pointer hover; provide localized action names that identify the subject; retain dark visual direction and current edit/delete behavior. Native `confirm()` replacement is not included unless a current interaction test shows the dialog blocks the workflow; it can be a separate targeted follow-up.
- **Dependencies:** Existing localization mechanism for Vietnamese and English.
- **Acceptance criteria:** Keyboard focus makes each action visible; accessibility tree distinguishes edit/delete and identifies the subject; touch users can discover actions without hover; action still invokes the same mutation.
- **Regression risks:** Card layout changes, action overlap at narrow widths, duplicate or stale accessible names after editing a subject.
- **Verification:** Test accessible names and visibility classes; keyboard-tab through all subject cards, activate edit/delete, test touch-sized viewport and vi/en labels.

### F7 — Distinguish failed loads from empty data and add recovery

- **Priority/type:** P1 · Functional UX / data confidence.
- **Consolidated findings:** Silent teacher/admin load errors and empty-state confusion (critique T-02/A-01 and audits DATA-02).
- **Affected files:** `src/app/teacher/page.tsx`, `src/app/admin/page.tsx`, `src/app/teacher/class/[id]/page.tsx` only for confirmed silent load paths; focused page tests.
- **Exact scope:** Represent loading, loaded-empty, loaded-with-data and failed states distinctly for the affected requests; show a localized retry action. Do not change endpoint, auth/role checks, route structure, successful rendering or sort/filter behavior. Preserve last-known data only where the current state model already has it safely.
- **Dependencies:** Identify each request independently so a partial admin failure does not hide successful sections; use the existing student-list error/retry pattern where compatible.
- **Acceptance criteria:** A rejected request never renders as a successful empty result; user sees which section failed and can retry; real empty and populated states remain unchanged; unauthorized responses keep existing authorization behavior.
- **Regression risks:** Treating 401/403 as transient, duplicate requests on rerender, losing already-loaded data, disrupting pagination.
- **Verification:** Mock success-empty, success-populated, 401/403, timeout and 5xx; verify state transitions, retry count, authorization redirects and no duplicate fetch loop.

### F8 — Surface mutation failures and preserve retryable user intent

- **Priority/type:** P1 · Functional UX / data reliability.
- **Consolidated findings:** Failed class delete, add-to-class, attendance rollback, admin role/status and subject mutations do not reliably inform users (critique T-02/T-05/A-01 and audits DATA-02/DATA-03).
- **Affected files:** `src/app/teacher/page.tsx`; `src/components/teacher/AddStudentToClassModal.tsx`; `src/components/teacher/RecordSessionModal.tsx`; `src/app/admin/page.tsx`; `src/components/admin/SubjectManagement.tsx`; focused mutation tests.
- **Exact scope:** For each confirmed silent catch, show localized error and retry/recovery near the affected control. Preserve form values, selected student, intended attendance or subject input after failure. Keep attendance rollback semantics, endpoint payloads, role authorization, and successful mutation behavior unchanged. Add loading/duplicate-submit protection only where not already present.
- **Dependencies:** F7 error-state conventions; F5 live announcement behavior where a toast is used. Keep this batch limited to mutation paths, not a broad data-layer rewrite.
- **Acceptance criteria:** Rejected mutation never appears successful; previous persisted state remains accurate; user's intended values/selection remain recoverable; retry performs one request and successful feedback follows server confirmation.
- **Regression risks:** Duplicate mutations, stale optimistic state, accidental permission changes, modal closing and losing data, inaccurate success messages.
- **Verification:** Mock rejection then retry success for each mutation; assert API payload and call count; verify rollback plus visible error; test 401/403 separately and ensure existing authorization handling.

### F9 — Implement accessible dialog semantics and focus lifecycle

- **Priority/type:** P1 · Accessibility; runtime focus failure must be confirmed before changing focus behavior.
- **Consolidated findings:** Custom overlays lack declared dialog semantics and have no shared focus contract (critique T-04; audit A8/dialog verification queue).
- **Affected files:** `src/components/teacher/ClassModal.tsx`, `StudentModal.tsx`, `AddStudentToClassModal.tsx`, `RecordSessionModal.tsx`, `src/components/ui/ConfirmModal.tsx`; existing dialog primitive/dependency only if already available; dialog tests.
- **Exact scope:** Add accessible dialog name/role/modal state to the custom dialogs and verify/fix initial focus, Tab containment, background interaction, Escape policy and focus restoration. Preserve each dialog's current content, submit/cancel behavior and theme. Do not add/replace libraries without first checking existing dependencies and Next.js guidance.
- **Dependencies:** F3 labels for dialog field naming; keyboard baseline/runtime verification. Confirm whether an existing primitive already manages focus.
- **Acceptance criteria:** Screen readers identify each modal by name and modal context; keyboard focus enters and remains appropriately within it; closing returns focus to the opener; dirty-form close behavior does not silently discard data.
- **Regression risks:** Nested dialog traps, backdrop click closing during input, Escape closing unsaved forms, focus return to unmounted controls, mobile scroll locking.
- **Verification:** Automated component tests for role/name; keyboard-only open/tab/escape/close checks; screen-reader check; test dirty form, destructive confirmation and mobile viewport.

## Visual redesign and responsive adaptation

These batches do not change business logic. Runtime verification is a prerequisite where the current documents identify a risk rather than a confirmed user-facing failure.

### V1 — Correct confirmed teacher text contrast

- **Priority/type:** P1 · Visual accessibility.
- **Consolidated findings:** Emerald small text contrast below WCAG 2.2 AA 1.4.3 (critique palette concerns; audit A11y-01).
- **Affected files:** `src/app/globals.css` token definitions; `src/app/teacher/students/page.tsx` affected badge; any other source-confirmed use of the same text/fill pairing found by search.
- **Exact scope:** Separate decorative bright emerald from semantic small-text color; retain pale mint surfaces and overall teacher light identity. Do not globally replace brand color on large graphics.
- **Dependencies:** F3 does not block this change. Inventory token usages first to avoid contrast regressions elsewhere.
- **Acceptance criteria:** Normal text in affected states reaches at least 4.5:1; large text/non-text requirements are checked separately; teacher palette and status meaning remain clear.
- **Regression risks:** Changed hierarchy or brand appearance; a darker token on translucent/background images may still fail after compositing.
- **Verification:** Automated contrast checks plus manual computed-color measurement over rendered backgrounds, hover/focus/disabled states; snapshot review in teacher light theme.

### V2 — Validate admin table and toast at narrow widths before adaptation

- **Priority/type:** P2 · Responsive UX; investigate before redesign.
- **Consolidated findings:** Admin user table horizontal overflow (critique A-03; audits RESP-01) and toast minimum width concern (critique C-04).
- **Affected files:** First verification only: `src/app/admin/page.tsx`, `src/components/ui/Toast.tsx`; implementation files should be chosen only after measured impact.
- **Exact scope:** Test actual tasks and visibility at 320, 390, 768 CSS px and 200% zoom with populated rows/long names and long toast copy. Decide if horizontal scroll is discoverable and whether actions remain reachable. Do not preemptively replace table with cards.
- **Dependencies:** Runtime-capable local environment and representative mock data.
- **Acceptance criteria:** Record pass/fail evidence for accessing all user columns/actions and reading/dismissing toast without clipping; if a blocker is observed, define the smallest adaptation as a follow-up batch.
- **Regression risks:** Premature card layout can weaken table relationships/screen-reader semantics; hiding columns can hide role/status actions.
- **Verification:** Browser matrix and keyboard/touch pass; document observations in implementation PR/test artifact.

### V3 — Preserve dark admin while sharing semantic interaction states

- **Priority/type:** P2 · Visual system / accessibility consistency.
- **Consolidated findings:** Admin uses local colors and overrides while shared controls are light-first (critique C-01; audit THEME-01).
- **Affected files:** `src/app/globals.css`; `src/components/ui/Button.tsx`, `Input.tsx`; admin components/routes using those controls, selected after inventory.
- **Exact scope:** Add semantic light/dark variants for surface, text, border, focus, error, success, disabled and loading states; retain near-black/emerald admin direction and teacher mint/emerald direction. Do not undertake a wholesale component rewrite or change routing.
- **Dependencies:** Inventory current admin controls and agree a token mapping; runtime contrast data for dark surfaces from V4 verification below (or do as audit-first substep).
- **Acceptance criteria:** Shared controls have equivalent semantics and interaction states in both themes; theme-specific appearance is preserved; rendered text and focus indicators meet relevant WCAG thresholds.
- **Regression risks:** Low contrast on translucent panels, accidental light styles leaking into admin, CSS specificity regressions, snapshot churn.
- **Verification:** Component tests for semantic variants; rendered state matrix across both themes; computed contrast and keyboard focus review; compare screenshots before/after.

### V4 — Verify admin contrast, motion and reduced-motion behavior

- **Priority/type:** P2 · Accessibility/performance verification; optimize only from evidence.
- **Consolidated findings:** Admin text contrast not measured (critique A-05), global cursor/canvas motion and image optimization advisories (audit PERF-01/PERF-02), Framer Motion reduced-motion concern (critique C-03).
- **Affected files for review:** `src/app/admin/page.tsx`, `src/app/admin/login/page.tsx`, `src/app/template.tsx`, `src/components/NatureCursor.tsx`, `src/components/ZodiacBackground.tsx`, `src/app/globals.css`, image usages in `Navbar.tsx`, `TeacherSidebar.tsx`, `src/app/me/page.tsx`.
- **Exact scope:** First measure rendered admin text/state contrast, reduced-motion behavior, frame time/CPU under representative viewport and avatar image transfer. Do not optimize assets/animation until results identify a user-relevant issue. Preserve admin dark direction and existing motion character unless measurement and accessibility checks justify a targeted adjustment.
- **Dependencies:** Browser/device or emulation setup with reduced-motion toggle; V3 token work should use measured contrast results.
- **Acceptance criteria:** Evidence identifies pass/fail contrast pairs and measurable motion/image bottlenecks; any follow-on change names the affected path and does not reduce functionality. No conformance claim without full verification.
- **Regression risks:** Removing branded motion unnecessarily, animation mismatch between routes, changed image cropping, degrading perceived responsiveness.
- **Verification:** Browser contrast sampling; compare prefers-reduced-motion on/off; profile pointer movement and admin background at phone/desktop sizes; inspect network image sizes and LCP.

### V5 — Align remaining locale copy and review very small labels

- **Priority/type:** P2 · Visual/usability/i18n.
- **Consolidated findings:** Hard-coded Vietnamese sort labels and English admin copy (critique T-08/A-04); detector’s six 9px labels (audit T3).
- **Affected files:** `src/app/teacher/page.tsx`; `src/app/admin/page.tsx`, `src/app/admin/login/page.tsx`, `src/components/admin/SubjectManagement.tsx`; relevant `src/locales/vi.json`, `en.json`; six 9px occurrences located by detector at implementation time.
- **Exact scope:** Move user-facing strings into existing locale keys without changing business behavior. Inspect each 9px occurrence in context; increase useful text to documented minimum or explicitly retain decorative/nonessential exceptions. Do not blindly alter all 10/11px labels.
- **Dependencies:** F1 establishes locale edit/test pattern; confirm intended locale coverage for admin labels from existing app behavior.
- **Acceptance criteria:** No mixed-language hard-coded user copy in affected routes; vi/en values render; meaningful text is not below documented minimum without an explicit reason; no truncation regression.
- **Regression risks:** Translation-key drift, mismatched interpolation, overly long copy breaking dark admin layout, unnecessary enlargement of decorative labels.
- **Verification:** Locale key parity test, visual review of teacher/admin at mobile/desktop, inspect exact 9px occurrences and responsive wrapping.

### V6 — Review teacher dashboard density as a bounded redesign

- **Priority/type:** P2 · Visual design/usability.
- **Consolidated findings:** Teacher dashboard decorative density and long vertical empty-state layout (critique T-07).
- **Affected files:** `src/app/teacher/page.tsx`; related styles only if scoped to dashboard.
- **Exact scope:** Review title, primary create action, filters, class cards and empty state against tutor's frequent workflow. Reduce decoration/spacing only where it obstructs finding core actions. Preserve all controls, data, API calls and Willow Study light direction.
- **Dependencies:** Complete functional dashboard metric and error/empty-state work (F2, F7) first so the visual hierarchy reflects correct states.
- **Acceptance criteria:** Primary action and current result state are immediately discoverable; populated and empty views both remain clear at mobile and desktop; no action or information is removed.
- **Regression risks:** Removing useful context, making page feel generic, increasing density too much on mobile, obscuring loading/error states.
- **Verification:** Compare populated/empty/loading/error captures at 390px and 1440px; short task walkthrough for create, filter and open a class; retain before/after screenshots.

## Suggested implementation order

1. **Smallest safe first batch: F1 — Correct student-list Vietnamese copy.** It is isolated to locale values, has no API/auth/routing impact, fixes a confirmed P1 issue in the Vietnamese-default workflow, and can be verified with JSON/locale tests plus a quick visual check. If preferred by impact rather than smallest scope, F3 label associations is the next narrow accessibility batch.
2. F3 teacher form label associations, then F4 document language and F5 toast semantics.
3. F6 admin subject action visibility/names; preserve the dark theme.
4. F7 load failure/empty distinction, then F8 mutation feedback and input-intent retention.
5. F2 metric scope correctness; its acceptance depends on confirming metric meaning and available API data semantics.
6. F9 dialog semantics/focus lifecycle, with runtime keyboard/AT checks.
7. V1 confirmed contrast correction; then V2/V4 verification gates and remaining responsive/theme/copy work.
8. V6 bounded visual refinement after functional states are correct.

## Out of scope for these batches

- Authentication, authorization policy, token storage, API contract, business rules and routes, except for a narrowly proven defect and a separate review of that change.
- Broad code cleanup or unrelated lint-warning remediation.
- Replacing the dark admin theme or redesigning the product identity.
- Claiming WCAG 2.2 AA conformance based on code inspection or automated checks alone.
