import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { openAdminUsers } from './fixtures/admin';

const artifactDirectory = path.resolve(process.cwd(), 'artifacts/shared-controls-v3');

type Rgb = [number, number, number];

function parseRgb(color: string): Rgb {
  const channels = color.match(/[\d.]+/g)?.map(Number) ?? [];
  return [channels[0] ?? 0, channels[1] ?? 0, channels[2] ?? 0];
}

function contrastRatio(first: Rgb, second: Rgb): number {
  const linear = (value: number) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  const luminance = (rgb: Rgb) => 0.2126 * linear(rgb[0]) + 0.7152 * linear(rgb[1]) + 0.0722 * linear(rgb[2]);
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return Number(((values[0] + 0.05) / (values[1] + 0.05)).toFixed(2));
}

function composite(foreground: Rgb, background: Rgb, opacity: number): Rgb {
  return foreground.map((channel, index) => Math.round(channel * opacity + background[index] * (1 - opacity))) as Rgb;
}

async function measureControl(locator: import('@playwright/test').Locator) {
  return locator.evaluate((element) => {
    const target = element as HTMLElement;
    const style = getComputedStyle(target);
    const normalize = (color: string) => {
      const numbers = color.match(/[\d.]+/g)?.map(Number) ?? [];
      return { css: color, rgb: [numbers[0] ?? 0, numbers[1] ?? 0, numbers[2] ?? 0] };
    };
    const parentLayers: Array<{ tag: string; color: ReturnType<typeof normalize>; opacity: string }> = [];
    let parent = target.parentElement;
    while (parent && parentLayers.length < 10) {
      parentLayers.push({ tag: parent.tagName.toLowerCase(), color: normalize(getComputedStyle(parent).backgroundColor), opacity: getComputedStyle(parent).opacity });
      parent = parent.parentElement;
    }
    return {
      tag: target.tagName.toLowerCase(),
      theme: target.getAttribute('data-theme') ?? target.parentElement?.getAttribute('data-control-theme'),
      state: target.getAttribute('data-state') ?? (('disabled' in target && (target as HTMLButtonElement | HTMLInputElement).disabled) ? 'disabled' : 'default'),
      foreground: normalize(style.color),
      background: normalize(style.backgroundColor),
      border: normalize(style.borderColor),
      transform: style.transform,
      scale: style.scale,
      placeholder: target instanceof HTMLInputElement ? normalize(getComputedStyle(target, '::placeholder').color) : null,
      outline: { color: normalize(style.outlineColor), width: style.outlineWidth, offset: style.outlineOffset, style: style.outlineStyle },
      focusVisible: target.matches(':focus-visible'),
      className: target.className,
      disabled: 'disabled' in target ? (target as HTMLButtonElement | HTMLInputElement).disabled : false,
      ariaBusy: target.getAttribute('aria-busy'),
      parentLayers,
    };
  });
}

async function focusByKeyboard(page: Page, locator: import('@playwright/test').Locator) {
  await page.locator('body').click({ position: { x: 1, y: 1 } });
  for (let index = 0; index < 45; index++) {
    if (await locator.evaluate((element) => element === document.activeElement)) return;
    await page.keyboard.press('Tab');
  }
  await expect(locator).toBeFocused();
}

async function persistCapture(theme: 'light' | 'dark', width: number, screenshot: string, measurements: Record<string, unknown>) {
  await mkdir(artifactDirectory, { recursive: true });
  const outputPath = path.join(artifactDirectory, `${theme}-${width}px.json`);
  await writeFile(outputPath, JSON.stringify({ generatedAt: new Date().toISOString(), theme, viewport: width, screenshot, ...measurements }, null, 2), 'utf8');
  return outputPath;
}

async function openTeacherProfile(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'playwright-teacher-token');
    localStorage.setItem('refreshToken', 'playwright-teacher-refresh-token');
    localStorage.setItem('language', 'en');
  });
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const requestPath = url.pathname.replace(/\/api\/v1\/?/, '/');
    if (requestPath === '/auth/me' && route.request().method() === 'GET') {
      await route.fulfill({ json: { id: 'teacher-fixture', username: 'teacher-fixture', email: 'teacher@example.test', fullName: 'Test Teacher', role: 'User', imageUrl: null } });
      return;
    }
    if (requestPath === '/auth/profile' && route.request().method() === 'PUT') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      await route.fulfill({ status: 500, json: { message: 'Profile fixture error' } });
      return;
    }
    await route.fulfill({ status: 200, json: {} });
  });
  await page.goto('/me');
  await expect(page.getByLabel('Full Name')).toBeVisible();
  await page.waitForTimeout(500);
}

