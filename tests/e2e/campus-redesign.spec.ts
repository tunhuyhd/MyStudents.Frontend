import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import en from '../../src/locales/en.json';

const student = { id: 'student-1', firstName: 'An', lastName: 'Nguyễn Minh', email: 'minhan@example.test', phone: '0901234567', gender: 0, school: 'THCS Nguyễn Du', parentName: 'Nguyễn Văn Nam', parentPhone: '0907654321', address: 'Thành phố Hồ Chí Minh', note: 'Ôn tập đại số vào buổi học tiếp theo.', status: 1, createdOn: '2026-08-01', dateOfBirth: '2012-04-15' };
const classes = [
  { id:'class-1', name:'Toán lớp 9 — Ôn thi học kỳ', code:'TOAN09', subjectId:'subject-1', subjectName:'Toán học', studentCount:12, status:1, category:1, startDate:'2026-09-01', expectedEndDate:'2027-05-31', schedules:[{id:'schedule-1',dayOfWeek:1,startTime:'17:30:00',durationHours:1.5},{id:'schedule-2',dayOfWeek:4,startTime:'17:30:00',durationHours:1.5}] },
  { id:'class-2', name:'Tiếng Anh giao tiếp', code:'ENG02', subjectId:'subject-2', subjectName:'Tiếng Anh', studentCount:8, status:2, category:0, startDate:'2026-09-03', expectedEndDate:'2027-05-31', schedules:[{id:'schedule-3',dayOfWeek:2,startTime:'19:00:00',durationHours:1.5}] },
];
const paged = (items: unknown[]) => ({ items, pageNumber:1, pageSize:12, totalCount:items.length,totalPages:1,hasNextPage:false,hasPreviousPage:false });

