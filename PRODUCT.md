# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: private tutors.** The user confirmed that MyStudents should prioritize teachers who provide private or supplementary lessons. The interface and workflows organize their classes, students, schedules, sessions, and attendance. The exact teaching setting, such as individual tutoring versus small groups, needs confirmation.
- **Secondary: administrators.** The code provides an administrator sign-in and tools to manage user roles, account status, and subjects. The administrator's organizational context and whether this is an operational or development role need confirmation.
- **Students are managed records, not a confirmed signed-in audience.** Teacher workflows store student and parent contact details, but the frontend does not establish a student-facing portal.

## Product Purpose

MyStudents is a web application for managing the work involved in private tutoring. Its current features let a tutor organize classes and their schedules, maintain student records, enroll students in classes, record lesson sessions, and track attendance.

The user-confirmed goal is to manage private-tutoring work. Which outcomes define success (for example, less administrative effort, more reliable scheduling, or better attendance records) and how they are measured need confirmation.

## Positioning

No verified market position, unique mechanism, or competitor distinction is documented. Do not make comparative or exclusivity claims until the product owner confirms them.

## Operating Context

- The product is a browser-based application. Teachers use a teacher workspace with a sidebar; administrators use a separate dashboard; public and account flows use a top navigation bar where applicable.
- Teacher workflow: sign in or register → create and schedule classes → manage student records → add students to classes → record sessions and attendance → maintain the teacher profile.
- Class setup supports subjects, online or offline delivery, dates, recurring weekly schedules, and an optional online meeting link. The class form checks for schedule conflicts.
- Student records include names and may include date of birth, gender, school, student and parent contact details, address, and notes.
- Administrator workflow: sign in → review users and roles → change a user's role or account status → manage subjects.
- Account recovery includes requesting a password-reset link, validating its token, and setting a new password. Profile workflows include editing profile details, changing a password, and uploading an avatar.
- Interface translations are provided in Vietnamese and English. The default interface language is Vietnamese and the selected preference is stored in browser local storage.
- The owner confirmed the current deployment is a learning/demo environment. The repository's deployment notes describe a free-tier frontend/backend setup and warn that it does not provide production-level uptime or backup guarantees.

## Capabilities and Constraints

**Verified capabilities**

- Create, edit, list, search, sort, filter, and delete classes, with server-backed pagination.
- Create, edit, search, filter, paginate, and delete student records; update student status; view student details.
- Add students to a class, update their class status, and remove them.
- Record class sessions and update attendance statuses.
- Manage user roles and account status, and create, edit, and delete subjects in the administrator area.
- Use responsive web layouts, including a mobile teacher navigation drawer.

**Technical and operational constraints**

- The frontend uses Next.js 16 App Router, React 19, TypeScript with strict checking, Tailwind CSS 4, Axios, Framer Motion, and Lucide icons.
- API requests use an origin configured by `NEXT_PUBLIC_API_URL` and append `/api/v1`. The README requires the backend CORS allowlist to include the frontend origin. The code has a development fallback API origin; deployed environments must supply the correct value.
- Access and refresh tokens are currently stored in browser local storage. Authentication and role checks in the frontend control navigation and presentation; the backend must enforce authorization for protected data and mutations.
- Inter and Be Vietnam Pro are loaded using `next/font/google`, so a clean build needs network access or an available font cache.
- GitHub Actions runs lint, API-client unit tests, TypeScript checking, and a production build.
- The data model includes student and parent personal/contact information. Retention, privacy, consent, and applicable regulatory requirements are not specified and need confirmation.
- Whether the demo constraints also apply to production, and any production hosting, availability, backup, or budget requirements, need confirmation.

## Product Principles

- Keep class, student, schedule, lesson, and attendance tasks connected within the tutor's workflow; these capabilities are represented as linked flows in the current application.
- Make the current record state and available actions clear when tutors manage classes and student records; these are the application's primary operational screens.
- Keep administrator controls focused on the user and subject management capabilities present in the current product.
- Preserve Vietnamese and English support in product-facing workflows; confirm the intended default and coverage before adding more locales.

These principles describe the existing product scope. They do not establish unverified service levels, business outcomes, or feature requirements.

## Accessibility & Inclusion

The product accessibility target is **WCAG 2.2 Level AA**. This is a remediation and verification target, not a claim that the current application conforms. The frontend has responsive layouts and some accessible names, live status messages, and keyboard handling, but coverage is uneven. Supported assistive-technology/browser combinations and any additional inclusion requirements still need confirmation.

## Evidence on Hand

- Product workflows and current implementation: `src/app/`, `src/components/`, `src/context/`, and `src/services/`.
- Supported interface languages: `src/locales/vi.json` and `src/locales/en.json`.
- Local API setup and developer commands: `README.md`.
- Demo deployment assumptions and hosting caveats: `DEPLOY_DEMO.md`.
- Existing scoped frontend review and known follow-up issues: `FRONTEND_REVIEW.md`.
- CI checks: `.github/workflows/ci.yml`.
- No verified customer testimonials, usage metrics, market comparisons, or production service guarantees were found in the reviewed project documents.

## Needs Confirmation

- The exact primary teaching setting and the most important user outcome or success measure.
- The administrator's real-world role and whether administrators are end users of the intended product.
- Any verified differentiator or positioning claim.
- Privacy, consent, retention, and regulatory expectations for student and parent data.
- Production hosting, availability, backup, and budget requirements beyond the current learning/demo deployment.
- Supported assistive technologies and browser combinations, plus any inclusion requirements beyond the WCAG 2.2 Level AA target.
- Whether students or parents are intended to sign in; no such frontend workflow was found.
