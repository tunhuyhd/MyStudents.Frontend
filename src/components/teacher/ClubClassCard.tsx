'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Edit, MoreHorizontal, Trash2, Users } from '@/components/ui/icons';
import api from '@/lib/api';
import { SubjectIcon } from '@/components/ui/SubjectIcon';
import type { Class } from '@/services/classService';
import { useLanguage } from '@/context/LanguageContext';

type Member={id:string;fullName:string};
export function ClubClassCard({data,index,onEdit,onDelete}:{data:Class;index:number;onEdit:()=>void;onDelete:()=>void}) {
 const {t,language}=useLanguage();
 const [members,setMembers]=useState<Member[]>([]);
 const [failed,setFailed]=useState(false);
 const [attempt,setAttempt]=useState(0);
 const [menu,setMenu]=useState(false);
 const menuRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!menu)return;
  const close=(event:PointerEvent)=>{if(!menuRef.current?.contains(event.target as Node))setMenu(false);};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setMenu(false);menuRef.current?.querySelector('button')?.focus();}};
  document.addEventListener('pointerdown',close);document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape);};
 },[menu]);
 const featured=index===0;
 useEffect(()=>{
  if(index>2||!data.studentCount)return;
  const controller=new AbortController();
  api.get(`/classes/${data.id}/students`,{params:{pageNumber:1,pageSize:6},signal:controller.signal}).then(response=>{
   if(controller.signal.aborted)return;
   const items=(Array.isArray(response.data)?response.data:response.data.items)||[];
   setMembers(items.map((item:{id?:string;Id?:string;fullName?:string;FullName?:string})=>({id:item.id||item.Id||'',fullName:item.fullName||item.FullName||''})).filter((item:Member)=>item.fullName));setFailed(false);
  }).catch(()=>{if(!controller.signal.aborted)setFailed(true);});
  return()=>controller.abort();
 },[data.id,data.studentCount,index,attempt]);
 const tone=index%3===0?'butter':index%3===1?'lilac':'mint';
 const href=`/teacher/class/${data.id}`;
 const schedules=data.schedules||[];
 const dayList=schedules.map(schedule=>t(`days.${schedule.dayOfWeek}`)).join(', ');
 const time=schedules[0]?.startTime?.slice(0,5);
 const remainder=Math.max(0,data.studentCount-members.length);
 return <article className={`club-class-card club-tone-${tone} ${featured?'club-featured':''} ${data.name.length>24?'club-long-name':''}`}>
  <div className="club-card-paint" aria-hidden="true"/>
  <div className="club-card-heading">
    <span className="club-subject-mark"><SubjectIcon subjectName={data.subjectName||''} aria-hidden="true"/></span>
    <div className="club-card-title"><h2><Link href={href}>{data.name}</Link></h2><span className={`club-status ${data.status===1?'is-active':data.status===2?'is-paused':'is-muted'}`}><i aria-hidden="true"/>{t(`teacher.status.${data.status===1?'active':data.status===2?'inactive':data.status===3?'completed':'cancelled'}`)}</span></div>
    <div className="club-card-menu" ref={menuRef}><button type="button" className="club-more" aria-label={`${t('campus.actions')}: ${data.name}`} aria-expanded={menu} onClick={()=>setMenu(!menu)}><MoreHorizontal className="h-5 w-5"/></button>{menu&&<div className="club-popover"><button type="button" onClick={()=>{setMenu(false);onEdit();}}><Edit className="h-4 w-4"/>{t('common.edit')}</button><button type="button" onClick={()=>{setMenu(false);onDelete();}}><Trash2 className="h-4 w-4"/>{t('common.delete')}</button></div>}</div>
  </div>
  <div className="club-card-meta"><span><Users className="h-4 w-4"/>{data.studentCount} {t('club.studentUnit')}</span><span className="club-card-schedule"><CalendarDays className="h-4 w-4"/>{dayList||t('teacher.toBeAnnounced')}{time&&<> · <time>{time}</time></>}</span>{featured&&<Link href={href} className="club-open-class">{t('club.openClass')}<ArrowRight className="h-4 w-4"/></Link>}</div>
  <div className="club-member-area">
    {featured&&<div className="club-member-heading"><span>{t('teacher.details.students')} ({data.studentCount})</span><Link href={href}>{t('club.viewAll')}<ArrowRight className="h-4 w-4"/></Link></div>}
    {members.length>0?<div className="club-members">{members.map((member,i)=><Link key={member.id||i} href={href} className="club-member" title={member.fullName}><span className={`club-initial tone-${i%4}`}>{member.fullName.split(/\s+/).filter(Boolean).map(part=>part[0]).slice(-2).join('')}</span>{featured&&<span className="club-member-name">{member.fullName}</span>}</Link>)}{remainder>0&&<Link href={href} className="club-member"><span className="club-initial tone-rest">+{remainder}</span></Link>}</div>:<div className="club-roster-state">{failed?<><span>{t('club.rosterUnavailable')}</span><button type="button" onClick={()=>setAttempt(value=>value+1)}>{t('common.retry')}</button></>:<span>{data.studentCount?`${data.subjectName} · ${data.code}`:t('club.noStudents')}</span>}</div>}
  </div>
  {featured?<footer className="club-card-footer"><Link href={href}>{t('club.viewClass')}<ArrowRight className="h-4 w-4"/></Link><span>{data.category===0?t('common.online'):t('common.offline')}</span></footer>:<Link href={href} className="club-card-arrow" aria-label={`${t('teacher.viewClass')}: ${data.name}`}><ArrowRight className="h-5 w-5"/></Link>}
  <span className="sr-only">{data.startDate&&new Date(data.startDate).toLocaleDateString(language==='vi'?'vi-VN':'en-US')}</span>
 </article>;
}

