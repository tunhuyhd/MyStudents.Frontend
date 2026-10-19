import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { adminSubjects, openAdminUsers } from './fixtures/admin';

const artifactDirectory = path.resolve(process.cwd(), 'artifacts/admin-contrast');

function contrastRatio(foreground: [number, number, number], background: [number, number, number]) {
  const linear = (value: number) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  const luminance = (color: [number, number, number]) =>
    0.2126 * linear(color[0]) + 0.7152 * linear(color[1]) + 0.0722 * linear(color[2]);
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return Number(((values[0] + 0.05) / (values[1] + 0.05)).toFixed(2));
}

function parseRgba(value: string): { rgb: [number, number, number]; alpha: number } {
  const numbers = value.match(/[\d.]+/g)?.map(Number) ?? [];
  return { rgb: [numbers[0] ?? 0, numbers[1] ?? 0, numbers[2] ?? 0], alpha: numbers[3] ?? 1 };
}

function composite(foreground: ReturnType<typeof parseRgba>, background: [number, number, number]): [number, number, number] {
  return foreground.rgb.map((channel, index) => Math.round(channel * foreground.alpha + background[index] * (1 - foreground.alpha))) as [number, number, number];
}

type ColorSample = { label: string; found: boolean; color?: string; ancestors?: Array<{ tag: string; backgroundColor: string; opacity: string }> };

function estimateContrast(sample: ColorSample) {
  if (!sample.found || !sample.color || !sample.ancestors) return { ...sample, contrastEstimates: null };
  const foreground = parseRgba(sample.color);
  const bases: Array<[string, [number, number, number]]> = [
    ['canvas-edge-#020403', [2, 4, 3]],
    ['canvas-center-#060a08', [6, 10, 8]],
  ];
  const layers = sample.ancestors.filter(({ tag }) => tag !== 'body' && tag !== 'html').reverse();
  const effectiveOpacity = sample.ancestors.reduce((opacity, ancestor) => opacity * Number(ancestor.opacity), 1);
  return {
    ...sample,
    effectiveOpacity,
    contrastEstimates: bases.map(([backgroundName, canvas]) => {
      let background = canvas;
      for (const layer of layers) {
        const color = parseRgba(layer.backgroundColor);
        if (color.alpha > 0) background = composite(color, background);
      }
      const compositedForeground = composite({ ...foreground, alpha: foreground.alpha * effectiveOpacity }, background);
      return { backgroundName, compositedBackgroundRgb: background, compositedForegroundRgb: compositedForeground, ratio: contrastRatio(compositedForeground, background) };
    }),
    measurementNote: 'Foreground and ancestor CSS backgrounds are browser-computed and alpha-composited from the canvas gradient endpoints. Canvas CSS filter, backdrop blur, moving particles, antialiasing and screenshot pixels may alter local rendered colors.',
  };
}

async function readColorSample(locator: import('@playwright/test').Locator, label: string, pseudoElement?: string): Promise<ColorSample> {
  return locator.evaluate((element, options) => {
    const target = element as HTMLElement;
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    const normalize = (color: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = 'rgba(0,0,0,0)';
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
      return `rgba(${r}, ${g}, ${b}, ${Number((a / 255).toFixed(4))})`;
    };
    const style = getComputedStyle(target);
    const ancestors: NonNullable<ColorSample['ancestors']> = [];
    let current: HTMLElement | null = target;
    while (current && ancestors.length < 12) {
      const parentStyle = getComputedStyle(current);
      ancestors.push({ tag: current.tagName.toLowerCase(), backgroundColor: normalize(parentStyle.backgroundColor), opacity: parentStyle.opacity });
      current = current.parentElement;
    }
    const color = options.pseudoElement ? getComputedStyle(target, options.pseudoElement).color : style.color;
    return { label: options.label, found: true, color: normalize(color), ancestors };
  }, { label, pseudoElement });
}

