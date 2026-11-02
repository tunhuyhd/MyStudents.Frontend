'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Trash2 } from '@/components/ui/icons';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import { useId } from 'react';
import { useAccessibleDialog } from '@/hooks/useAccessibleDialog';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  error?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  isLoading,
  error
}: ConfirmModalProps) {
  const { t } = useLanguage();
  const dialogId = useId();
  const dialogRef = useAccessibleDialog<HTMLDivElement>(isOpen, onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-surface-900/40"
          />
          <motion.div
            initial={false}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
            aria-describedby={`${dialogId}-description`}
            data-dialog-focus-scope="true"
            tabIndex={-1}
            className="bg-white w-full max-w-md rounded-xl relative z-10 overflow-hidden border border-surface-200"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-red-500" />
                </div>
              <button onClick={onClose} aria-label={t('common.close')} className="p-2 hover:bg-surface-50 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-surface-400" />
                </button>
              </div>

              <h3 id={`${dialogId}-title`} className="text-2xl font-semibold text-surface-900 mb-2 tracking-tight">
                {title}
              </h3>
              <p id={`${dialogId}-description`} className="text-surface-500 font-medium leading-relaxed mb-10">
                {message}
              </p>

              {error&&<p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  data-dialog-initial-focus="true"
                  onClick={onClose}
                  className="flex-1 rounded-lg h-12 border-surface-100 text-surface-500 hover:bg-surface-50 font-medium"
                >
                  {cancelText || t('teacher.modal.cancel')}
                </Button>
                <Button
                  onClick={onConfirm}
                  isLoading={isLoading}
                  className="flex-1 rounded-lg h-12 bg-red-500 hover:bg-red-600 text-white font-medium"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {confirmText || t('common.delete')}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
