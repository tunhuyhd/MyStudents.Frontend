import { expect, test, type Locator } from '@playwright/test';
import { openAdminUsers } from './fixtures/admin';

// Measure rendered foreground against the actual composited ancestor surfaces.
async function contrast(locator: Locator) {
  return locator.evaluate(element => {
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const context=canvas.getContext('2d')!;
    const rgb=(color:string)=>{context.clearRect(0,0,1,1);context.fillStyle=color;context.fillRect(0,0,1,1);return [...context.getImageData(0,0,1,1).data].slice(0,3);};
    const foreground=rgb(getComputedStyle(element).color);
    const ancestors: Element[]=[];let node:Element|null=element;
    while(node){ancestors.unshift(node);node=node.parentElement;}
    context.fillStyle='#ffffff';context.fillRect(0,0,1,1);
    for(const ancestor of ancestors){context.fillStyle=getComputedStyle(ancestor).backgroundColor;context.fillRect(0,0,1,1);}
    const background=[...context.getImageData(0,0,1,1).data].slice(0,3);
    const luminance=(channels:number[])=>{const [r,g,b]=channels.map(value=>{const c=value/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});return .2126*r+.7152*g+.0722*b;};
    const a=luminance(foreground),b=luminance(background);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  });
}

test('Campus admin text, custom role controls and subject forms remain readable at narrow and wide widths', async ({page})=>{
  for(const width of [320,1440]){
    await page.setViewportSize({width,height:1000});
    await openAdminUsers(page,'en');
    expect(await contrast(page.locator('h1'))).toBeGreaterThanOrEqual(4.5);
    for(const header of await page.getByRole('columnheader').all())expect(await contrast(header)).toBeGreaterThanOrEqual(4.5);
    const roles=page.getByRole('combobox').first();
    await expect(roles).toBeEnabled();await roles.click();await expect(page.getByRole('option').first()).toBeVisible();await roles.press('Escape');
    expect(await contrast(roles)).toBeGreaterThanOrEqual(4.5);
    await page.getByRole('button',{name:'Subjects',exact:true}).click();
    await page.getByRole('button',{name:'Add New Subject'}).click();
    const name=page.getByLabel('Subject Name');await expect(name).toBeVisible();
    expect(await contrast(name)).toBeGreaterThanOrEqual(4.5);
    await name.fill('Mathematics');await expect(name).toHaveValue('Mathematics');
    const action=page.getByRole('button',{name:'Create Subject'});await expect(action).toBeEnabled();
    expect(await contrast(action)).toBeGreaterThanOrEqual(4.5);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});

test('Campus admin has no decorative canvas and remains usable when reduced motion changes',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await openAdminUsers(page,'en');
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(await page.evaluate(()=>getComputedStyle(document.body,'::before').backgroundImage)).toBe('none');
  await page.emulateMedia({reducedMotion:'no-preference'});await expect(page.locator('canvas')).toHaveCount(0);
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/admin/login');
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByLabel('Admin Identifier')).toBeVisible();
});
