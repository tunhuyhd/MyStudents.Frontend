import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
test('Clubhouse approved composition',async({page})=>{
 await page.setViewportSize({width:1536,height:1024});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>localStorage.setItem('language','vi'));
 const classes=['Toán lớp 9','Tiếng Anh giao tiếp','Vật lý lớp 12'].map((name,i)=>({id:`c${i}`,name,code:`C${i}`,subjectName:name,studentCount:[12,8,15][i],status:i===2?2:1,category:1,startDate:'2026-09-01',expectedEndDate:'2027-05-31',schedules:[{dayOfWeek:[1,2,5][i],startTime:['17:30:00','19:00:00','18:00:00'][i],durationHours:1.5}]}));
 classes[0].schedules.push({...classes[0].schedules[0],dayOfWeek:4});
 await page.route('**/api/bff/**',async route=>{
 const p=new URL(route.request().url()).pathname.replace('/api/bff','');
 if(p==='/auth/me')return route.fulfill({json:{id:'u1',fullName:'Nguyễn Thu Hà',username:'teacher',role:'User',email:'teacher@example.test'}});
 if(p==='/classes')return route.fulfill({json:{items:classes,totalCount:3,totalPages:1,pageNumber:1,pageSize:9}});
 if(p.endsWith('/students'))return route.fulfill({json:{items:['Minh Anh','Gia Bảo','Phương Linh','Hải Đăng','Ngọc Hà','Đức Duy'].map((fullName,i)=>({id:`s${i}`,fullName}))}});
 return route.fulfill({json:[]});});
 await page.goto('/teacher');await expect(page.locator('.club-class-card')).toHaveCount(3);await expect(page.locator('.club-featured .club-member-name')).toHaveCount(6);await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('.club-featured .club-subject-mark svg')).toHaveAttribute('data-icon','Calculator');
 await expect(page.locator('.club-class-card').nth(1).locator('.club-subject-mark svg')).toHaveAttribute('data-icon','ChatCircle');
 await expect(page.locator('.club-class-card').nth(2).locator('.club-subject-mark svg')).toHaveAttribute('data-icon','Atom');
 await expect(page.locator('.club-more svg').first()).toHaveAttribute('aria-hidden','true');
 await mkdir('.impeccable/review',{recursive:true});await page.screenshot({path:'.impeccable/review/icons-desktop.png'});
});


