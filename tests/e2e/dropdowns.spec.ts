import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import vi from '../../src/locales/vi.json';
import en from '../../src/locales/en.json';
for(const width of [320,390,1440])for(const language of ['vi','en'] as const)test(`Custom dropdowns at ${width}px (${language})`,async({page})=>{
 const copy=language==='vi'?vi:en;let role='User',roleId='user';const statuses:string[]=[];
 await page.setViewportSize({width,height:900});await page.addInitScript(lang=>localStorage.setItem('language',lang),language);await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('**/api/bff/**',async route=>{
 const u=new URL(route.request().url()),p=u.pathname;
 if(p.endsWith('/auth/me'))return route.fulfill({json:{id:'me',role,fullName:'Giáo viên',username:'teacher',email:'teacher@example.test'}});
 if(p.endsWith('/students/paged')){statuses.push(u.searchParams.get('status')||'');return route.fulfill({json:{items:[],totalCount:0,totalPages:1,pageNumber:1,pageSize:12}});}
 if(p.endsWith('/admin/users/u1/role')){roleId=route.request().postDataJSON();return route.fulfill({json:{}});}
 if(p.endsWith('/admin/users'))return route.fulfill({json:[{id:'u1',username:'teacher',fullName:'Nguyễn An',email:'teacher@example.test',roleId,status:1}]});
 if(p.endsWith('/admin/roles'))return route.fulfill({json:[{id:'admin',name:'Admin'},{id:'user',name:'User'}]});
 return route.fulfill({json:[]});});
 await page.goto('/teacher/students');const filter=page.getByRole('combobox',{name:copy.teacher.students.statusFilter,exact:true});await expect(filter).toBeVisible();await expect(page.locator('select')).toHaveCount(0);
 await filter.press('ArrowDown');await expect(page.getByRole('listbox')).toBeVisible();await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await expect(filter).toHaveText(copy.teacher.status.active);await expect.poll(()=>statuses.at(-1)).toBe('1');
 await filter.click();await page.keyboard.press('End');await page.keyboard.press('Enter');await expect(filter).toHaveText(copy.teacher.status.inactive);await expect.poll(()=>statuses.at(-1)).toBe('2');
 await filter.click();await page.keyboard.press('Escape');await expect(filter).toBeFocused();await expect(page.getByRole('listbox')).toHaveCount(0);
 await filter.click();await page.getByRole('heading',{level:1}).click();await expect(page.getByRole('listbox')).toHaveCount(0);
 await mkdir('.impeccable/review',{recursive:true});await filter.click();await expect(page.getByRole('option',{selected:true})).toHaveText(copy.teacher.status.inactive);
 async function capture(name:string){const list=page.getByRole('listbox');await expect(list).toBeVisible();const box=await list.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width);expect(box!.y+box!.height).toBeLessThanOrEqual(900);await page.screenshot({path:`.impeccable/review/dropdowns-${name}-${language}-${width}.png`,fullPage:true});}
 await capture('students');await filter.press('Tab');await expect(page.getByRole('listbox')).toHaveCount(0);
 role='Admin';await page.goto('/admin');const chooser=page.getByRole('combobox',{name:copy.admin.selectRole,exact:true});await chooser.scrollIntoViewIfNeeded();await chooser.click();await capture('admin');await page.getByRole('option',{name:'Admin',exact:true}).click();await expect(chooser).toHaveText('Admin');await expect(chooser).toBeEnabled();expect(roleId).toBe('admin');await expect(page.locator('select')).toHaveCount(0);
});
for(const width of [390,1440])test(`Enrollment dropdown uses the shared menu and numeric API status at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.addInitScript(()=>localStorage.setItem('language','vi'));let status=1;let release=()=>{};const pending=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/api/bff/**',async route=>{
 const p=new URL(route.request().url()).pathname;
 if(p.endsWith('/auth/me'))return route.fulfill({json:{id:'me',role:'User',fullName:'Giáo viên',username:'teacher',email:'teacher@example.test'}});
 if(p.endsWith('/classes/c/students/s')){status=route.request().postDataJSON();await pending;return route.fulfill({json:true});}
 if(p.endsWith('/classes/c/students'))return route.fulfill({json:{items:[{id:'s',fullName:'Nguyễn An',email:'an@example.test',status,joinedAt:'2026-09-01'}],totalCount:1,totalPages:1}});
 if(p.endsWith('/classes/c'))return route.fulfill({json:{id:'c',name:'Toán lớp 9',code:'T9',subjectName:'Toán',status:1,category:1,studentCount:1,startDate:'2026-09-01',expectedEndDate:'2027-05-31',schedules:[],sessions:[]}});
 return route.fulfill({json:[]});});
 await page.goto('/teacher/class/c');await page.getByRole('button',{name:vi.teacher.details.students,exact:true}).click();const chooser=page.getByRole('combobox',{name:vi.enrollmentStatus.label,exact:true});await chooser.scrollIntoViewIfNeeded();await chooser.click();await expect(page.getByRole('listbox')).toBeVisible();await page.screenshot({path:`.impeccable/review/dropdowns-enrollment-${width}.png`,fullPage:true});await page.getByRole('option',{name:vi.enrollmentStatus.paused,exact:true}).click();await expect(chooser).toBeDisabled();await expect(page.getByRole('listbox')).toHaveCount(0);release();await expect(chooser).toBeEnabled();await expect(chooser).toHaveText(vi.enrollmentStatus.paused);expect(status).toBe(2);
});
