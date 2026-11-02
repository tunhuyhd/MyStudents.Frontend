'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { Button } from '@/components/ui/Button';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, User, Mail, GraduationCap, Phone, MapPin, UserCircle, Users, Loader2, AlertCircle } from '@/components/ui/icons';
import { Student, CreateStudentData } from '@/services/studentService';
import { useLanguage } from '@/context/LanguageContext';
import { apiErrorMessage } from '@/lib/apiError';
import { useAccessibleDialog } from '@/hooks/useAccessibleDialog';
import { canCloseDialog } from '@/lib/dialog';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateStudentData) => Promise<void>;
  initialData?: Student | null;
}

const CustomDatePicker = ({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void; t: (key: string) => string }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-xs font-semibold text-brand-text block">{label}</label>
    <input id={id} type="date" value={value} onChange={event => onChange(event.target.value)} className="ui-input w-full min-h-12 px-4 rounded-lg text-base text-surface-900 bg-white placeholder:text-surface-500" />
  </div>
);

export default function StudentModal({ isOpen, onClose, onSave, initialData }: StudentModalProps) {
  const { t } = useLanguage();
  const formId = useId();
  const [formData, setFormData] = useState<CreateStudentData>({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: 0,
    school: '',
    parentName: '',
    parentPhone: '',
    phone: '',
    address: '',
    note: ''
  });
  const initialFormSnapshot = useRef('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useAccessibleDialog<HTMLDivElement>(isOpen, requestClose);

  function requestClose() {
    if (loading) return;
    const hasUnsavedChanges = initialFormSnapshot.current !== JSON.stringify(formData);
    if (canCloseDialog(hasUnsavedChanges, () => window.confirm(t('common.discardChanges')))) onClose();
  }

  const nameValidationMessage = t('campus.studentNameRequired');
  const emailValidationMessage = t('campus.studentEmailRequired');
  const isNameValidationError = error === nameValidationMessage;
  const isEmailValidationError = error === emailValidationMessage;
  const validationErrorId = `${formId}-validation-error`;

  useEffect(() => {
    if (initialData) {
      // Reset the form when the modal switches between create and edit.
      const nextFormData: CreateStudentData = {
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email || '',
        dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '',
        gender: initialData.gender,
        school: initialData.school || '',
        parentName: initialData.parentName || '',
        parentPhone: initialData.parentPhone || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        note: initialData.note || ''
      };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(nextFormData);
      initialFormSnapshot.current = JSON.stringify(nextFormData);
    } else {
      const nextFormData: CreateStudentData = {
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        gender: 0,
        school: '',
        parentName: '',
        parentPhone: '',
        phone: '',
        address: '',
        note: ''
      };
      setFormData(nextFormData);
      initialFormSnapshot.current = JSON.stringify(nextFormData);
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    // Client-side validation
    if (!formData.lastName?.trim() || !formData.firstName?.trim()) {
      setError(nameValidationMessage);
      return;
    }

    if (!formData.email?.trim()) {
      setError(emailValidationMessage);
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error: unknown) {
      setError(apiErrorMessage(error, t, 'common.saveError'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 lg:p-6">
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={requestClose}
          className="absolute inset-0 bg-surface-900/60"
        />

        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${formId}-dialog-title`}
          aria-describedby={`${formId}-dialog-description`}
          data-dialog-focus-scope="true"
          tabIndex={-1}
          className="club-modal club-student-modal bg-white relative z-10 overflow-hidden flex flex-col"
        >
          <header className="club-modal-header">
            <span className="club-modal-symbol" aria-hidden="true"><UserCircle /></span>
            <div className="club-modal-heading"><h2 id={`${formId}-dialog-title`}>{initialData?t('teacher.students.editTitle'):t('teacher.students.createTitle')}</h2><p id={`${formId}-dialog-description`}>{t('modals.studentHint')}</p></div>
            <button type="button" className="club-modal-close" onClick={requestClose} aria-label={t('common.close')}><X /></button>
          </header>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="club-modal-content club-student-form">
            {error && (
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                id={validationErrorId}
                role="alert"
                className="mb-8 p-6 bg-red-50 border border-red-100 rounded-xl flex items-center gap-4 text-red-600"
              >
                <AlertCircle className="w-6 h-6 shrink-0" />
                <p className="font-medium text-sm leading-relaxed">{error}</p>
              </motion.div>
            )}

            <div className="club-student-sections">
              {/* Section: Basic Info */}
              <div className="club-form-section">
                <div className="club-form-section-heading">
                  <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-brand-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-surface-900 tracking-tight">{t('teacher.students.basicInfo')}</h3>
                </div>

                <div className="club-name-pair">
                  <div className="space-y-2">
                    <label htmlFor={`${formId}-last-name`} className="text-xs font-semibold text-brand-text tracking-normal px-2 block">{t('auth.lastName')} <span className="text-red-500">*</span></label>
                    <input
                      id={`${formId}-last-name`}
                      type="text"
                      placeholder="Nguyễn Văn"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="ui-input placeholder:text-surface-500 w-full h-12 md:h-12 px-6 bg-surface-50/70 rounded-xl border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base font-medium text-surface-900 outline-none transition-all"
                      aria-invalid={isNameValidationError && !formData.lastName?.trim() || undefined}
                      aria-describedby={isNameValidationError && !formData.lastName?.trim() ? validationErrorId : undefined}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`${formId}-first-name`} className="text-xs font-semibold text-brand-text tracking-normal px-2 block">{t('auth.firstName')} <span className="text-red-500">*</span></label>
                    <input
                      id={`${formId}-first-name`}
                      type="text"
                      placeholder="An"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="ui-input placeholder:text-surface-500 w-full h-12 md:h-12 px-6 bg-surface-50/70 rounded-xl border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base font-medium text-surface-900 outline-none transition-all"
                      aria-invalid={isNameValidationError && !formData.firstName?.trim() || undefined}
                      aria-describedby={isNameValidationError && !formData.firstName?.trim() ? validationErrorId : undefined}
                      required
                    />
                  </div>
                </div>

                <div className="club-contact-pair"><div className="space-y-2">
                  <label htmlFor={`${formId}-email`} className="text-xs font-semibold text-brand-text tracking-normal px-2 block">{t('auth.email')} <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                    <input
                      id={`${formId}-email`}
                      type="email"
                      placeholder="student@example.com"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="ui-input placeholder:text-surface-500 w-full h-12 md:h-12 pl-14 pr-6 bg-surface-50/70 rounded-xl border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base font-medium text-surface-900 outline-none transition-all"
                      aria-invalid={isEmailValidationError || undefined}
                      aria-describedby={isEmailValidationError ? validationErrorId : undefined}
                      required
                    />
                  </div>
                </div><div className="space-y-2">
                    <label htmlFor={`${formId}-student-phone`} className="text-xs font-semibold text-brand-text tracking-normal px-2 block">{t('teacher.students.phone')}</label>
                    <div className="relative group">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                      <input
                        id={`${formId}-student-phone`}
                        type="text"
                        placeholder="091..."
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="ui-input placeholder:text-surface-500 w-full h-12 md:h-12 pl-14 pr-6 bg-surface-50/70 rounded-xl border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base font-medium text-surface-900 outline-none transition-all"
                      />
                    </div>
                  </div></div>

                <div className="club-demographics">
                  <CustomDatePicker
                    id={`${formId}-date-of-birth`}
                    label={t('teacher.students.dob')}
                    value={formData.dateOfBirth || ''}
                    onChange={(val) => setFormData({...formData, dateOfBirth: val})}
                    t={t}
                  />

                  <div className="space-y-2">
                    <span id={`${formId}-gender-label`} className="text-xs font-semibold text-brand-text tracking-normal px-2 block">{t('teacher.students.gender')}</span>
                    <div role="group" aria-labelledby={`${formId}-gender-label`} className="flex bg-surface-50/70 p-1.5 rounded-xl h-12 md:h-12">
                      {[
                        { id: 0, label: t('teacher.students.male') },
                        { id: 1, label: t('teacher.students.female') }
                      ].map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setFormData({...formData, gender: g.id})}
                          className={`flex-1 rounded-xl text-xs font-semibold transition-all duration-150 ${
                            formData.gender === g.id
                            ? 'bg-white text-brand-text  '
                            : 'text-surface-400 hover:text-surface-600'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor={`${formId}-school`} className="text-xs font-semibold text-brand-text tracking-normal px-2 block">{t('teacher.students.school')}</label>
                  <div className="relative group">
                    <GraduationCap className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                    <input
                      id={`${formId}-school`}
                      type="text"
                      placeholder="THPT Chuyên Lê Hồng Phong"
                      value={formData.school || ''}
                      onChange={(e) => setFormData({...formData, school: e.target.value})}
                      className="ui-input placeholder:text-surface-500 w-full h-12 md:h-12 pl-14 pr-6 bg-surface-50/70 rounded-xl border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base font-medium text-surface-900 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Parent & Contact */}
              <div className="club-form-section">
                <div className="club-form-section-heading">
                  <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-brand-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-surface-900 tracking-tight">{t('teacher.students.parentContact')}</h3>
                </div>

                <div className="space-y-2">
                  <label htmlFor={`${formId}-parent-name`} className="text-xs font-semibold text-brand-text tracking-normal px-2 block">{t('teacher.students.parentName')}</label>
                  <input
                    id={`${formId}-parent-name`}
                    type="text"
                    placeholder="Nguyễn Văn B"
                    value={formData.parentName || ''}
                    onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                    className="ui-input placeholder:text-surface-500 w-full h-12 md:h-12 px-6 bg-surface-50/70 rounded-xl border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base font-medium text-surface-900 outline-none transition-all"
                  />
                </div>

                <div className="club-parent-phone">
                  <div className="space-y-2">
                    <label htmlFor={`${formId}-parent-phone`} className="text-xs font-semibold text-brand-text tracking-normal px-2 block">{t('teacher.students.parentPhone')}</label>
                    <div className="relative group">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                      <input
                        id={`${formId}-parent-phone`}
                        type="text"
                        placeholder="090..."
                        value={formData.parentPhone || ''}
                        onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                        className="ui-input placeholder:text-surface-500 w-full h-12 md:h-12 pl-14 pr-6 bg-surface-50/70 rounded-xl border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base font-medium text-surface-900 outline-none transition-all"
                      />
                    </div>
                  </div>
                  
                </div>

                <div className="space-y-2">
                  <label htmlFor={`${formId}-address`} className="text-xs font-semibold text-brand-text tracking-normal px-2 block">{t('teacher.students.address')}</label>
                  <div className="relative group">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" />
                    <input
                      id={`${formId}-address`}
                      type="text"
                      placeholder="123 Đường ABC, Quận X, TP. HCM"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="ui-input placeholder:text-surface-500 w-full h-12 md:h-12 pl-14 pr-6 bg-surface-50/70 rounded-xl border-2 border-transparent focus:border-brand-primary/20 focus:bg-white text-base font-medium text-surface-900 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor={`${formId}-note`} className="text-xs font-semibold text-brand-text tracking-normal px-2 block">{t('teacher.students.note')}</label>
                  <textarea
                    id={`${formId}-note`}
                    className="ui-input w-full p-6 bg-surface-50/70 border-2 border-transparent rounded-xl text-sm font-medium placeholder:text-surface-500 focus:ring-0 focus:border-brand-primary/20 focus:bg-white transition-all min-h-[120px] outline-none scrollbar-hide text-surface-900"
                    placeholder={t('campus.studentNotePlaceholder')}
                    value={formData.note || ''}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="club-modal-footer club-student-footer">
            <button
              onClick={requestClose}
              className="rounded-xl px-8 md:px-12 h-12 border-none font-semibold text-surface-400 hover:text-surface-900 tracking-normal text-xs transition-all"
            >
              {t('teacher.modal.cancel')}
            </button>
            <Button
              onClick={() => handleSubmit()}
              isLoading={loading}
              className="rounded-xl px-10 md:px-14 h-12 font-semibold bg-brand-action text-white tracking-normal text-xs"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <Check className="w-5 h-5 mr-3" />
                  {initialData ? t('common.save') : t('campus.createStudent')}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
