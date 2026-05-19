import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  isOpen: boolean;
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export function Toast({ isOpen, message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9, x: '-50%' }}
          animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
          exit={{ opacity: 0, y: -20, scale: 0.9, x: '-50%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed top-6 left-1/2 z-[9999] flex items-center gap-3.5 pl-5 pr-4 py-3.5 bg-white/90 backdrop-blur-xl border rounded-[1.75rem] shadow-[0_20px_50px_rgba(0,0,0,0.12)] min-w-[320px] max-w-md"
          style={{
            borderColor: type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            boxShadow: type === 'success' 
              ? '0 20px 50px -12px rgba(16, 185, 129, 0.12)' 
              : '0 20px 50px -12px rgba(239, 68, 68, 0.12)'
          }}
        >
          <div className="flex-1 flex items-center gap-3.5">
            {type === 'success' ? (
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                <AlertCircle className="w-4.5 h-4.5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-surface-400">
                {type === 'success' ? 'Thành công' : 'Thất bại'}
              </span>
              <p className="text-sm font-bold text-surface-800 leading-tight">
                {message}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-50 text-surface-400 hover:text-surface-600 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
