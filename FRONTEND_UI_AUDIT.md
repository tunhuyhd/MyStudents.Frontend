# MyStudents.Frontend — Frontend UI Audit

**Audit date:** 2026-10-16  
**Scope:** Whole frontend in src/app and src/components, including teacher, admin, shared UI, auth, profile, responsive behavior, loading/error/success states, and existing tests.  
**Accessibility target:** WCAG 2.2 Level AA, confirmed by the product owner in this conversation.  
**Design constraint:** Preserve the existing dark admin visual direction. Recommendations address semantic tokens, accessible states and responsive behavior; they do not propose changing admin to the teacher light theme.  
**Method:** Source/document review, existing teacher Chromium captures, npm test, TypeScript check, full ESLint run, and Impeccable detector. No source or existing design/product document was changed.

## Executive summary

The application has an established light teacher workspace and a distinct dark admin area. The teacher sidebar and student list show useful accessibility patterns, and core CRUD forms generally retain their React state when API saves fail. The audit nevertheless found code-level WCAG issues in teacher text contrast, form-label association, document language, and admin subject actions. Several core API failures are not surfaced, and one dashboard metric does not represent the product-wide total implied by its label.

| Dimension | Score / 4 | Main evidence |
|---|---:|---|
| Accessibility | 2 | Confirmed contrast and language issues; labels and several custom controls need accessible semantics. |
| Performance | 2 | Global pointer-following blur and an animated all-pairs canvas loop; actual cost not profiled. |
| Responsive design | 2 | Teacher shell adapts; admin table relies on horizontal overflow and tablet/narrow-layout behavior is not fully tested. |
| Theming | 2 | Light tokens exist; admin dark colors and shared component overrides remain local. |
| Implementation integrity | 2 | Data-scope bug and silent error paths coexist with stronger student-list handling. |
| **Total** | **10/20 — Acceptable** | **Significant remediation remains for WCAG AA and reliable record workflows.** |

This score is an implementation review, not a conformance certification. No browser accessibility tree, automated WCAG scanner, screen reader, touch device, or live admin page was available in this audit run.

**Severity counts:** P0: 0 · P1: 7 · P2: 8. No issue was rated P0 because the source review did not prove that a primary workflow is impossible to complete for all users.

## Findings confirmed from code

### A11y-01 — Emerald text fails normal-text contrast in the light teacher theme

- **Severity / category:** P1 · Accessibility
- **Affected page/component/file:** Teacher student list section badge; src/app/teacher/students/page.tsx:165–167. The same palette is used for small labels elsewhere in teacher pages.
- **Evidence:** The badge combines text-brand-primary with bg-brand-primary/10. The token is #10b981. On the white canvas, the 10% background tint composites to approximately #e7f8f2; the foreground/background contrast is approximately **2.31:1**. This is below WCAG 2.2 AA 1.4.3’s 4.5:1 requirement for normal text. The label is 10px, so it does not qualify as large text. By comparison, #047857 on white is about 5.48:1.
- **User impact:** Users with low vision or reduced contrast sensitivity may not read the badge text; the same color choice can make state/category labels hard to scan.
- **Suggested fix:** Use the deep emerald action token for small text on light surfaces, or choose a darker semantic text token; retain bright emerald for larger graphics/decorative emphasis. Measure every foreground/background pair, including tinted surfaces and hover/focus states.
- **Verification status:** **Confirmed by source values and contrast calculation.** Recheck rendered combinations after remediation, especially surfaces over the willow background.

### A11y-02 — Visible form labels are not programmatically associated with controls

