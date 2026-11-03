import type { Metadata } from 'next';
import { Handbook } from './Handbook';

export const metadata: Metadata = {
  title: 'Hướng dẫn sử dụng | My Student',
  description: 'Hướng dẫn dành cho giáo viên: quản lý lớp học, học sinh, lịch dạy, điểm danh và tài khoản My Student.',
};

export default function HandbookPage() {
  return <Handbook />;
}
