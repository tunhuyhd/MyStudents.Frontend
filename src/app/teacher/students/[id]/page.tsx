'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  Edit, 
  Users, 
  UserCircle,
  FileText,
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter, useParams } from 'next/navigation';
import { UserRoles } from '@/constants/roles';
import { studentService, Student, CreateStudentData } from '@/services/studentService';
import StudentModal from '@/components/teacher/StudentModal';

export default function StudentDetailPage() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRoles.User)) {
      router.push('/auth/login');
      return;
    }
    if (user && studentId) fetchStudent();
  }, [user, authLoading, studentId]);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const res = await studentService.getById(studentId);
      setStudent(res.data);
    } catch (err) {
      console.error('Failed to fetch student details', err);
      router.push('/teacher/students');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStudent = async (data: CreateStudentData) => {
    try {
      await studentService.update(studentId, { ...data, id: studentId });
      fetchStudent();
    } catch (err) {
      console.error('Failed to update student', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="p-10 space-y-10 animate-pulse">
        <div className="h-40 bg-white/50 rounded-[3rem] border border-surface-50" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-80 bg-white/50 rounded-[3rem] border border-surface-50" />
          <div className="h-80 bg-white/50 rounded-[3rem] border border-surface-50" />
        </div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="p-6 md:p-10 lg:p-14 space-y-12 pb-32">
      {/* Top Navigation */}
      <div className="flex items-center justify-between relative z-10">
        <button 
          onClick={() => router.push('/teacher/students')}
          className="flex items-center space-x-3 text-surface-400 hover:text-brand-primary font-black transition-all group"
        >
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-xl transition-all">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="uppercase tracking-widest text-xs">{t('common.back') || 'Quay lại'}</span>
        </button>

        <Button 
          onClick={() => setIsModalOpen(true)}
          className="h-14 px-8 rounded-2xl bg-white border border-surface-100 text-surface-800 hover:bg-brand-primary hover:text-white hover:border-brand-primary shadow-sm hover:shadow-xl hover:shadow-brand-primary/20 transition-all duration-300 font-black group"
        >
          <Edit className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" />
          {t('common.edit') || 'Chỉnh sửa hồ sơ'}
        </Button>
      </div>

      {/* Hero Profile Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[4rem] p-10 md:p-14 border border-surface-50 shadow-2xl shadow-brand-primary/5 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700">
          <UserCircle className="w-64 h-64 text-brand-primary rotate-12" />
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-brand-primary/5 rounded-[3.5rem] flex items-center justify-center text-4xl md:text-5xl font-black text-brand-primary shadow-inner">
            {student.firstName.substring(0, 1)}{student.lastName.substring(0, 1)}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="inline-flex items-center px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
              <ShieldCheck className="w-3.5 h-3.5 mr-2" />
              {t('teacher.students.activeStatus') || 'Đang theo học'}
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-surface-900 tracking-tighter leading-none">
              {student.lastName} {student.firstName}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-surface-400 font-bold">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-brand-primary/40" />
                {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('vi-VN') : '---'}
              </div>
              <div className="w-1.5 h-1.5 bg-surface-100 rounded-full" />
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-brand-primary/40" />
                {student.gender === 0 ? 'Nam' : student.gender === 1 ? 'Nữ' : 'Khác'}
              </div>
              <div className="w-1.5 h-1.5 bg-surface-100 rounded-full" />
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-brand-primary/40" />
                Tham gia: {new Date(student.createdOn).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
        {/* Info Card: School & Personal */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[3.5rem] p-10 border border-surface-50 shadow-xl shadow-surface-900/5 space-y-10"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-surface-50 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-brand-primary" />
            </div>
            <h3 className="text-xl font-black text-surface-900 tracking-tight">Học tập & Liên hệ</h3>
          </div>

          <div className="space-y-6">
            <DetailItem 
              icon={<GraduationCap className="w-5 h-5" />} 
              label={t('teacher.students.school') || 'Trường học'} 
              value={student.school || '---'} 
            />
            <DetailItem 
              icon={<Mail className="w-5 h-5" />} 
              label="Email" 
              value={student.email || '---'} 
              isCopyable
            />
            <DetailItem 
              icon={<Phone className="w-5 h-5" />} 
              label="SĐT Học sinh" 
              value={student.phone || '---'} 
              isCopyable
            />
            <DetailItem 
              icon={<MapPin className="w-5 h-5" />} 
              label={t('teacher.students.address') || 'Địa chỉ'} 
              value={student.address || '---'} 
            />
          </div>
        </motion.div>

        {/* Info Card: Family & Guardian */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[3.5rem] p-10 border border-surface-50 shadow-xl shadow-surface-900/5 space-y-10"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-surface-50 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-brand-primary" />
            </div>
            <h3 className="text-xl font-black text-surface-900 tracking-tight">Thông tin Phụ huynh</h3>
          </div>

          <div className="space-y-6">
            <DetailItem 
              icon={<User className="w-5 h-5" />} 
              label={t('teacher.students.parentName') || 'Họ tên phụ huynh'} 
              value={student.parentName || '---'} 
            />
            <DetailItem 
              icon={<Phone className="w-5 h-5" />} 
              label={t('teacher.students.parentPhone') || 'Số điện thoại phụ huynh'} 
              value={student.parentPhone || '---'} 
              isCopyable
            />
          </div>

          {/* Quick Contact Box */}
          <div className="p-8 bg-brand-primary/5 rounded-[2.5rem] border border-brand-primary/10 flex items-center justify-between group cursor-pointer hover:bg-brand-primary/10 transition-all">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-primary shadow-sm group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest opacity-80">Liên hệ ngay</div>
                <div className="text-sm font-black text-surface-900">Gọi cho phụ huynh</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-brand-primary/40 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </div>

      {/* Note Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-[3.5rem] p-10 md:p-14 border border-surface-50 shadow-xl shadow-surface-900/5 space-y-8"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-surface-50 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-brand-primary" />
          </div>
          <h3 className="text-xl font-black text-surface-900 tracking-tight">{t('teacher.students.note') || 'Ghi chú đặc biệt'}</h3>
        </div>
        
        <div className="p-10 bg-surface-50/50 rounded-[2.5rem] border border-surface-100 min-h-[160px]">
          <p className="text-surface-600 font-medium leading-relaxed whitespace-pre-wrap">
            {student.note || 'Không có ghi chú nào cho học sinh này.'}
          </p>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <StudentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStudent}
        initialData={student}
      />
    </div>
  );
}

function DetailItem({ 
  icon, 
  label, 
  value, 
  isCopyable = false 
}: { 
  icon: React.ReactNode, 
  label: string, 
  value: string,
  isCopyable?: boolean
}) {
  return (
    <div className="flex items-start space-x-5 group/item">
      <div className="mt-1 text-surface-400 group-hover/item:text-brand-primary transition-colors">
        {icon}
      </div>
      <div className="flex-1 space-y-1">
        <div className="text-[10px] font-black text-brand-primary/60 uppercase tracking-widest">{label}</div>
        <div className="flex items-center justify-between">
          <div className="text-base font-bold text-surface-800 tracking-tight">{value}</div>
          {isCopyable && value !== '---' && (
            <button className="text-[10px] font-black text-brand-primary uppercase tracking-widest opacity-0 group-hover/item:opacity-100 transition-opacity hover:underline">
              Sao chép
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