- **Severity / category:** P1 · Accessibility
- **Affected page/component/file:** Class form src/components/teacher/ClassModal.tsx:245–267; student form src/components/teacher/StudentModal.tsx:356–392; session form src/components/teacher/RecordSessionModal.tsx:283–323.
- **Evidence:** These forms render label elements as siblings of raw inputs, without htmlFor/id linkage and without wrapping the associated input. The class form does this for name/code and the student form does this for name/email fields. RecordSessionModal’s visible date/time labels are similarly separate from their inputs.
- **User impact:** Assistive technology may not associate the visible label with the field; users can lose context when moving through multi-field student and scheduling forms. Placeholder text is not a durable substitute for a visible, programmatically linked label.
- **Suggested fix:** Give each field a stable id and matching htmlFor, or wrap the control in its label. Keep required state and field errors programmatically associated; use the shared Input component where its behavior fits.
- **WCAG:** 1.3.1 Info and Relationships; 3.3.2 Labels or Instructions.
- **Verification status:** **Confirmed in JSX structure.** Verify the accessibility tree and screen-reader announcements after remediation.

### A11y-03 — Admin subject actions disappear when reached by keyboard

- **Severity / category:** P1 · Accessibility, usability
- **Affected page/component/file:** Subject management cards, src/components/admin/SubjectManagement.tsx:127–138.
- **Evidence:** The edit/delete action wrapper starts with opacity-0 and becomes visible only under group-hover:opacity-100. Unlike the student card action group, it has no group-focus-within visibility rule. Its child buttons are icon-only and have no aria-label or visible text.
- **User impact:** Keyboard focus can enter controls whose entire parent remains transparent, leaving the user unable to see the focused action. Screen readers may announce buttons without meaningful names. Touch users may also lack a reliable hover state.
- **Suggested fix:** Keep actions visible or reveal them on both hover and focus-within; add specific accessible names such as “Edit [subject]” and “Delete [subject]”. Keep the existing dark palette and use an in-app destructive confirmation.
- **WCAG:** 2.4.7 Focus Visible; 4.1.2 Name, Role, Value.
- **Verification status:** **Confirmed from CSS classes and button markup.** Keyboard/screen-reader and touch verification remains necessary.

### A11y-04 — Root language is fixed to English while Vietnamese is the default locale

- **Severity / category:** P1 · Accessibility, i18n
- **Affected page/component/file:** src/app/layout.tsx:31–40; src/context/LanguageContext.tsx:31–45.
- **Evidence:** The root html element declares lang="en". LanguageContext initializes as vi, then reads/writes a persisted vi/en preference in localStorage. PRODUCT.md identifies Vietnamese as the default interface language.
- **User impact:** A Vietnamese page can be announced with English pronunciation and language rules; the document language also remains wrong after switching locale.
- **Suggested fix:** Synchronize the document lang attribute with the active locale in a hydration-safe way, and verify both initial render and persisted locale changes.
- **WCAG:** 3.1.1 Language of Page (Level A); 3.1.2 Language of Parts where mixed-language content occurs.
- **Verification status:** **Confirmed source mismatch.** Verify rendered HTML and screen-reader pronunciation in both locales.

### A11y-05 — Toast status is not exposed as a live status message

- **Severity / category:** P1 · Accessibility
- **Affected page/component/file:** src/components/ui/Toast.tsx:26–37, 58–63; used by teacher dashboard/class detail and AuthContext logout feedback.
- **Evidence:** The toast is inserted as a motion div without role=status, role=alert, aria-live, or an equivalent live-region wrapper. Its close button contains an icon but has no accessible name. It auto-dismisses on a three-second timer at lines 13–21.
- **User impact:** A screen-reader user may not be told that a save/logout/error message appeared; the unlabeled close control has no reliable spoken name. Brief errors can disappear before the user finishes reading.
- **Suggested fix:** Use role=status for non-urgent success and alert for urgent errors; name the close button; allow important errors to persist until dismissed and consider pausing the timer while hovered/focused.
- **WCAG:** 4.1.3 Status Messages (AA); 4.1.2 Name, Role, Value.
- **Verification status:** **Missing semantics confirmed in source.** Actual announcement behavior and timing need NVDA/VoiceOver testing.

### DATA-01 — Class dashboard metric is calculated from only the current page

