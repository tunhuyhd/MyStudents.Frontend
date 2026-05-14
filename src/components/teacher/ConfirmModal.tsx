'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Trash2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  isLoading
}: ConfirmModalProps) {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-surface-900/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] relative z-10 overflow-hidden border border-white"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-red-500" />
                </div>
                <button onClick={onClose} className="p-2 hover:bg-surface-50 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-surface-400" />
                </button>
              </div>

              <h3 className="text-2xl font-black text-surface-900 mb-2 tracking-tight">
                {title}
              </h3>
              <p className="text-surface-500 font-medium leading-relaxed mb-10">
                {message}
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-2xl h-14 border-surface-100 text-surface-500 hover:bg-surface-50 font-bold"
                >
                  {cancelText || t('teacher.modal.cancel')}
                </Button>
                <Button
                  onClick={onConfirm}
                  isLoading={isLoading}
                  className="flex-1 rounded-2xl h-14 bg-red-500 hover:bg-red-600 shadow-xl shadow-red-500/20 text-white font-bold"
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