for (const width of [1440,390,320]) {
 test(`Clubhouse routes and record actions at ${width}px`, async ({ page }) => {
  test.setTimeout(180000);
  await page.setViewportSize({width,height:1000});
  await page.emulateMedia({reducedMotion:'reduce'});
  let role: 'User'|'Admin'|null = null;
  const errors: string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{ if(!localStorage.getItem('language')) localStorage.setItem('language','vi'); });
  await page.route('**/api/bff/**', async route => {
   const url=new URL(route.request().url());const routePath=url.pathname.replace('/api/bff','');
   const user={id:'user-1',username:'teacher',fullName:'Nguyễn Thu Hà',email:'teacher@example.test',role:role||'User',imageUrl:null};
   if(routePath==='/auth/me')return role?route.fulfill({json:user}):route.fulfill({status:401,json:{}});
   if(routePath==='/classes')return route.fulfill({json:paged(classes)});
   if(routePath==='/classes/class-1')return route.fulfill({json:{...classes[0],students:[],sessions:[{id:'session-1',date:'2026-11-02',startTime:'17:30:00',endTime:'19:00:00',status:1,orderIndex:1,presentCount:10,totalCount:12}]}});
   if(routePath==='/classes/class-1/students')return route.fulfill({json:paged([{id:student.id,fullName:'Nguyễn Minh An',email:student.email,status:1,joinedAt:'2026-09-01'}])});
   if(routePath==='/students/paged')return route.fulfill({json:paged([student,{...student,id:"student-2",firstName:"Linh",lastName:"Trần Ngọc",email:"linh@example.test"}])});
   if(routePath==='/students/student-1')return route.fulfill({json:student});
   if(routePath==='/subjects')return route.fulfill({json:[{id:'subject-1',name:'Toán học',description:'Đại số và hình học'},{id:'subject-2',name:'Tiếng Anh',description:'Ngữ pháp và giao tiếp'}]});
   if(routePath==='/admin/users')return route.fulfill({json:[{...user,roleId:'role-1',roleName:'User',status:1}]});
   if(routePath==='/admin/roles')return route.fulfill({json:[{id:'role-1',name:'User'},{id:'role-2',name:'Admin'}]});
   return route.fulfill({json:[]});
  });
  const output=path.resolve('.impeccable/review');await mkdir(output,{recursive:true});
  async function capture(name:string) {
   await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await expect(page.locator('h1')).toBeVisible();
   await page.screenshot({path:path.join(output,`${name}-${width}.png`),fullPage:true});
   expect(errors,`${name} console errors`).toEqual([]);
  }
  for(const [name,route] of [['home','/'],['login','/auth/login'],['register','/auth/register'],['forgot','/auth/forgot-password'],['reset','/auth/reset-password'],['admin-login','/admin/login']]){
   await page.goto(route);await capture(name);
  }
  role='User';await page.goto('/teacher');await expect(page.locator('.club-class-card').first()).toContainText(classes[0].name);await capture('classes');
  if(width===1440||width===390)await page.screenshot({path:path.join(output,width===1440?'desktop.png':'mobile.png'),fullPage:true});
  await page.getByRole('button',{name:"Tạo lớp học",exact:true}).first().click();await expect(page.getByRole('dialog')).toBeVisible();
  await page.screenshot({path:path.join(output,`class-modal-${width}.png`),fullPage:true});await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goto('/teacher/students');await expect(page.getByText('Nguyễn Minh An',{exact:true})).toBeVisible();await capture('students');
  for(const article of await page.locator('.campus-record').all()){
    const contained=await article.evaluate(node=>{const box=node.getBoundingClientRect();return [...node.children].every(child=>{const childBox=child.getBoundingClientRect();return childBox.right<=box.right+1 && childBox.left>=box.left-1;});});expect(contained).toBe(true);
  }
  await page.getByRole('button',{name:"Thêm học sinh",exact:true}).first().click();await expect(page.getByRole('dialog')).toBeVisible();await page.screenshot({path:path.join(output,`student-modal-${width}.png`),fullPage:true});await page.keyboard.press('Escape');
  await page.goto('/teacher/students/student-1');await capture('student-detail');
  await page.goto('/teacher/class/class-1');await expect(page.getByRole('heading',{name:classes[0].name})).toBeVisible();await capture('class-detail');
  await page.goto('/me');await capture('profile');
  role='Admin';await page.goto('/admin');await expect(page.getByRole('cell').filter({hasText:'Nguyễn Thu Hà'}).first()).toBeVisible();await capture('admin');
  await page.getByRole('button',{name:'Môn học',exact:true}).click();await expect(page.getByText('Đại số và hình học')).toBeVisible();await page.screenshot({path:path.join(output,`subjects-${width}.png`),fullPage:true});
  await page.getByRole('button',{name:'Thêm môn học',exact:true}).click();await expect(page.getByRole('textbox',{name:'Tên môn học'})).toBeVisible();
  await page.goto('/auth/login');await page.getByRole('button',{name:/^(EN|ENGLISH)$/}).click();await expect(page.getByRole('heading',{name:en.common.login,exact:true})).toBeVisible();await capture('login-en');
  role='User';await page.goto('/teacher');await expect(page.getByRole('heading',{name:`${en.club.titleOne} ${en.club.titleTwo}`,exact:true})).toBeVisible();await capture('classes-en');
  await page.goto('/teacher/students');await page.getByRole('button',{name:en.teacher.students.addBtn,exact:true}).click();await expect(page.getByRole('dialog')).toContainText(en.teacher.students.basicInfo);
  await expect(page.getByLabel(en.auth.firstName,{exact:false})).toBeVisible();
  const contrast=await page.locator('input[placeholder="student@example.com"]').evaluate(input=>{
    const style=getComputedStyle(input);const placeholder=getComputedStyle(input,'::placeholder');const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const context=canvas.getContext('2d')!;
    const color=(css:string)=>{context.fillStyle='#ffffff';context.fillRect(0,0,1,1);context.fillStyle=css;context.fillRect(0,0,1,1);return [...context.getImageData(0,0,1,1).data].slice(0,3);};
    const luminance=(rgb:number[])=>{const [r,g,b]=rgb.map(value=>{const c=value/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});return .2126*r+.7152*g+.0722*b;};
    const a=luminance(color(style.backgroundColor)),b=luminance(color(placeholder.color));return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  });expect(contrast).toBeGreaterThanOrEqual(4.5);
  await page.screenshot({path:path.join(output,`student-modal-en-${width}.png`),fullPage:true});await page.keyboard.press('Escape');
  await page.goto('/auth/forgot-password');await expect(page.getByRole('heading',{name:en.auth.forgotPassword,exact:true})).toBeVisible();await capture('forgot-en');
 });
}
