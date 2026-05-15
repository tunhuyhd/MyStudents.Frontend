'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Users, Calendar, Clock, ChevronLeft, 
  Plus, Search, MoreVertical, CheckCircle2, AlertCircle,
  Mail, GraduationCap, MapPin, Hash, ArrowRight, X, Loader2, Sparkles
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import ClassModal from '@/components/teacher/ClassModal';
import { classService, CreateClassData, Class } from '@/services/classService';
import AddStudentToClassModal from '@/components/teacher/AddStudentToClassModal';
import StatusDropdown from '@/components/teacher/StatusDropdown';
import RecordSessionModal from '@/components/teacher/RecordSessionModal';

interface StudentSummary {
  id: string;
  fullName: string;
  email: string;
  status: number;
}

interface Session {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: number;
  orderIndex: number;
  note?: string;
  presentCount: number;
  totalCount: number;
}

interface ClassDetail {
  id: string;
  name: string;
  code: string;
  status: number;
  category: number;
  subjectId: string;
  subjectName: string;
  startDate: string;
  expectedEndDate: string;
  studentCount: number;
  schedules: any[];
  students: StudentSummary[];
  sessions: Session[];
}

export default function ClassDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'sessions'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(undefined);
  const [updatingStudentId, setUpdatingStudentId] = useState<string | null>(null);

  const fetchClassDetail = async () => {
    try {
      const response = await api.get(`/classes/${id}`);
      const data = response.data;
      const normalizedData = {
        ...data,
        status: data.status !== undefined ? data.status : data.Status,
        category: data.category !== undefined ? data.category : data.Category,
        subjectId: data.subjectId || data.SubjectId,
        students: data.students || data.Students || [],
        sessions: data.sessions || data.Sessions || [],
        schedules: data.schedules || data.Schedules || []
      };
      setClassData(normalizedData);
    } catch (error) {
      console.error('Error fetching class detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchClassDetail();
  }, [id]);

  const handleSaveClass = async (data: CreateClassData) => {
    try {
      if (classData) {
        await classService.update(classData.id, { ...data, id: classData.id });
        await fetchClassDetail();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to save class', err);
      throw err;
    }
  };

  const handleAddStudent = async (studentId: string) => {
    try {
      await classService.addStudent(id as string, studentId);
      await fetchClassDetail();
    } catch (err) {
      console.error('Failed to add student to class', err);
      throw err;
    }
  };

  const handleUpdateStudentStatus = async (studentId: string, status: number) => {
    setUpdatingStudentId(studentId);
    try {
      await classService.updateStudentStatus(id as string, studentId, status);
      await fetchClassDetail();
    } catch (err) {
      console.error('Failed to update student status', err);
    } finally {
      setUpdatingStudentId(null);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa học sinh này khỏi lớp?')) return;
    setUpdatingStudentId(studentId);
    try {
      await classService.removeStudent(id as string, studentId);
      await fetchClassDetail();
    } catch (err) {
      console.error('Failed to remove student from class', err);
    } finally {
      setUpdatingStudentId(null);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const getEndTime = (startTime: string, duration: number) => {
    if (!startTime) return '';
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + duration * 60;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = Math.floor(totalMinutes % 60);
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1: return { label: 'Đang học', color: 'bg-green-100 text-green-600' };
      case 2: return { label: 'Bảo lưu', color: 'bg-surface-100 text-surface-500' };
      case 3: return { label: 'Hoàn thành', color: 'bg-brand-primary/10 text-brand-primary' };
      case 4: return { label: 'Nghỉ học', color: 'bg-red-100 text-red-500' };
      default: return { label: 'Không rõ', color: 'bg-surface-50 text-surface-400' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!classData) return null;

  const tabs = [
    { id: 'overview', label: t('teacher.details.overview'), icon: BookOpen },
    { id: 'students', label: t('teacher.details.students'), icon: Users },
    { id: 'sessions', label: t('teacher.details.sessions'), icon: Calendar },
  ];

  const today = new Date().toISOString().split('T')[0];
  const todaySession = classData.sessions.find(s => s.date === today);
  const otherSessions = classData.sessions
    .filter(s => s.date !== today)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <main className="min-h-screen pb-20 px-6 pt-0 lg:pt-4 relative overflow-hidden bg-transparent max-w-7xl mx-auto">
      <div className="mb-12">
          <button 
            onClick={() => router.back()}
            className="group flex items-center text-surface-400 hover:text-brand-primary transition-colors mb-6 font-bold text-sm uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t('common.back')}
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-primary/10 rounded-full border border-brand-primary/20">
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">
                  {classData.subjectName}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-surface-900 tracking-tighter leading-tight md:leading-none">
                {classData.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 md:gap-8 text-surface-400 font-bold">
                <div className="flex items-center">
                  <Hash className="w-4 h-4 mr-2 text-brand-primary/40" />
                  <span>{classData.code}</span>
                </div>
                <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                  classData.status === 1 ? 'bg-green-50 text-green-600 border-green-100' :
                  classData.status === 2 ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                  classData.status === 3 ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' :
                  'bg-red-50 text-red-600 border-red-100'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    classData.status === 1 ? 'bg-green-500' :
                    classData.status === 2 ? 'bg-yellow-500' :
                    classData.status === 3 ? 'bg-brand-primary' :
                    'bg-red-500'
                  }`} />
                  <span>{
                    classData.status === 1 ? t('teacher.status.active') :
                    classData.status === 2 ? t('teacher.status.inactive') :
                    classData.status === 3 ? t('teacher.status.completed') :
                    t('teacher.status.cancelled')
                  }</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-brand-primary/40" />
                  <span>{classData.studentCount} {t('teacher.details.students')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button variant="outline" onClick={() => setIsModalOpen(true)} className="w-full md:w-auto rounded-[1.5rem] px-8 h-14 border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5">
                {t('common.edit')}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center p-1.5 bg-white/50 backdrop-blur-xl border border-white rounded-[2rem] md:rounded-[2.5rem] mb-12 overflow-x-auto scrollbar-hide max-w-full">
          <div className="flex items-center min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center space-x-3 px-4 md:px-8 py-3 md:py-4 rounded-[1.25rem] md:rounded-[1.75rem] font-black text-sm transition-all duration-500 ${
                activeTab === tab.id ? 'text-white' : 'text-surface-400 hover:text-surface-600'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-tab-bg"
                  className="absolute inset-0 bg-brand-primary rounded-[1.25rem] md:rounded-[1.75rem] shadow-xl shadow-brand-primary/30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10 uppercase tracking-widest whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
          </div>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-white shadow-xl shadow-surface-900/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-[5rem] transition-all group-hover:w-40 group-hover:h-40" />
                  <h3 className="text-2xl font-black text-surface-900 mb-8 flex items-center">
                    <Calendar className="w-6 h-6 mr-4 text-brand-primary" />
                    {t('teacher.details.schedule')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classData.schedules.map((s, i) => (
                      <div key={i} className="flex items-center p-6 bg-surface-50/50 rounded-3xl border border-surface-100/50 hover:bg-white hover:shadow-lg transition-all duration-500 group/card">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mr-6 group-hover/card:rotate-6 transition-transform">
                          <Clock className="w-6 h-6 text-brand-primary" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-surface-400 uppercase tracking-widest mb-1">{t(`days.${s.dayOfWeek}`)}</div>
                          <div className="text-lg font-black text-surface-900">{formatTime(s.startTime)} — {getEndTime(s.startTime, s.durationHours)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'students' && (
              <motion.div key="students" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/80 backdrop-blur-2xl rounded-[3.5rem] border border-white shadow-xl shadow-surface-900/5 overflow-hidden min-h-[600px] flex flex-col">
                <div className="p-8 border-b border-surface-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input type="text" placeholder={t('teacher.details.searchStudents')} className="w-full h-14 pl-14 pr-6 bg-surface-50/50 rounded-2xl border-none text-sm font-bold placeholder:text-surface-300 focus:ring-2 focus:ring-brand-primary/20 transition-all" />
                  </div>
                  <Button onClick={() => setIsAddStudentModalOpen(true)} variant="outline" className="rounded-2xl h-14 px-6 border-surface-100 text-surface-600 font-bold hover:bg-surface-50">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('teacher.details.addStudent')}
                  </Button>
                </div>
                <div className="overflow-x-auto flex-1">
                  {classData?.students?.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-50/30">
                          <th className="px-8 py-6 text-[10px] font-black text-surface-400 uppercase tracking-widest">{t('auth.fullName')}</th>
                          <th className="px-8 py-6 text-[10px] font-black text-surface-400 uppercase tracking-widest">Trạng thái</th>
                          <th className="px-8 py-6 text-[10px] font-black text-surface-400 uppercase tracking-widest text-right">{t('teacher.actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-50">
                        {classData.students.map((student) => {
                          const statusInfo = getStatusLabel(student.status);
                          return (
                            <tr key={student.id} className="hover:bg-brand-primary/[0.02] transition-colors group">
                              <td className="px-8 py-6">
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary font-black text-xs group-hover:scale-110 transition-transform">
                                    {student.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                  </div>
                                  <span className="font-black text-surface-900">{student.fullName}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusInfo.color}`}>{statusInfo.label}</div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <div className="flex items-center justify-end space-x-4">
                                  <StatusDropdown 
                                    value={student.status}
                                    onChange={(val) => handleUpdateStudentStatus(student.id, val)}
                                    disabled={updatingStudentId === student.id}
                                  />
                                  <button onClick={() => handleRemoveStudent(student.id)} disabled={updatingStudentId === student.id} className="p-3 hover:bg-red-50 rounded-xl text-surface-300 hover:text-red-500 transition-all group/delete" title="Xóa khỏi lớp">
                                    {updatingStudentId === student.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5 group-hover/delete:scale-110 transition-transform" />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-32 text-center">
                      <div className="w-20 h-20 bg-surface-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 animate-float">
                        <Users className="w-10 h-10 text-surface-200" />
                      </div>
                      <p className="text-surface-400 font-bold">{t('teacher.details.noStudents')}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'sessions' && (
              <motion.div key="sessions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <style dangerouslySetInnerHTML={{ __html: `
                  @keyframes pulse-highlight {
                    0% { border-color: rgba(var(--brand-primary-rgb), 0.2); box-shadow: 0 0 0 0 rgba(var(--brand-primary-rgb), 0.2); }
                    50% { border-color: rgba(var(--brand-primary-rgb), 0.8); box-shadow: 0 0 30px 0 rgba(var(--brand-primary-rgb), 0.4); }
                    100% { border-color: rgba(var(--brand-primary-rgb), 0.2); box-shadow: 0 0 0 0 rgba(var(--brand-primary-rgb), 0.2); }
                  }
                  .animate-pulse-highlight {
                    animation: pulse-highlight 2s infinite ease-in-out;
                    border-width: 3px !important;
                  }
                `}} />
                
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-2xl font-black text-surface-900">{t('teacher.details.sessions')}</h3>
                  <Button 
                    onClick={() => {
                      setSelectedSessionId(undefined);
                      setIsRecordModalOpen(true);
                    }}
                    className="rounded-2xl h-14 px-8 shadow-xl shadow-brand-primary/20"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {t('teacher.details.recordSession')}
                  </Button>
                </div>

                {/* Today's Special Session Card */}
                {todaySession && (
                  <div className="relative group">
                    <div className="absolute -top-4 left-8 px-4 py-1 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full z-30 shadow-lg flex items-center">
                      <Sparkles className="w-3 h-3 mr-2 animate-spin-slow" />
                      Hôm nay
                    </div>
                    <div 
                      onClick={() => {
                        setSelectedSessionId(todaySession.id);
                        setIsRecordModalOpen(true);
                      }}
                      className="bg-white p-12 rounded-[3.5rem] border-brand-primary/40 animate-pulse-highlight flex flex-col md:flex-row md:items-center justify-between gap-10 group hover:scale-[1.01] transition-all duration-500 cursor-pointer shadow-2xl shadow-brand-primary/10"
                    >
                      <div className="flex items-center gap-10">
                        <div className="w-24 h-24 bg-brand-primary/10 rounded-[2.5rem] flex flex-col items-center justify-center border border-brand-primary/20">
                          <span className="text-3xl font-black text-brand-primary">{todaySession.date.split('-')[2]}</span>
                          <span className="text-[10px] font-black text-brand-primary/60 uppercase tracking-widest">{todaySession.date.split('-')[1]}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm font-black text-brand-primary uppercase tracking-[0.2em]">
                            <Clock className="w-4 h-4 mr-2" />
                            {formatTime(todaySession.startTime)} - {formatTime(todaySession.endTime)}
                          </div>
                          <div className="text-3xl font-black text-surface-900">
                            Buổi {todaySession.orderIndex.toString().padStart(2, '0')}
                            {todaySession.note && <span className="text-surface-400 font-bold ml-4 text-xl">— {todaySession.note}</span>}
                          </div>
                          <div className="flex items-center text-sm font-bold text-surface-400">
                            <Users className="w-4 h-4 mr-2 opacity-50" />
                            {todaySession.presentCount}/{todaySession.totalCount} {t('teacher.details.present')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest flex items-center ${todaySession.status === 2 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                          {todaySession.status === 2 ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
                          {todaySession.status === 2 ? t('teacher.details.completed') : 'Đang diễn ra'}
                        </div>
                        <Button className="rounded-2xl h-16 px-10 shadow-xl shadow-brand-primary/30 group/btn">
                          {t('common.viewDetails') || 'Details'}
                          <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Sessions List */}
                <div className="grid grid-cols-1 gap-6">
                  {otherSessions.length > 0 ? (
                    otherSessions.map((session) => (
                      <div 
                        key={session.id} 
                        onClick={() => {
                          setSelectedSessionId(session.id);
                          setIsRecordModalOpen(true);
                        }}
                        className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white shadow-xl shadow-surface-900/5 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-500 cursor-pointer"
                      >
                        <div className="flex items-center gap-8">
                          <div className="w-20 h-20 bg-surface-50 rounded-[2rem] flex flex-col items-center justify-center group-hover:bg-brand-primary/5 transition-colors">
                            <span className="text-xl font-black text-surface-900">{session.date.split('-')[2]}</span>
                            <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">{session.date.split('-')[1]}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center text-xs font-black text-brand-primary uppercase tracking-[0.2em] mb-1">
                              <Clock className="w-3 h-3 mr-2" />
                              {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </div>
                            <div className="text-xl font-black text-surface-900">
                              Buổi {session.orderIndex.toString().padStart(2, '0')}
                              {session.note && <span className="text-surface-400 font-bold ml-3 text-base">— {session.note}</span>}
                            </div>
                            <div className="flex items-center text-xs font-bold text-surface-400">
                              <Users className="w-3 h-3 mr-2 opacity-50" />
                              {session.presentCount}/{session.totalCount} {t('teacher.details.present')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center ${session.status === 2 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                            {session.status === 2 ? <CheckCircle2 className="w-3 h-3 mr-2" /> : <AlertCircle className="w-3 h-3 mr-2" />}
                            {session.status === 2 ? t('teacher.details.completed') : t('teacher.details.scheduled')}
                          </div>
                          <Button variant="outline" className="rounded-xl h-12 px-6 border-surface-100 text-surface-600 hover:bg-surface-50 group/more">
                            {t('common.viewDetails') || 'Details'}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover/more:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    !todaySession && (
                      <div className="py-32 bg-white/80 backdrop-blur-2xl rounded-[3.5rem] border border-white text-center">
                        <div className="w-20 h-20 bg-surface-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 animate-float">
                          <Calendar className="w-10 h-10 text-surface-200" />
                        </div>
                        <p className="text-surface-400 font-bold">{t('teacher.details.noSessions')}</p>
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      <AddStudentToClassModal 
        isOpen={isAddStudentModalOpen} 
        onClose={() => setIsAddStudentModalOpen(false)} 
        onAdd={handleAddStudent} 
        classId={id as string}
      />

      <RecordSessionModal 
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={fetchClassDetail}
        classId={id as string}
        sessionId={selectedSessionId}
      />

      <ClassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveClass} 
        initialData={classData as any as Class} 
      />
    </main>
  );
}
