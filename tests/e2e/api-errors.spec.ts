import {test,expect} from '@playwright/test';
import vi from '../../src/locales/vi.json';
import en from '../../src/locales/en.json';
for(const language of ['vi','en'] as const){
 for(const failure of ['credentials','unavailable','network'] as const){
 test(`Login explains ${failure} in ${language}`,async({page})=>{
 await page.addInitScript(lang=>localStorage.setItem('language',lang),language);
 const copy=language==='vi'?vi:en;
 await page.route('**/api/bff/**',route=>{
  if(route.request().url().includes('/auth/login')){
   if(failure==='network')return route.abort('failed');
   return route.fulfill({status:failure==='credentials'?401:503,json:{errorCode:failure==='credentials'?'ERR_UNAUTHORIZED':'ERR_INTERNAL',message:'Authentication failed or the session is no longer valid.'}});
  }return route.fulfill({status:401,json:{}});
 });
 await page.goto('/auth/login');await page.getByLabel(copy.auth.username,{exact:true}).fill('testteacher');await page.getByLabel(copy.auth.password,{exact:true}).fill('incorrect-password');await page.getByRole('button',{name:copy.common.login,exact:true}).click();
 await expect(page.locator('main [role=alert]')).toHaveText(copy.apiErrors[failure==='credentials'?'invalidCredentials':failure==='network'?'network':'unavailable']);
 await expect(page.getByLabel(copy.auth.username,{exact:true})).toHaveValue('testteacher');await expect(page.getByRole('button',{name:copy.common.login,exact:true})).toBeEnabled();
 });}
}
test('Reset-link validation distinguishes outage from invalid link and retries',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('language','vi'));let outage=true;
 await page.route('**/api/bff/**',route=>route.request().url().includes('/reset-password/validate')?route.fulfill({status:outage?503:200,json:outage?{message:'internal'}:{}}):route.fulfill({status:401,json:{}}));
 await page.goto(`/auth/reset-password#token=${'A'.repeat(64)}`);await expect(page.locator('main [role=alert]')).toContainText(vi.apiErrors.unavailable);await expect(page.getByText(vi.auth.invalidToken,{exact:true})).toHaveCount(0);
 outage=false;await page.getByRole('button',{name:vi.common.retry,exact:true}).click();await expect(page.getByLabel(vi.profile.newPassword,{exact:true})).toBeVisible();
});
test('Student detail stays on page and explains loading failure with retry',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('language','vi'));let outage=true;
 await page.route('**/api/bff/**',route=>{
 const p=new URL(route.request().url()).pathname;
 if(p.endsWith('/auth/me'))return route.fulfill({json:{id:'u',role:'User',fullName:'Teacher',username:'teacher',email:'teacher@example.test'}});
 if(p.endsWith('/students/s1'))return route.fulfill({status:outage?503:200,json:outage?{}:{id:'s1',firstName:'An',lastName:'Nguyễn',status:1,createdOn:'2026-01-01',gender:0}});
 return route.fulfill({json:[]});});
 await page.goto('/teacher/students/s1');await expect(page.locator('[role=alert]').filter({hasText:vi.apiErrors.unavailable})).toBeVisible();await expect(page).toHaveURL(/students\/s1$/);
 outage=false;await page.getByRole('button',{name:vi.common.retry,exact:true}).click();await expect(page.getByRole('heading',{name:'Nguyễn An',exact:true})).toBeVisible();
});
test('Session restoration outage is explained and retry restores the workspace',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('language','vi'));let outage=true;
 await page.route('**/api/bff/**',route=>{
 if(route.request().url().endsWith('/auth/me'))return route.fulfill({status:outage?503:200,json:outage?{}:{id:'u',role:'User',fullName:'Teacher',username:'teacher',email:'teacher@example.test'}});
 return route.fulfill({json:[]});});
 await page.goto('/auth/login');await expect(page.locator('[role=alert]').filter({hasText:vi.apiErrors.unavailable})).toBeVisible();
 outage=false;await page.getByRole('button',{name:vi.common.retry,exact:true}).click();await expect(page.locator('[role=alert]').filter({hasText:vi.apiErrors.unavailable})).toHaveCount(0);await expect(page.getByRole('heading',{name:vi.common.login,exact:true})).toBeVisible();
});
test('Class subject loading failure is visible and can be retried',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('language','vi'));let outage=true;
 await page.route('**/api/bff/**',route=>{
 const p=new URL(route.request().url()).pathname;
 if(p.endsWith('/auth/me'))return route.fulfill({json:{id:'u',role:'User',fullName:'Teacher',username:'teacher',email:'teacher@example.test'}});
 if(p.endsWith('/classes'))return route.fulfill({json:{items:[],totalPages:1,totalCount:0,pageNumber:1}});
 if(p.endsWith('/subjects'))return route.fulfill({status:outage?503:200,json:outage?{}:[{id:'math',name:'Toán học'}]});
 return route.fulfill({json:[]});});
 await page.goto('/teacher');await page.getByRole('button',{name:vi.club.createClass,exact:true}).click();const dialog=page.getByRole('dialog');await expect(dialog.getByRole('alert')).toContainText(vi.apiErrors.unavailable);
 outage=false;await dialog.getByRole('button',{name:vi.common.retry,exact:true}).click();await expect(dialog.getByRole('alert')).toHaveCount(0);
});
test('Admin subjects do not silently appear empty during an API outage',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('language','vi'));let outage=true;
 await page.route('**/api/bff/**',route=>{
 const p=new URL(route.request().url()).pathname;
 if(p.endsWith('/auth/me'))return route.fulfill({json:{id:'u',role:'Admin',fullName:'Admin',username:'admin',email:'admin@example.test'}});
 if(p.endsWith('/subjects'))return route.fulfill({status:outage?503:200,json:outage?{}:[{id:'math',name:'Toán học',description:'Đại số'}]});
 return route.fulfill({json:[]});});
 await page.goto('/admin');await page.getByRole('button',{name:vi.admin.subjectsTab,exact:true}).click();const alert=page.locator('main [role=alert]').filter({hasText:vi.apiErrors.unavailable});await expect(alert).toBeVisible();outage=false;await alert.getByRole('button',{name:vi.common.retry,exact:true}).click();await expect(page.getByText('Đại số',{exact:true})).toBeVisible();await expect(alert).toHaveCount(0);
});
test('Failed student deletion shows the cause inside confirmation and preserves retry target',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('language','vi'));let attempts=0;
 await page.route('**/api/bff/**',route=>{
 const p=new URL(route.request().url()).pathname;
 if(p.endsWith('/auth/me'))return route.fulfill({json:{id:'u',role:'User',fullName:'Teacher',username:'teacher',email:'teacher@example.test'}});
 if(route.request().method()==='DELETE'){attempts++;return route.fulfill({status:409,json:{errorCode:'ERR_REFERENCE_CONFLICT'}});}
 if(p.endsWith('/students/paged'))return route.fulfill({json:{items:[{id:'s1',firstName:'An',lastName:'Nguyễn',status:1,email:'an@example.test'}],totalPages:1,totalCount:1,pageNumber:1,pageSize:12}});
 return route.fulfill({json:[]});});
 await page.goto('/teacher/students');await page.locator('.campus-record-actions button').last().click();const dialog=page.getByRole('alertdialog');await dialog.getByRole('button',{name:vi.common.delete,exact:true}).click();await expect(dialog.getByRole('alert')).toHaveText(vi.errors.ERR_REFERENCE_CONFLICT);await dialog.getByRole('button',{name:vi.common.delete,exact:true}).click();await expect.poll(()=>attempts).toBe(2);await expect(dialog).toBeVisible();
});