test('captures Admin contrast states and reduced-motion behavior for V4 review', async ({ page }, testInfo) => {
  await mkdir(artifactDirectory, { recursive: true });
  const viewportCaptures: Array<Record<string, unknown>> = [];
  const captureMode = process.env.ADMIN_CONTRAST_CAPTURE === 'before' ? 'before' : 'after';
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await openAdminUsers(page, 'en');
    await page.waitForTimeout(800);
    if (captureMode === 'before') {
      const oldColor = 'rgba(16, 185, 129, 0.4)';
      await page.locator('main .max-w-7xl > div:first-child p').evaluate((node, color) => { (node as HTMLElement).style.setProperty('color', color, 'important'); }, oldColor);
      await page.locator('th').evaluateAll((nodes, color) => nodes.forEach((node) => (node as HTMLElement).style.setProperty('color', color, 'important')), oldColor);
      await page.locator('tbody tr:first-child td:first-child .text-sm').evaluate((node, color) => { (node as HTMLElement).style.setProperty('color', color, 'important'); }, oldColor);
      await page.getByRole('button', { name: 'Subjects', exact: true }).evaluate((node) => {
        (node as HTMLElement).setAttribute('data-contrast-baseline', 'inactive-tab');
        (node as HTMLElement).style.setProperty('color', 'rgba(16,185,129,.6)', 'important');
        (node as HTMLElement).style.setProperty('transition', 'none', 'important');
      });
      await page.locator('tbody tr:first-child td:nth-child(3) span').evaluate((node) => { (node as HTMLElement).style.setProperty('color', 'rgba(255,255,255,.4)', 'important'); });
      await page.locator('tbody tr:nth-child(2) td:nth-child(4) button').evaluate((node) => {
        (node as HTMLElement).style.setProperty('color', 'rgba(255,255,255,.4)', 'important');
        (node as HTMLElement).style.setProperty('transition', 'none', 'important');
      });
    }
    const colorSamples = await page.locator('main').evaluate((main) => {
      const colorCanvas = document.createElement('canvas');
      colorCanvas.width = 1;
      colorCanvas.height = 1;
      const colorContext = colorCanvas.getContext('2d', { willReadFrequently: true })!;
      const normalizeColor = (color: string) => {
        colorContext.clearRect(0, 0, 1, 1);
        colorContext.fillStyle = 'rgba(0,0,0,0)';
        colorContext.fillStyle = color;
        colorContext.fillRect(0, 0, 1, 1);
        const [red, green, blue, alphaByte] = colorContext.getImageData(0, 0, 1, 1).data;
        return `rgba(${red}, ${green}, ${blue}, ${Number((alphaByte / 255).toFixed(4))})`;
      };
      const selectors = [
        ['page-description', 'main > div p'],
        ['table-header', 'th'],
        ['username', 'tbody tr:nth-child(1) td:first-child div:nth-child(2) div:last-child'],
        ['table-email', 'tbody tr:nth-child(1) td:nth-child(2)'],
        ['inactive-tab', 'button'],
        ['selected-tab', 'button'],
        ['inactive-role', 'tbody tr:nth-child(1) td:nth-child(3) span'],
        ['active-status', 'tbody tr:nth-child(1) td:nth-child(4) button'],
        ['inactive-status', 'tbody tr:nth-child(2) td:nth-child(4) button'],
      ];
      return selectors.map(([label, selector]) => {
        const element = label === 'inactive-tab'
          ? main.querySelector<HTMLElement>('[data-contrast-baseline="inactive-tab"]') ?? Array.from(main.querySelectorAll<HTMLElement>('button')).find((button) => button.textContent?.includes('Subjects')) ?? null
          : label === 'selected-tab'
            ? Array.from(main.querySelectorAll<HTMLElement>('button')).find((button) => button.textContent?.includes('Users')) ?? null
            : main.querySelector<HTMLElement>(selector);
        if (!element) return { label, found: false };
        const style = getComputedStyle(element);
        const ancestors: Array<{ tag: string; className: string; backgroundColor: string; opacity: string; backdropFilter: string }> = [];
        let current: HTMLElement | null = element;
        while (current && ancestors.length < 12) {
          const parentStyle = getComputedStyle(current);
          ancestors.push({ tag: current.tagName.toLowerCase(), className: typeof current.className === 'string' ? current.className : '', backgroundColor: normalizeColor(parentStyle.backgroundColor), opacity: parentStyle.opacity, backdropFilter: parentStyle.backdropFilter });
          current = current.parentElement;
        }
        return { label, found: true, text: element.textContent?.trim().slice(0, 100), color: normalizeColor(style.color), backgroundColor: normalizeColor(style.backgroundColor), fontSize: style.fontSize, fontWeight: style.fontWeight, ancestors };
      });
    });
    const sampleResults = (colorSamples as ColorSample[]).map(estimateContrast);
    if (captureMode === 'after') {
      const normalTextPairs = sampleResults.filter((sample) => sample.found && ['page-description', 'table-header', 'username', 'inactive-tab', 'inactive-role', 'inactive-status'].includes(sample.label as string));
      for (const sample of normalTextPairs) {
        expect((sample.contrastEstimates as Array<{ ratio: number }>).every(({ ratio }) => ratio >= 4.5), `${sample.label} contrast estimates`).toBe(true);
      }
    }
    const screenshotPath = path.join(artifactDirectory, `admin-${width}-${captureMode}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    viewportCaptures.push({ width, language: 'en', screenshotPath, samples: sampleResults });
    if (captureMode === 'before' && width === 1440) {
      const row = page.getByRole('row').filter({ hasText: 'nguyen.minh.anh.' });
      const roleDropdown = row.locator('td:nth-child(5) button').first();
      await roleDropdown.focus();
      await page.keyboard.press('Enter');
      const roleMenu = row.locator('td:nth-child(5) div.absolute');
      const studentOption = roleMenu.getByRole('button', { name: 'Student', exact: true });
      await expect(studentOption).toBeVisible();
      await page.waitForTimeout(350);
      await studentOption.evaluate((node) => {
        (node as HTMLElement).style.setProperty('color', 'rgba(16,185,129,.7)', 'important');
        (node as HTMLElement).style.setProperty('transition', 'none', 'important');
      });
      const roleOption = estimateContrast(await readColorSample(studentOption, 'role-option-default'));
      viewportCaptures.push({ width, interactionStates: { roleOption } });
    }
  }

  if (captureMode === 'after') {
    const inactiveTab = page.getByRole('button', { name: 'Subjects', exact: true });
    await inactiveTab.hover();
    const tabHoverStyle = await inactiveTab.evaluate((node) => ({ color: getComputedStyle(node).color, backgroundColor: getComputedStyle(node).backgroundColor }));
    const tabHoverContrast = estimateContrast(await readColorSample(inactiveTab, 'tab-hover'));
    await page.locator('body').press('Tab');
    for (let index = 0; index < 50 && !(await inactiveTab.evaluate((node) => node.matches(':focus-visible'))); index += 1) await page.keyboard.press('Tab');
    const tabFocus = await inactiveTab.evaluate((node) => ({ focused: node.matches(':focus-visible'), color: getComputedStyle(node).color, outlineColor: getComputedStyle(node).outlineColor, outlineWidth: getComputedStyle(node).outlineWidth }));
    expect(tabFocus.focused).toBe(true);
    const tabFocusContrast = estimateContrast(await readColorSample(inactiveTab, 'tab-focus'));
    await inactiveTab.click();
    const tabSelected = await inactiveTab.evaluate((node) => ({ color: getComputedStyle(node).color, backgroundColor: getComputedStyle(node).backgroundColor }));
    const tabSelectedContrast = estimateContrast(await readColorSample(inactiveTab, 'tab-selected'));
    await page.getByRole('button', { name: 'Users', exact: true }).click();
    const row = page.getByRole('row').filter({ hasText: 'nguyen.minh.anh.' });
    const roleDropdown = row.locator('td:nth-child(5) button').first();
    await roleDropdown.scrollIntoViewIfNeeded();
    await roleDropdown.focus();
    await page.keyboard.press('Enter');
    const roleMenu = row.locator('td:nth-child(5) div.absolute');
    const roleOption = roleMenu.getByRole('button', { name: 'Student', exact: true });
    await expect(roleOption).toBeVisible();
    await page.waitForTimeout(350);
    const roleDefault = estimateContrast(await readColorSample(roleOption, 'role-option-default'));
    await roleOption.hover();
    const roleHover = estimateContrast(await readColorSample(roleOption, 'role-option-hover'));
    for (let index = 0; index < 10 && !(await roleOption.evaluate((node) => node.matches(':focus-visible'))); index += 1) await page.keyboard.press('Tab');
    await expect(roleOption).toBeFocused();
    const roleFocus = await roleOption.evaluate((node) => ({ focused: node.matches(':focus-visible'), color: getComputedStyle(node).color, outlineColor: getComputedStyle(node).outlineColor, outlineWidth: getComputedStyle(node).outlineWidth }));
    expect(roleFocus.focused).toBe(true);
    const roleFocusContrast = estimateContrast(await readColorSample(roleOption, 'role-option-focus'));
    await roleDropdown.evaluate((node) => {
      (node as HTMLButtonElement).disabled = true;
      node.style.setProperty('opacity', '0.5');
    });
    const roleDisabled = estimateContrast(await readColorSample(roleDropdown, 'role-control-disabled'));
    expect(await roleDropdown.isDisabled()).toBe(true);
    for (const state of [tabHoverContrast, tabFocusContrast, tabSelectedContrast, roleDefault, roleHover, roleFocusContrast]) {
      expect(state.contrastEstimates?.every(({ ratio }) => ratio >= 4.5), `${state.label} contrast`).toBe(true);
    }
    viewportCaptures.push({ width: 1440, interactionStates: { tabHover: { ...tabHoverStyle, contrast: tabHoverContrast }, tabFocus: { ...tabFocus, contrast: tabFocusContrast }, tabSelected: { ...tabSelected, contrast: tabSelectedContrast }, roleDefault, roleHover, roleFocus: { ...roleFocus, contrast: roleFocusContrast }, roleDisabled: { color: roleDisabled.color, effectiveOpacity: 'effectiveOpacity' in roleDisabled ? roleDisabled.effectiveOpacity : null, backgroundLayers: roleDisabled.ancestors?.map(({ backgroundColor }) => backgroundColor).filter((color) => color !== 'rgba(0, 0, 0, 0)'), synthetic: true, contrastEstimate: null, note: 'The native disabled attribute and 50% opacity effect were applied to capture the control’s disabled appearance. WCAG text contrast is not applicable to disabled controls; actual mutation-pending timing is not asserted.' } } });
  }

  const subjectsTab = page.getByRole('button', { name: 'Subjects', exact: true });
  await subjectsTab.click();
  await expect(page.getByText(adminSubjects[0].description, { exact: true })).toBeVisible();
  await page.waitForTimeout(800);
  if (captureMode === 'before') {
    await page.getByText(adminSubjects[0].description, { exact: true }).evaluate((node) => {
      (node as HTMLElement).style.setProperty('color', 'rgba(16,185,129,.4)', 'important');
      (node as HTMLElement).style.setProperty('transition', 'none', 'important');
    });
  }
  const subjectDescription = estimateContrast(await readColorSample(page.getByText(adminSubjects[0].description, { exact: true }), 'subject-description'));
  if (captureMode === 'after') expect(subjectDescription.contrastEstimates?.every(({ ratio }) => ratio >= 4.5)).toBe(true);
  await page.goto('/admin/login');
  await page.waitForTimeout(800);
  if (captureMode === 'before') {
    await page.getByRole('link', { name: /Back to Home/ }).evaluate((node) => { (node as HTMLElement).style.setProperty('color', 'rgba(16,185,129,.5)', 'important'); });
    await page.getByText('Secure Terminal System').evaluate((node) => { (node as HTMLElement).style.setProperty('color', 'rgba(16,185,129,.6)', 'important'); });
    await page.getByText(/Restricted Area/).evaluate((node) => { (node as HTMLElement).style.setProperty('color', 'rgba(16,185,129,.2)', 'important'); });
    await page.locator('form label').evaluateAll((nodes) => nodes.forEach((node) => (node as HTMLElement).style.setProperty('color', '#064e3b', 'important')));
    await page.addStyleTag({ content: 'form input::placeholder { color: #47695c !important; }' });
  }
  const loginLabels = await page.locator('form label').all();
  const loginInputs = await page.locator('form input').all();
  const loginTextSamples = [];
  for (let index = 0; index < loginLabels.length; index += 1) loginTextSamples.push(estimateContrast(await readColorSample(page.locator('form label').nth(index), `admin-login-label-${index + 1}`)));
  for (let index = 0; index < loginInputs.length; index += 1) loginTextSamples.push(estimateContrast(await readColorSample(page.locator('form input').nth(index), `admin-login-placeholder-${index + 1}`, '::placeholder')));
  loginTextSamples.push(estimateContrast(await readColorSample(page.getByRole('link', { name: /Back to Home/ }), 'admin-login-back-link')));
  loginTextSamples.push(estimateContrast(await readColorSample(page.getByText('Secure Terminal System'), 'admin-login-subheading')));
  loginTextSamples.push(estimateContrast(await readColorSample(page.getByText(/Restricted Area/), 'admin-login-footer')));
  if (captureMode === 'after') {
    expect(subjectDescription.contrastEstimates?.every(({ ratio }) => ratio >= 4.5)).toBe(true);
    expect(loginTextSamples.every((sample) => sample.contrastEstimates?.every(({ ratio }) => ratio >= 4.5))).toBe(true);
  }
  const loginScreenshot = path.join(artifactDirectory, `admin-login-1440-${captureMode}.png`);
  await page.screenshot({ path: loginScreenshot, fullPage: true });

  const normalMotionFrameSample = await page.evaluate(() => new Promise<{ frames: number; elapsedMs: number; approximateFps: number }>((resolve) => {
    let frames = 0;
    let firstFrame = 0;
    const measure = (timestamp: number) => {
      if (!firstFrame) firstFrame = timestamp;
      frames += 1;
      const elapsedMs = timestamp - firstFrame;
      if (elapsedMs >= 250) {
        resolve({ frames, elapsedMs, approximateFps: Math.round((frames * 1000) / elapsedMs) });
      } else {
        requestAnimationFrame(measure);
      }
    };
    requestAnimationFrame(measure);
  }));

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reducedMotionFrameSample = await page.evaluate(() => new Promise<{ frames: number; elapsedMs: number; approximateFps: number }>((resolve) => {
    let frames = 0;
    let firstFrame = 0;
    const measure = (timestamp: number) => {
      if (!firstFrame) firstFrame = timestamp;
      frames += 1;
      const elapsedMs = timestamp - firstFrame;
      if (elapsedMs >= 250) {
        resolve({ frames, elapsedMs, approximateFps: Math.round((frames * 1000) / elapsedMs) });
      } else {
        requestAnimationFrame(measure);
      }
    };
    requestAnimationFrame(measure);
  }));
  const reducedMotionState = await page.evaluate(() => ({
    matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
    animations: document.getAnimations().map((animation) => ({
      playState: animation.playState,
      currentTime: animation.currentTime,
      target: animation.effect instanceof KeyframeEffect && animation.effect.target instanceof Element
        ? animation.effect.target.tagName.toLowerCase()
        : null,
    })),
  }));

  expect(reducedMotionState.matches).toBe(true);
  const measurements = { generatedAt: new Date().toISOString(), captureMode, viewports: viewportCaptures, subjectDescription, loginTextSamples, loginScreenshot, normalMotionFrameSample, reducedMotionFrameSample, reducedMotionState };
  const measurementJson = JSON.stringify(measurements, null, 2);
  await writeFile(path.join(artifactDirectory, `admin-v4-${captureMode}.json`), measurementJson, 'utf8');
  await testInfo.attach('admin-v4-rendered-colors.json', {
    body: measurementJson,
    contentType: 'application/json',
  });
  await page.screenshot({ path: path.join(artifactDirectory, `admin-login-1440-${captureMode}-reduced-motion.png`), fullPage: true });
});

test('keeps the Zodiac canvas static for reduced motion and responds to live preference changes', async ({ page }, testInfo) => {
  await mkdir(artifactDirectory, { recursive: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const audit = { canvasClearCount: 0, canvasFillCount: 0 };
    Object.defineProperty(window, '__zodiacMotionAudit', { value: audit, configurable: false });

    const originalClearRect = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args: Parameters<typeof originalClearRect>) {
      if (this.canvas.classList.contains('fixed') && this.canvas.classList.contains('-z-10')) audit.canvasClearCount += 1;
      return originalClearRect.apply(this, args);
    };

    const originalFillRect = CanvasRenderingContext2D.prototype.fillRect;
    CanvasRenderingContext2D.prototype.fillRect = function (...args: Parameters<typeof originalFillRect>) {
      if (this.canvas.classList.contains('fixed') && this.canvas.classList.contains('-z-10')) audit.canvasFillCount += 1;
      return originalFillRect.apply(this, args);
    };
  });

  await openAdminUsers(page, 'en');
  const zodiacCanvas = page.locator('canvas.fixed.-z-10');
  await expect(zodiacCanvas).toBeAttached();
  await page.waitForTimeout(400);

  const readCanvasCounts = () => page.evaluate(() => {
    const audit = (window as unknown as { __zodiacMotionAudit: { canvasClearCount: number; canvasFillCount: number } }).__zodiacMotionAudit;
    return { ...audit, sampledAt: performance.now() };
  });
  const reducedInitialStart = await readCanvasCounts();
  await page.waitForTimeout(400);
  const reducedInitialEnd = await readCanvasCounts();
  expect(reducedInitialStart.canvasClearCount).toBeGreaterThan(0);
  expect(reducedInitialEnd.canvasClearCount).toBe(reducedInitialStart.canvasClearCount);
  const reducedInitialScreenshot = path.join(artifactDirectory, 'admin-motion-reduced-initial-1440.png');
  await page.screenshot({ path: reducedInitialScreenshot, fullPage: true });

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(async () => (await readCanvasCounts()).canvasClearCount).toBeGreaterThan(reducedInitialEnd.canvasClearCount);
  await page.waitForTimeout(300);
  const normalStart = await readCanvasCounts();
  await page.waitForTimeout(350);
  const normalEnd = await readCanvasCounts();
  expect(normalEnd.canvasClearCount - normalStart.canvasClearCount).toBeGreaterThan(2);
  const normalScreenshot = path.join(artifactDirectory, 'admin-motion-normal-1440.png');
  await page.screenshot({ path: normalScreenshot, fullPage: true });

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  const reducedRuntimeStart = await readCanvasCounts();
  await page.waitForTimeout(400);
  const reducedRuntimeEnd = await readCanvasCounts();
  expect(reducedRuntimeEnd.canvasClearCount - reducedRuntimeStart.canvasClearCount).toBeLessThanOrEqual(1);
  const reducedRuntimeScreenshot = path.join(artifactDirectory, 'admin-motion-reduced-runtime-1440.png');
  await page.screenshot({ path: reducedRuntimeScreenshot, fullPage: true });

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(async () => (await readCanvasCounts()).canvasClearCount).toBeGreaterThan(reducedRuntimeEnd.canvasClearCount);
  await page.waitForTimeout(300);
  const resumedStart = await readCanvasCounts();
  await page.waitForTimeout(350);
  const resumedEnd = await readCanvasCounts();
  expect(resumedEnd.canvasClearCount - resumedStart.canvasClearCount).toBeGreaterThan(2);

  const measurements = {
    generatedAt: new Date().toISOString(),
    viewport: { width: 1440, height: 1000 },
    preference: '(prefers-reduced-motion: reduce)',
    initialReducedMotion: {
      preferenceMatches: true,
      start: reducedInitialStart,
      end: reducedInitialEnd,
      canvasRedrawsDuring400ms: reducedInitialEnd.canvasClearCount - reducedInitialStart.canvasClearCount,
      screenshot: reducedInitialScreenshot,
    },
    normalMotion: {
      preferenceMatches: false,
      start: normalStart,
      end: normalEnd,
      canvasRedrawsDuring350ms: normalEnd.canvasClearCount - normalStart.canvasClearCount,
      screenshot: normalScreenshot,
    },
    runtimeReducedMotion: {
      preferenceMatches: true,
      start: reducedRuntimeStart,
      end: reducedRuntimeEnd,
      canvasRedrawsDuring400ms: reducedRuntimeEnd.canvasClearCount - reducedRuntimeStart.canvasClearCount,
      screenshot: reducedRuntimeScreenshot,
    },
    resumedNormalMotion: {
      preferenceMatches: false,
      start: resumedStart,
      end: resumedEnd,
      canvasRedrawsDuring350ms: resumedEnd.canvasClearCount - resumedStart.canvasClearCount,
    },
    limitations: ['Canvas redraw counts verify animation activity, not CPU usage, frame time, FPS or battery impact.'],
  };
  const measurementJson = JSON.stringify(measurements, null, 2);
  const measurementPath = path.join(artifactDirectory, 'admin-v4-motion.json');
  await writeFile(measurementPath, measurementJson, 'utf8');
  await testInfo.attach('admin-v4-motion.json', { body: measurementJson, contentType: 'application/json' });
});