for (const width of [390, 1440]) {
  test(`shared controls retain the Teacher light theme at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openTeacherProfile(page);

    const fullName = page.getByLabel('Full Name');
    const email = page.getByLabel('Email Address');
    const disabledUsername = page.getByLabel('Username');
    const save = page.getByRole('button', { name: 'Save' });
    await expect(fullName).toHaveAttribute('data-theme', 'light');
    await expect(disabledUsername).toBeDisabled();
    await expect(save).toHaveAttribute('data-theme', 'light');

    const screenshot = path.join(artifactDirectory, `teacher-light-${width}px.png`);
    await mkdir(artifactDirectory, { recursive: true });
    await page.screenshot({ path: screenshot, fullPage: true });

    await fullName.evaluate((element) => element.setAttribute('placeholder', 'Full Name placeholder sample'));
    const defaultInput = await measureControl(fullName);
    const fullNameLabel = await measureControl(page.getByText('Full Name', { exact: true }));
    const disabledInput = await measureControl(disabledUsername);
    const defaultButton = await measureControl(save);
    await save.hover();
    await page.waitForTimeout(250);
    const hoverButton = await measureControl(save);
    await page.mouse.down();
    await page.waitForTimeout(180);
    const activeButton = await measureControl(save);
    await page.mouse.up();
    expect(Number.parseFloat(activeButton.scale)).toBeGreaterThan(0.94);
    expect(Number.parseFloat(activeButton.scale)).toBeLessThan(0.96);
    await focusByKeyboard(page, fullName);
    const focusInput = await measureControl(fullName);
    expect(focusInput.outline.style).not.toBe('none');
    await focusByKeyboard(page, save);
    const focusButton = await measureControl(save);
    expect(focusButton.outline.style).not.toBe('none');
    expect(Number.parseFloat(focusButton.outline.width)).toBeGreaterThanOrEqual(2);
    expect(focusButton.outline.color.css).toBe('rgb(4, 120, 87)');
    await fullName.evaluate((element) => {
      element.setAttribute('data-state', 'error');
      element.setAttribute('aria-invalid', 'true');
      const errorMessage = document.createElement('p');
      errorMessage.className = 'ui-input-error text-sm font-medium';
      errorMessage.textContent = 'Validation error sample';
      element.parentElement?.append(errorMessage);
    });
    fullName.focus();
    await page.waitForTimeout(200);
    const errorInput = await measureControl(fullName);
    const errorMessage = await measureControl(page.getByText('Validation error sample'));
    await fullName.evaluate((element) => {
      element.setAttribute('data-state', 'success');
      element.removeAttribute('aria-invalid');
    });
    await page.waitForTimeout(200);
    const successInput = await measureControl(fullName);

    const placeholderRatio = contrastRatio(parseRgb(defaultInput.placeholder!.css), parseRgb(defaultInput.background.css));
    const lightSurface: Rgb = [255, 255, 255];
    const labelContrast = contrastRatio(parseRgb(fullNameLabel.foreground.css), lightSurface);
    const errorTextContrast = contrastRatio(parseRgb(errorMessage.foreground.css), lightSurface);
    expect(contrastRatio(parseRgb(defaultInput.foreground.css), parseRgb(defaultInput.background.css))).toBeGreaterThanOrEqual(4.5);
    expect(labelContrast).toBeGreaterThanOrEqual(4.5);
    expect(errorTextContrast).toBeGreaterThanOrEqual(4.5);
    expect(placeholderRatio).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(parseRgb(defaultInput.border.css), parseRgb(defaultInput.background.css))).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(parseRgb(hoverButton.foreground.css), parseRgb(hoverButton.background.css))).toBeGreaterThanOrEqual(4.5);
    expect(hoverButton.background.css).toBe('rgb(6, 95, 70)');
    expect(contrastRatio(parseRgb(focusInput.outline.color.css), parseRgb(defaultInput.background.css))).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(parseRgb(focusButton.outline.color.css), lightSurface)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(parseRgb(errorInput.border.css), parseRgb(errorInput.background.css))).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(parseRgb(successInput.border.css), parseRgb(successInput.background.css))).toBeGreaterThanOrEqual(3);

    await fullName.fill('');
    await save.click();
    await expect(fullName).toHaveJSProperty('validity.valid', false);
    await fullName.fill('Test Teacher Updated');
    await email.fill('teacher@example.test');
    await save.click();
    await expect(save).toHaveAttribute('aria-busy', 'true');
    await expect(save).toBeDisabled();
    const loadingButton = await measureControl(save);
    await expect(page.getByText(/Profile fixture error|error/i)).toBeVisible();

    const jsonPath = await persistCapture('light', width, screenshot, {
      controls: { fullNameLabel, defaultInput, disabledInput, defaultButton, hoverButton, activeButton, focusButton, errorInput, errorMessage, successInput, loadingButton },
      contrastRatios: {
        inputTextOnFill: contrastRatio(parseRgb(defaultInput.foreground.css), parseRgb(defaultInput.background.css)),
        placeholderOnFill: placeholderRatio,
        inputBorderAgainstFill: contrastRatio(parseRgb(defaultInput.border.css), parseRgb(defaultInput.background.css)),
        buttonTextOnHover: contrastRatio(parseRgb(hoverButton.foreground.css), parseRgb(hoverButton.background.css)),
        inputFocusAgainstControlFill: contrastRatio(parseRgb(focusInput.outline.color.css), parseRgb(defaultInput.background.css)),
        buttonFocusAgainstWhiteSurface: contrastRatio(parseRgb(focusButton.outline.color.css), lightSurface),
        labelAgainstWhiteSurface: labelContrast,
        errorTextAgainstWhiteSurface: errorTextContrast,
        errorBorderAgainstFill: contrastRatio(parseRgb(errorInput.border.css), parseRgb(errorInput.background.css)),
        successBorderAgainstFill: contrastRatio(parseRgb(successInput.border.css), parseRgb(successInput.background.css)),
      },
      notes: ['Error and success input visuals were previewed using the component data-state attribute; the profile page currently does not bind field-level Input error/success props.', 'The 390px and 1440px values are CSS viewport widths; native browser zoom and assistive technology were not used.'],
    });
    expect(jsonPath).toContain('light-');
  });

  test(`shared controls retain the Admin dark theme at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openAdminUsers(page, 'en');

    const refresh = page.getByRole('button', { name: 'Refresh Data' });
    await expect(refresh).toHaveAttribute('data-theme', 'dark');
    await refresh.hover();
    await page.waitForTimeout(250);
    const hoverButton = await measureControl(refresh);
    await focusByKeyboard(page, refresh);
    const focusButton = await measureControl(refresh);
    expect(focusButton.outline.style).not.toBe('none');

    await page.getByRole('button', { name: 'Subjects', exact: true }).click();
    await page.getByRole('button', { name: 'Add New Subject' }).click();
    await page.waitForTimeout(350);
    const subjectName = page.getByLabel('Subject Name');
    const subjectDescription = page.getByLabel('Description');
    const createSubject = page.getByRole('button', { name: 'Create Subject' });
    await expect(subjectName).toHaveAttribute('data-theme', 'dark');
    await expect(createSubject).toHaveAttribute('data-theme', 'dark');

    const screenshot = path.join(artifactDirectory, `admin-dark-${width}px.png`);
    await mkdir(artifactDirectory, { recursive: true });
    await page.screenshot({ path: screenshot, fullPage: true });
    const defaultInput = await measureControl(subjectName);
    const subjectNameLabel = await measureControl(page.getByText('Subject Name', { exact: true }));
    const placeholder = defaultInput.placeholder;
    const defaultPrimaryButton = await measureControl(createSubject);
    await createSubject.hover();
    await page.waitForTimeout(250);
    const hoverPrimaryButton = await measureControl(createSubject);
    await page.mouse.down();
    await page.waitForTimeout(180);
    const activePrimaryButton = await measureControl(createSubject);
    await page.mouse.up();
    expect(Number.parseFloat(activePrimaryButton.scale)).toBeGreaterThan(0.94);
    expect(Number.parseFloat(activePrimaryButton.scale)).toBeLessThan(0.96);
    await subjectName.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(createSubject).toBeFocused();
    const focusPrimaryButton = await measureControl(createSubject);
    expect(focusPrimaryButton.focusVisible).toBe(true);
    const darkPanel: Rgb = [17, 24, 20];
    expect(contrastRatio(parseRgb(hoverPrimaryButton.foreground.css), parseRgb(hoverPrimaryButton.background.css))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(parseRgb(focusPrimaryButton.outline.color.css), darkPanel)).toBeGreaterThanOrEqual(3);

    await subjectName.evaluate((element) => {
      element.setAttribute('data-state', 'error');
      element.setAttribute('aria-invalid', 'true');
      const errorMessage = document.createElement('p');
      errorMessage.className = 'ui-input-error text-sm font-medium';
      errorMessage.textContent = 'Validation error sample';
      element.parentElement?.append(errorMessage);
    });
    await focusByKeyboard(page, subjectName);
    await page.waitForTimeout(200);
    const errorInput = await measureControl(subjectName);
    const errorMessage = await measureControl(page.getByText('Validation error sample'));
    await subjectName.evaluate((element) => {
      element.setAttribute('data-state', 'success');
      element.removeAttribute('aria-invalid');
    });
    await page.waitForTimeout(200);
    const successInput = await measureControl(subjectName);

    await subjectDescription.evaluate((element) => { (element as HTMLInputElement).disabled = true; });
    const disabledInput = await measureControl(subjectDescription);

    const borderAgainstFill = contrastRatio(parseRgb(defaultInput.border.css), parseRgb(defaultInput.background.css));
    const placeholderAgainstFill = contrastRatio(parseRgb(placeholder!.css), parseRgb(defaultInput.background.css));
    const inputTextAgainstFill = contrastRatio(parseRgb(defaultInput.foreground.css), parseRgb(defaultInput.background.css));
    const errorBorderAgainstFill = contrastRatio(parseRgb(errorInput.border.css), parseRgb(errorInput.background.css));
    const successBorderAgainstFill = contrastRatio(parseRgb(successInput.border.css), parseRgb(successInput.background.css));
    const darkFormSurface = composite([255, 255, 255], darkPanel, 0.05);
    const labelContrast = contrastRatio(parseRgb(subjectNameLabel.foreground.css), darkFormSurface);
    const errorTextContrast = contrastRatio(parseRgb(errorMessage.foreground.css), darkFormSurface);
    expect(borderAgainstFill).toBeGreaterThanOrEqual(3);
    expect(placeholderAgainstFill).toBeGreaterThanOrEqual(4.5);
    expect(inputTextAgainstFill).toBeGreaterThanOrEqual(4.5);
    expect(labelContrast).toBeGreaterThanOrEqual(4.5);
    expect(errorTextContrast).toBeGreaterThanOrEqual(4.5);
    expect(errorBorderAgainstFill).toBeGreaterThanOrEqual(3);
    expect(successBorderAgainstFill).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(parseRgb(hoverButton.foreground.css), darkPanel)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(parseRgb(focusButton.outline.color.css), darkPanel)).toBeGreaterThanOrEqual(3);

    await page.route('**/api/v1/subjects', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      await route.fulfill({ status: 500, json: { message: 'Subject fixture error' } });
    });
    await subjectName.fill('Mathematics');
    await createSubject.click();
    await expect(createSubject).toHaveAttribute('aria-busy', 'true');
    await expect(createSubject).toBeDisabled();
    const loadingButton = await measureControl(createSubject);
    await expect(page.locator('main [role="alert"]')).toBeVisible();

    const jsonPath = await persistCapture('dark', width, screenshot, {
      controls: { subjectNameLabel, defaultInput, defaultPrimaryButton, hoverPrimaryButton, activePrimaryButton, focusPrimaryButton, hoverButton, focusButton, errorInput, errorMessage, successInput, disabledInput, loadingButton },
      contrastRatios: {
        inputTextOnFill: inputTextAgainstFill,
        labelOnTranslucentFormSurface: labelContrast,
        errorTextOnTranslucentFormSurface: errorTextContrast,
        placeholderOnFill: placeholderAgainstFill,
        inputBorderAgainstFill: borderAgainstFill,
        buttonTextOnHoverAgainstDarkPanel: contrastRatio(parseRgb(hoverButton.foreground.css), darkPanel),
        buttonFocusAgainstDarkPanel: contrastRatio(parseRgb(focusButton.outline.color.css), darkPanel),
        primaryButtonTextOnHover: contrastRatio(parseRgb(hoverPrimaryButton.foreground.css), parseRgb(hoverPrimaryButton.background.css)),
        primaryButtonFocusAgainstDarkPanel: contrastRatio(parseRgb(focusPrimaryButton.outline.color.css), darkPanel),
        errorBorderAgainstFill,
        successBorderAgainstFill,
      },
      notes: ['Control fills are opaque and directly measured; label and error text are compared against the form 5% white overlay composited over #111814 as a conservative dark-surface proxy.', 'Disabled controls are recorded but excluded from WCAG text contrast thresholds.', 'Error and success input visuals were previewed using the component data-state attribute and the component error-message class; current Admin subject form has no field-level validation state.'],
    });
    expect(jsonPath).toContain('dark-');
  });
}
