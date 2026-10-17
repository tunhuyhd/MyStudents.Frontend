import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getToastDismissalDelay, type ToastType } from '@/lib/toast';

interface ToastProps {
  isOpen: boolean;
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ isOpen, message, type = 'success', onClose, duration }: ToastProps) {
  const { t } = useLanguage();
  const dismissalDelay = getToastDismissalDelay(type, duration);

  useEffect(() => {
    if (isOpen && dismissalDelay !== null) {
      const timer = setTimeout(() => {
        onClose();
      }, dismissalDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, dismissalDelay, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9, x: '-50%' }}
          animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
          exit={{ opacity: 0, y: -20, scale: 0.9, x: '-50%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          role={type === 'error' ? 'alert' : 'status'}
          aria-live={type === 'error' ? 'assertive' : 'polite'}
          aria-atomic="true"
          className="fixed top-6 left-1/2 z-[9999] flex w-[calc(100vw-2rem)] min-w-0 max-w-md items-center gap-3.5 pl-5 pr-4 py-3.5 bg-white/90 backdrop-blur-xl border rounded-[1.75rem] shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
          style={{
            borderColor: type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            boxShadow: type === 'success'
              ? '0 20px 50px -12px rgba(16, 185, 129, 0.12)'
              : '0 20px 50px -12px rgba(239, 68, 68, 0.12)',
          }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3.5">
            {type === 'success' ? (
              <div aria-hidden="true" className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
            ) : (
              <div aria-hidden="true" className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                <AlertCircle className="w-4.5 h-4.5" />
              </div>
            )}
            <div className="flex min-w-0 flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-surface-400">
                {type === 'success' ? t('common.toastSuccess') : t('common.toastFailure')}
              </span>
              <p className="break-words text-sm font-bold text-surface-800 leading-tight">
                {message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-50 text-surface-400 hover:text-surface-600 transition-colors shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
