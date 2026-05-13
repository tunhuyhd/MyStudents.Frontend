'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Role {
  id: string;
  name: string;
}

interface RoleDropdownProps {
  roles: Role[];
  currentRoleId: string;
  onUpdate: (roleId: string) => void;
  disabled?: boolean;
}

export default function RoleDropdown({ roles, currentRoleId, onUpdate, disabled }: RoleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentRole = roles.find(r => r.id === currentRoleId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full min-w-[120px] px-4 py-2.5 
          bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl
          text-sm font-bold text-white transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20 active:scale-95'}
        `}
        disabled={disabled}
      >
        <span className="truncate">{currentRole?.name || 'Select Role'}</span>
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-50 mt-3 w-full min-w-[160px] bg-[#111814]/90 backdrop-blur-2xl border border-emerald-500/20 rounded-[1.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-2 space-y-1">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    onUpdate(role.id);
                    setIsOpen(false);
                  }}
                  className={`
                    flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-all
                    ${role.id === currentRoleId 
                      ? 'bg-emerald-500 text-black' 
                      : 'text-emerald-500/70 hover:bg-emerald-500/10 hover:text-emerald-400'}
                  `}
                >
                  {role.name}
                  {role.id === currentRoleId && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
