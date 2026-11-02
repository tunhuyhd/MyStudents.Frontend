import type { IconProps } from '@phosphor-icons/react';
import { Atom, BookOpen, Calculator, ChatCircle, Code, Compass, Flask, Leaf, MusicNote, Palette } from './icons';
import { getSubjectKind } from '@/lib/subjectIcon';

const glyphs = { Atom, BookOpen, Calculator, ChatCircle, Code, Compass, Flask, Leaf, MusicNote, Palette };
export function SubjectIcon({ subjectName, ...props }: IconProps & { subjectName: string }) {
  const Glyph = glyphs[getSubjectKind(subjectName)];
  return <Glyph {...props} />;
}
