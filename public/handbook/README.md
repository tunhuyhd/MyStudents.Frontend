# Handbook interface captures

These are real local MyStudents interface screenshots with synthetic teacher, student and class fixtures. No Production account, cookie, credential or student data was used. Numbered markers are rendered in the capture browser; matching bilingual explanations live in `src/app/handbook/images.ts`. Some existing lesson-dialog labels are still Vietnamese in the English interface; the captures intentionally reflect that interface rather than altering it.

Each language has ten compressed JPEGs. Intrinsic dimensions and source routes are recorded in `provenance.json`; origins are also embedded in each JPEG. Files are served locally and loaded lazily. The guide provides a keyboard-accessible viewer with actual-size scrolling for narrow screens.

## Refresh captures after changing interface labels or layout

Use an existing local dev server, or let the Playwright config start one. Normal tests skip asset generation.

```powershell
$env:CAPTURE_HANDBOOK='1'
$env:PLAYWRIGHT_BASE_URL='http://localhost:3000'
try { npx playwright test tests/e2e/handbook-capture.spec.ts --retries=0 }
finally { Remove-Item Env:CAPTURE_HANDBOOK, Env:PLAYWRIGHT_BASE_URL -ErrorAction SilentlyContinue }
```

The capture spec mocks all BFF requests and blocks external origins. Check every exported marker against its legend and inspect both language sets before committing. The manifest is regenerated with the assets; do not hand-edit dimensions. Re-embed each manifest entry's origin using the available image metadata tool after regeneration, then run the handbook tests. Update captions whenever a marked action changes.
