'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Check, UserX, Clock, AlertCircle, 
  Save, Loader2, Calendar, Clock as ClockIcon, FileText, ArrowRight, ChevronLeft, Settings2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { classService } from '@/services/classService';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  status: number;
  note?: string;
}

interface RecordSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classId: string;
  sessionId?: string;
  initialData?: {
    date: string;
    startTime: string;
    endTime: string;
    note?: string;
  };
}

export default function RecordSessionModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  classId,
  sessionId: initialSessionId,
  initialData
}: RecordSessionModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<'details' | 'attendance'>(initialSessionId ? 'attendance' : 'details');
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [sessionData, setSessionData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    startTime: initialData?.startTime || '08:00',
    endTime: initialData?.endTime || '10:00',
    note: initialData?.note || ''
  });

  const [attendances, setAttendances] = useState<Attendance[]>([]);

  useEffect(() => {
    const initModal = async () => {
      setError(null);
      if (sessionId) {
        setLoading(true);
        try {
          try {
            const response = await api.get(`/sessions/${sessionId}`);
            const data = response.data;
            setSessionData({
              date: data.date.substring(0, 10),
              startTime: data.startTime.substring(0, 5),
              endTime: data.endTime.substring(0, 5),
              note: data.note || ''
            });
          } catch (e) {
            console.warn('Session detail endpoint failed, using initial values if available');
          }
          
          const attRes = await classService.getSessionAttendances(sessionId);
          setAttendances(attRes.data);
          // Only switch to attendance if it's an existing session being opened
          if (isOpen && initialSessionId) setStep('attendance');
        } catch (error: any) {
          console.error('Error loading session data:', error);
          setError('Không thể tải dữ liệu điểm danh. Vui lòng kiểm tra lại kết nối.');
        } finally {
          setLoading(false);
        }
      } else {
        setStep('details');
        await loadScheduleDefaults(sessionData.date);
      }
    };

    if (isOpen) {
      initModal();
    } else {
      setSessionId(initialSessionId);
      if (initialData) {
        setSessionData({
          date: initialData.date,
          startTime: initialData.startTime,
          endTime: initialData.endTime,
          note: initialData.note || ''
        });
      }
    }
  }, [sessionId, isOpen, classId, initialSessionId, initialData]);

  const loadScheduleDefaults = async (dateStr: string) => {
    try {
      const response = await api.get(`/classes/${classId}`);
      const classData = response.data;
      const schedules = classData.schedules || classData.Schedules || [];
      
      if (schedules.length > 0) {
        const selectedDate = new Date(dateStr);
        const dayOfWeek = selectedDate.getDay();
        const matchingSchedule = schedules.find((s: any) => s.dayOfWeek === dayOfWeek);
        
        const targetSchedule = matchingSchedule || schedules[0];
        const start = targetSchedule.startTime.substring(0, 5);
        
        const [h, m] = start.split(':').map(Number);
        const totalMinutes = h * 60 + m + (targetSchedule.durationHours * 60);
        const endH = Math.floor(totalMinutes / 60) % 24;
        const endM = Math.floor(totalMinutes % 60);
        const end = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
        
        setSessionData(prev => ({
          ...prev,
          date: dateStr,
          startTime: start,
          endTime: end
        }));
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const handleDateChange = (newDate: string) => {
    setSessionData(prev => ({ ...prev, date: newDate }));
    loadScheduleDefaults(newDate);
  };

  const handleCreateOrUpdateSession = async () => {
    setError(null);
    if (!sessionData.date) {
      setError('Vui lòng chọn ngày học');
      return;
    }

    setSaving(true);
    try {
      if (sessionId) {
        // Update existing session
        await api.put(`/sessions/${sessionId}`, {
          ...sessionData,
          id: sessionId,
          classId
        });
        
        // After update, if we were in details step, go to attendance
        const attRes = await classService.getSessionAttendances(sessionId);
        setAttendances(attRes.data);
        setStep('attendance');
      } else {
        // Create new session
        const res = await classService.createSession({
          ...sessionData,
          classId
        });
        const newSessionId = res.data;
        setSessionId(newSessionId);
        
        const attRes = await classService.getSessionAttendances(newSessionId);
        setAttendances(attRes.data);
        setStep('attendance');
      }
    } catch (err: any) {
      console.error('Failed to save session', err);
      setError(err.response?.data?.message || 'Không thể lưu buổi học. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (attendanceId: string, status: number) => {
    const oldAttendances = [...attendances];
    setAttendances(attendances.map(a => 
      a.id === attendanceId ? { ...a, status } : a
    ));

    try {
      await classService.updateAttendance({ attendanceId, status });
    } catch (err) {
      console.error('Failed to update attendance', err);
      setAttendances(oldAttendances);
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1: return <Check className="w-5 h-5" />;
      case 2: return <UserX className="w-5 h-5" />;
      case 3: return <Clock className="w-5 h-5" />;
      case 4: return <AlertCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  const statusList = [
    { value: 1, label: 'Có mặt', color: 'text-green-600', bg: 'bg-green-50', hover: 'hover:text-green-600 hover:bg-green-50' },
    { value: 2, label: 'Vắng mặt', color: 'text-red-600', bg: 'bg-red-50', hover: 'hover:text-red-600 hover:bg-red-50' },
    { value: 3, label: 'Muộn', color: 'text-amber-600', bg: 'bg-amber-50', hover: 'hover:text-amber-600 hover:bg-amber-50' },
    { value: 4, label: 'Có phép', color: 'text-blue-600', bg: 'bg-blue-50', hover: 'hover:text-blue-600 hover:bg-blue-50' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-surface-900/60 backdrop-blur-md"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl bg-white md:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-surface-50 flex items-center justify-between bg-white relative z-20">
            <div className="flex items-center space-x-6">
              {step === 'attendance' && (
                <button 
                  onClick={() => setStep('details')}
                  className="w-12 h-12 flex items-center justify-center bg-surface-50 rounded-2xl hover:bg-brand-primary/10 text-surface-400 hover:text-brand-primary transition-all group"
                  title="Sửa thông tin buổi học"
                >
                  <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
              )}
              <div>
                <h2 className="text-3xl font-black text-brand-primary tracking-tighter">
                  {step === 'details' ? 'Chi tiết buổi học' : 'Điểm danh lớp học'}
                </h2>
                <p className="text-surface-500 font-bold text-sm mt-1">
                  {step === 'details' ? 'Cấu hình thời gian và nội dung bài học' : 'Đánh dấu trạng thái chuyên cần'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {step === 'attendance' && (
                <button 
                  onClick={() => setStep('details')}
                  className="hidden md:flex items-center space-x-2 px-4 py-2 bg-surface-50 rounded-xl hover:bg-brand-primary/10 text-surface-500 hover:text-brand-primary transition-all font-black text-[10px] uppercase tracking-widest"
                >
                  <Settings2 className="w-4 h-4" />
                  <span>Sửa thông tin</span>
                </button>
              )}
              <button 
                onClick={onClose} 
                className="p-4 hover:bg-surface-50 rounded-2xl transition-all duration-300 group"
              >
                <X className="w-6 h-6 text-surface-300 group-hover:text-surface-900 group-hover:rotate-90 transition-all" />
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mx-8 md:mx-12 mt-6 p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p className="font-bold text-sm">{error}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-hide">
            {step === 'details' ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">Ngày học</label>
                    <div className="relative group">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                      <input 
                        type="date" 
                        value={sessionData.date}
                        onChange={e => handleDateChange(e.target.value)}
                        className="w-full h-16 pl-14 pr-6 bg-surface-50/70 rounded-[1.75rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-lg font-bold text-surface-900 outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">Bắt đầu</label>
                      <div className="relative group">
                        <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                        <input 
                          type="time" 
                          value={sessionData.startTime}
                          onChange={e => setSessionData({...sessionData, startTime: e.target.value})}
                          className="w-full h-16 pl-12 pr-4 bg-surface-50/70 rounded-[1.75rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-lg font-bold text-surface-900 outline-none transition-all" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">Kết thúc</label>
                      <div className="relative group">
                        <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                        <input 
                          type="time" 
                          value={sessionData.endTime}
                          onChange={e => setSessionData({...sessionData, endTime: e.target.value})}
                          className="w-full h-16 pl-12 pr-4 bg-surface-50/70 rounded-[1.75rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-lg font-bold text-surface-900 outline-none transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] px-2 block">Nội dung / Ghi chú</label>
                  <div className="relative group">
                    <FileText className="absolute left-6 top-6 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                    <textarea 
                      placeholder="Ví dụ: Kiểm tra 15p, Bài tập về nhà..."
                      value={sessionData.note}
                      onChange={e => setSessionData({...sessionData, note: e.target.value})}
                      className="w-full min-h-[160px] pl-14 pr-8 py-6 bg-surface-50/70 rounded-[2rem] border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-lg font-bold text-surface-900 outline-none transition-all resize-none scrollbar-hide placeholder:text-surface-300" 
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center text-surface-400">
                    <Loader2 className="w-12 h-12 animate-spin mb-4 text-brand-primary" />
                    <p className="font-black uppercase tracking-widest text-xs">Đang tải danh sách học sinh...</p>
                  </div>
                ) : (
                  attendances.map((student) => (
                    <div key={student.id} className="p-6 bg-surface-50/40 rounded-[2.5rem] border border-surface-50 flex items-center justify-between group hover:bg-white hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-500 overflow-hidden">
                      <div className="flex items-center space-x-6 min-w-0 mr-4">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-primary text-xl font-black shadow-sm group-hover:rotate-6 transition-transform shrink-0">
                          {student.studentName.substring(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-lg font-black text-surface-900 truncate" title={student.studentName}>{student.studentName}</div>
                          <div className="text-xs font-bold text-surface-400 uppercase tracking-widest truncate" title={student.studentEmail}>{student.studentEmail}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        {statusList.map((status) => (
                          <button
                            key={status.value}
                            onClick={() => handleUpdateStatus(student.id, status.value)}
                            className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 shadow-sm border shrink-0 ${
                              student.status === status.value 
                                ? `${status.bg} ${status.color} border-current scale-110 shadow-lg z-10` 
                                : `bg-white text-surface-400 border-surface-100 ${status.hover}`
                            }`}
                            title={status.label}
                          >
                            {getStatusIcon(status.value)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 md:p-12 border-t border-surface-50 bg-white/80 backdrop-blur-md flex items-center justify-between sticky bottom-0 z-30">
            <button 
              onClick={onClose} 
              className="rounded-[1.75rem] px-8 h-16 border-none font-black text-surface-400 hover:text-surface-900 uppercase tracking-widest text-xs transition-all"
            >
              Hủy bỏ
            </button>
            {step === 'details' ? (
              <Button 
                onClick={handleCreateOrUpdateSession} 
                disabled={saving}
                className="rounded-[1.75rem] px-10 h-16 shadow-2xl shadow-brand-primary/20 font-black bg-brand-primary text-white uppercase tracking-widest text-xs"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    {sessionId ? 'Lưu & Điểm danh' : 'Tiếp tục điểm danh'}
                    <ArrowRight className="w-4 h-4 ml-3" />
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="rounded-[1.75rem] px-10 h-16 shadow-2xl shadow-brand-primary/20 font-black bg-brand-primary text-white uppercase tracking-widest text-xs"
              >
                <Check className="w-5 h-5 mr-3" />
                Hoàn tất buổi học
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