- **Severity / category:** P1 · Functional, usability
- **Affected page/component/file:** src/app/teacher/page.tsx:62, 84–103, 198–200.
- **Evidence:** pageSize is 9; fetchClasses stores current-page res.data.items in classes and receives totalCount separately. The “Total Impact” value sums studentCount over classes, so it is a subtotal for the currently loaded page, not an all-classes total. UI_UX_CRITIQUE.md already identified this; this audit confirms the page-size and data-flow evidence.
- **User impact:** The value may change when the teacher changes page, filter, or search while looking like a global total.
- **Suggested fix:** Confirm whether the intended metric is unique students or class enrollments. Fetch an authoritative aggregate with that defined scope, or label the displayed value as the current result/page subtotal.
- **Verification status:** **Confirmed by source.** Verify with more than nine classes, multiple pages, and filtered results.

### DATA-02 — Load and mutation failures have inconsistent user feedback and recovery

- **Severity / category:** P1 · Functional, usability
- **Affected page/component/file:** Teacher dashboard src/app/teacher/page.tsx:84–103, 147–159; add-student modal src/components/teacher/AddStudentToClassModal.tsx:27–48; class detail src/app/teacher/class/[id]/page.tsx:146–160, 190–216; admin src/app/admin/page.tsx:42–55, 68–96; subject management src/components/admin/SubjectManagement.tsx:19–25, 34–64.
- **Evidence:** Teacher fetchClasses catches and logs, then sets loading false without an error state; the class list can fall into its no-classes branch. AddStudentToClassModal fetch/add failures only log to console. Admin fetch, role/status updates, and subject fetch/save/delete also catch only to console. Class/student save forms are better: ClassModal sets an error popup, StudentModal sets an inline error and retains formData. Admin SubjectManagement resets formData only on success, so entered values remain after failure, but it does not tell the user the save failed.
- **User impact:** Users may mistake failed loads for empty data and may repeat or abandon failed mutations. Preserved input helps recovery only when the user can tell a failure occurred.
- **Suggested fix:** Make loading, empty, error, and retry states distinct. Show mutation failure beside its row/form, keep entered values, and give a clear retry path. Reuse the stronger student-list pattern at src/app/teacher/students/page.tsx:63–89, 234–243.
- **Verification status:** **Confirmed source error paths.** Simulate 401, timeout, and 5xx responses for each endpoint; verify visible feedback and retained form values.

### DATA-03 — Attendance failure rolls back without telling the teacher

- **Severity / category:** P1 · Functional, usability
- **Affected page/component/file:** src/components/teacher/RecordSessionModal.tsx:170–194.
- **Evidence:** handleUpdateStatus optimistically updates attendances. On request failure it logs the error and restores oldAttendances, but does not set user-visible error state.
- **User impact:** The status can appear to change and then silently revert; the teacher may believe attendance was recorded when it was not.
- **Suggested fix:** Announce the failed update at the affected student row, explain that the status was restored, and allow retry without discarding other attendance work.
- **Verification status:** **Confirmed from catch/rollback code.** Test a failed attendance mutation in the running app.

### FORM-01 — Custom form fields rely on local patterns with uneven error association

- **Severity / category:** P2 · Accessibility, usability
- **Affected page/component/file:** Shared field src/components/ui/Input.tsx:21–42; teacher raw inputs in ClassModal.tsx and StudentModal.tsx; admin subject form src/components/admin/SubjectManagement.tsx:91–106.
- **Evidence:** Shared Input associates error text with aria-describedby, sets aria-invalid and renders role=alert. StudentModal performs required-name/email checks and keeps values after an API error. ClassModal also retains state and exposes an error popup. By contrast, admin subject saves, add-student loading/add failures, and class detail mutations do not use that shared inline error pattern. Some raw fields use outline-none with only a low-alpha border change on focus.
- **User impact:** Validation and error discoverability vary by flow; users get more reliable guidance in student/class forms than in subject enrollment and admin CRUD. Raw fields may expose a weaker focus cue than the shared Input.
- **Suggested fix:** Reuse the shared validation contract or match its semantics: stable field ids/labels, aria-invalid, associated error text, and visible focus. Do not clear a form after a failed save.
- **Verification status:** **Pattern differences confirmed in source.** Whether the raw focus cue remains clearly visible after CSS cascade and how errors are announced require keyboard/accessibility-tree checks.

