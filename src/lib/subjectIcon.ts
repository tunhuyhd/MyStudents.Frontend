/** Match the actual subject; an unknown subject gets an honest generic book. */
export function getSubjectKind(subjectName: string) {
  const subject = subjectName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd');
  if (/toan|math|algebra|geometry|calculus/.test(subject)) return 'Calculator' as const;
  if (/tieng anh|english|ngoai ngu|language|tieng (phap|han|nhat|trung)/.test(subject)) return 'ChatCircle' as const;
  if (/vat ly|physics/.test(subject)) return 'Atom' as const;
  if (/hoa hoc|chemistry/.test(subject)) return 'Flask' as const;
  if (/sinh hoc|biology/.test(subject)) return 'Leaf' as const;
  if (/tin hoc|computer|coding|programming/.test(subject)) return 'Code' as const;
  if (/my thuat|art|drawing/.test(subject)) return 'Palette' as const;
  if (/am nhac|music/.test(subject)) return 'MusicNote' as const;
  if (/dia ly|geography|history|lich su/.test(subject)) return 'Compass' as const;
  return 'BookOpen' as const;
}
