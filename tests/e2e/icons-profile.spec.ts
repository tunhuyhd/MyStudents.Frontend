import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import vi from '../../src/locales/vi.json';
for(const width of [1440,390])test(`Phosphor profile, security, avatar and toolbar at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>localStorage.setItem('language','vi'));
 await page.route('**/api/bff/**',route=>{
 const p=new URL(route.request().url()).pathname;
 if(p.endsWith('/auth/me'))return route.fulfill({json:{id:'u',role:'User',fullName:'Nguyễn Thu Hà',username:'teacher',email:'teacher@example.test'}});
 if(p.endsWith('/students/paged'))return route.fulfill({json:{items:[{id:'s1',firstName:'An',lastName:'Nguyễn',status:1,email:'an@example.test'}],totalCount:1,totalPages:1,pageNumber:1,pageSize:12}});
 return route.fulfill({json:[]});});
 await mkdir('.impeccable/review',{recursive:true});
 async function capture(name:string){await page.evaluate(()=>document.fonts.ready);await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`.impeccable/review/icons-${name}-${width}.png`,fullPage:true});}
 await page.goto('/me');const nav=page.locator('.club-profile-nav');await expect(nav.locator('[data-icon=IdentificationCard]')).toHaveAttribute('data-icon-weight','fill');await expect(nav.locator('[data-icon=Fingerprint]')).toHaveAttribute('data-icon-weight','bold');await expect(nav.locator('svg').first()).toHaveCSS('width','28px');await expect(nav.locator('button>span:last-child').first()).toHaveCSS('white-space','nowrap');await expect(page.locator('.club-avatar-badge')).toBeVisible();await expect(page.locator('.club-avatar-badge svg')).toHaveCSS('width','22px');await expect(page.locator('main [data-icon=Save]')).toHaveCSS('width','20px');await capture('profile');
 await page.getByRole('button',{name:vi.profile.security,exact:true}).click();await expect(page.getByLabel(vi.profile.oldPassword,{exact:true})).toBeVisible();await expect(nav.getByRole('button',{name:vi.profile.security,exact:true})).toHaveAttribute('aria-pressed','true');await capture('security');
 await page.getByRole('button',{name:vi.profile.chooseNewPhoto,exact:true}).click();await expect(page.getByRole('button',{name:vi.profile.viewAvatar,exact:true})).toBeVisible();await capture('avatar');await page.getByRole('button',{name:vi.profile.cancel,exact:true}).click();
 await page.goto('/teacher/students');await expect(page.locator('.campus-record')).toHaveCount(1);await expect(page.locator('[id=teacher-content] svg:not([data-icon-library="phosphor"])')).toHaveCount(0);await expect(page.locator('[id=teacher-content] [data-icon=Edit]')).toHaveAttribute('data-icon-weight','bold');await capture('toolbar');
});