## Responsive, performance, and theme findings

### RESP-01 — Admin user table has only a horizontal-scroll fallback

- **Severity / category:** P2 · Responsive, usability
- **Affected page/component/file:** src/app/admin/page.tsx:161–171.
- **Evidence:** The five-column user table is wrapped in overflow-x-auto; no compact row/card alternative is defined in the route.
- **User impact:** On narrow screens, admins may need to pan to compare identity, email, role, status and role actions; truncated names/email further reduce scanability.
- **Suggested fix:** Test whether horizontal scrolling is adequate for admin tasks. If not, provide a mobile record layout or keep identity/status/actions visible with a clear details affordance.
- **Verification status:** **Overflow wrapper confirmed in source; clipping and task difficulty not confirmed at runtime.** Test 320px, 390px, tablet width, landscape, and 200% zoom with long names/emails.

### PERF-01 — Decorative motion does continuous work on interaction/page routes

- **Severity / category:** P2 · Performance, accessibility
- **Affected page/component/file:** Global template src/app/template.tsx:6–12; src/components/NatureCursor.tsx:6–31; admin canvas src/components/ZodiacBackground.tsx:8–104; admin routes src/app/admin/page.tsx:101–104 and src/app/admin/login/page.tsx:42–44.
- **Evidence:** NatureCursor is mounted from the root template, calls React setState on every mousemove, and renders a 300×300px blurred Framer Motion layer. ZodiacBackground runs requestAnimationFrame continuously; it draws every particle and checks every pair for proximity (nested particle loops), with shadowBlur. Particle count scales as viewport area / 7000. The global CSS reduced-motion rule does not itself control Framer Motion values.
- **User impact:** These effects may consume CPU/GPU and trigger repeated React renders on lower-powered devices; motion may remain when a user requests reduced motion. No performance trace proves a user-visible slowdown.
- **Suggested fix:** Profile first. Gate decorative JS motion on prefers-reduced-motion and visibility; reduce/restructure pair checks or update only when needed; avoid React state work for pointer movement if a motion value can handle it. Preserve the dark starfield direction with a less costly fallback.
- **Verification status:** **Algorithm and mounts confirmed in source; performance impact unmeasured.** Profile CPU/frame time on a low-end mobile profile and desktop; test reduced-motion preference.

### PERF-02 — Avatar images bypass Next image optimization

- **Severity / category:** P2 · Performance
- **Affected page/component/file:** src/components/Navbar.tsx:64–68; src/components/teacher/TeacherSidebar.tsx:168–172; src/app/me/page.tsx:185–188, 427–430.
- **Evidence:** These avatar/profile images use raw img tags. Full lint reports Next.js no-img-element warnings for these locations.
- **User impact:** Depending on source image size and caching, avatars can transfer more bytes or load later than needed. Current LCP/bandwidth impact is unknown.
- **Suggested fix:** Measure the avatar payload and loading behavior; use next/image with the required remote configuration or define a documented exception for user-uploaded URLs and the full-screen image viewer.
- **Verification status:** **Source usage and lint warnings confirmed; runtime performance impact not measured.**

### THEME-01 — Shared controls are light-first; dark admin depends on local overrides

- **Severity / category:** P2 · Theming, implementation consistency
- **Affected page/component/file:** Tokens src/app/globals.css:8–35; shared Button src/components/ui/Button.tsx:17–45; shared Input src/components/ui/Input.tsx:21–42; admin overrides src/app/admin/page.tsx:101–119, 161 and src/components/admin/SubjectManagement.tsx:91–106.
- **Evidence:** Global tokens define the mint/light surfaces and emerald action colors. Shared Input defaults to white; admin pages apply literal near-black surfaces, alpha borders and local emerald classes. DESIGN.md records the admin palette as a separate incumbent branch, and the owner has explicitly chosen to preserve it.
- **User impact:** New or reused controls can bring light surfaces into the dark admin or omit its focus/error/loading treatment; repeated local overrides make behavior drift more likely.
- **Suggested fix:** Add semantic dark tokens/variants and explicit theme-aware shared control states while preserving the dark emerald/near-black appearance. Reuse the same state, size, focus, disabled and error contract across themes.
- **Verification status:** **Token and override split confirmed in source.** Compare each control state in both themes in a live browser; do not infer visual contrast from alpha classes alone.

### A11y-06 — Custom calendar has unnamed month controls and no calendar semantics

- **Severity / category:** P2 · Accessibility, usability
- **Affected page/component/file:** src/components/ui/CustomDatePicker.tsx:81–143; used in teacher scheduling/student flows.
- **Evidence:** Previous/next month buttons contain only Chevron icons and no accessible names. The weekday headings and calendar container are generic divs; day buttons expose only a day number and no programmatic selected/current state. Day and month controls are 32×32px.
- **User impact:** Screen readers may announce month navigation as unnamed buttons and dates without enough context; keyboard users must tab through many individual days. 32px targets exceed WCAG 2.2 AA’s 24px minimum but are smaller than the commonly recommended 44px touch target.
- **Suggested fix:** Add accessible names and calendar/grid semantics, announce full dates and selected/today state, implement expected keyboard date navigation, and enlarge targets where layout permits.
- **WCAG:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard. Do not treat 32px alone as a WCAG 2.2 AA target-size failure.
- **Verification status:** **Markup and dimensions confirmed in source.** Keyboard, touch and screen-reader operation require runtime checks.

### A11y-07 — Custom role dropdown does not expose its open state or menu semantics

- **Severity / category:** P2 · Accessibility
- **Affected page/component/file:** src/components/RoleDropdown.tsx:20–81; used in src/app/admin/page.tsx.
- **Evidence:** The trigger is a custom button that toggles a motion div of role buttons, without aria-expanded, aria-haspopup, aria-controls or menu/listbox semantics; no Escape key handler is present. Click-outside is implemented with mousedown.
- **User impact:** A screen reader does not get a programmatic indication that the role picker opened; keyboard users have no documented Escape/arrow-key behavior.
- **Suggested fix:** Use a native select where appropriate or implement a tested accessible listbox/menu pattern with expanded state, focus behavior, Escape handling and a clear accessible name tied to the user row.
- **Verification status:** **Missing state/semantics confirmed in source.** Verify keyboard sequence and screen-reader output at runtime.

## Existing findings, additional evidence, and non-findings

UI_UX_CRITIQUE.md previously called out the dashboard metric, silent API failures, Vietnamese copy, dialog semantics, admin hover-only actions, admin table overflow and theme drift. This audit retains those only where it adds exact source paths, WCAG mapping, error-state/form-retention evidence, or an explicit runtime verification plan; it does not repeat the earlier visual-density commentary as a separate defect.

- Impeccable detector scan of src/app and src/components: **77 advisory findings** (75 font-size, 2 color), no blockers. It reports 45 values at 10px, 24 at 11px and 6 at 9px. DESIGN.md describes labels in a 10–12px range, so the 69 findings at 10/11px match the documented incumbent convention and are not automatically defects. The six 9px values are below that documented range; legibility still depends on rendered use. Both #059669 color findings are close to the emerald palette but bypass tokens; this is token drift, not proof of contrast failure.
- Positive pattern: src/app/teacher/students/page.tsx has a visible list error/retry path, distinguishes no-results from error, exposes action labels, and uses status/error markup. Shared Input also has associated error text and aria-invalid.
- Positive pattern: teacher navigation in src/app/teacher/layout.tsx and src/components/teacher/TeacherSidebar.tsx includes skip link, aria-current, mobile drawer, Escape, scroll locking and focus return. Preserve this behavior.
- Positive pattern: public auth forms use required fields, labels through shared Input, and visible API errors; password reset includes client-side mismatch validation.
- WCAG 2.2 AA target size: the date picker’s 32px controls are smaller than ideal for touch but above criterion 2.5.8’s 24px minimum threshold. This is a usability recommendation, not a confirmed AA failure.
- Dark admin text uses emerald at partial opacity over translucent dark layers (for example src/app/admin/page.tsx:119, 167–171). Because the final canvas/panel compositing varies, no contrast failure is asserted without a rendered capture and contrast measurement.
- Existing visual fixtures at ../tmp/frontend-review/ show teacher dashboard only, with an empty list at desktop 1440×1000 and mobile 390×844. They do not establish admin, tablet, populated-list, 320px, zoom, or assistive-technology behavior.

## Validation performed

- npm test: **5/5 passed**. tests/api-client.test.mjs exercises API token refresh/retry behavior; it does not test React components or UI workflows.
- npx tsc --noEmit --incremental false: **passed**.
- npm run lint: **exit 0, 0 errors, 129 warnings**. Output includes warnings in bundled Impeccable scripts/assets plus application warnings. Relevant source warnings include missing effect dependencies in src/app/teacher/class/[id]/page.tsx:152,160 and raw img use noted under PERF-02. Warnings should not be treated as user-facing failures without contextual verification.
- Impeccable detector: **77 advisories; no blocker** as summarized above.
- Not performed: live browser audit, axe/WCAG scanner, keyboard-only run, screen reader, touch-device run, admin screenshot, performance trace, API failure injection, build. The existing frontend review reports a previous build pass; this audit does not claim a fresh build.

## Runtime verification plan

The following require a running application and should remain unconfirmed until checked:

1. **Accessibility / WCAG 2.2 AA:** inspect focus order/visibility through teacher forms, custom dropdowns, modal open/close, admin role/status controls; test NVDA or VoiceOver; run axe or equivalent and manually measure text/non-text contrast in rendered light and dark surfaces.
2. **Responsive:** capture teacher and admin at 1440px desktop, 768px tablet, 390px phone and 320px narrow phone; repeat at 200% zoom and landscape. Include long names/emails, many rows, empty results and open dialogs.
3. **API states and input retention:** inject offline/timeout, 401 and 5xx on class list/delete, add-student, attendance, admin users/roles and subject CRUD. Check distinct loading/empty/error/success states, retry, no duplicate mutation, and preserved form input.
4. **Performance and motion:** profile the root cursor and admin canvas on a low-end mobile CPU profile, during route changes and tab backgrounding; enable prefers-reduced-motion and verify all JS/CSS effects.
5. **Tablet/admin behavior:** verify horizontal table scroll is discoverable and still supports role/status changes without losing row context.

## Prioritized remediation plan

1. **P1 — Meet core WCAG AA requirements:** darken small emerald text on light surfaces; associate form labels; expose visible keyboard focus and accessible names/state for subject and role controls; synchronize document language; announce toast messages.
2. **P1 — Protect data correctness and workflow recovery:** fix dashboard metric scope; add visible load/mutation errors and retry for teacher/admin; show attendance rollback errors; preserve entered values.
3. **P2 — Complete custom widget semantics:** improve date picker naming, selected state and keyboard interaction; test dialog focus lifecycle against the accessible teacher drawer pattern.
4. **P2 — Validate responsive admin:** run the viewport/zoom matrix and choose a mobile table treatment based on whether horizontal scrolling blocks real tasks.
5. **P2 — Reduce measurable performance risk:** profile global pointer and canvas effects; optimize or gate them based on evidence; assess avatar transfer strategy.
6. **P2 — Preserve dark admin while unifying behavior:** add semantic dark variants for shared controls and verify focus, error, loading, disabled and status colors in both themes.
7. **Validation gate — add UI coverage:** add focused component/integration tests for locale labels, empty/error/retry states, failed save retention, attendance rollback feedback, keyboard action visibility and dark/light variants. Current 5 API-client tests do not cover these interfaces.
8. **Final quality pass:** after remediation, run the audit and a bounded desktop/tablet/mobile browser pass, then use $impeccable polish before release.
