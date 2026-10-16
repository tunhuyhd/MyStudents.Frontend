'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-brand-action text-white hover:bg-brand-action-hover',
      secondary: 'bg-sky-700 text-white hover:bg-sky-800',
      outline: 'border border-brand-action text-brand-action hover:bg-surface-50',
      ghost: 'text-surface-800 hover:bg-surface-100',
    };

    const sizes = {
      sm: 'min-h-10 px-3 py-2 text-sm',
      md: 'px-5 py-2.5',
      lg: 'px-8 py-3.5 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
      >
        {isLoading ? (
          <span aria-hidden="true" className="mr-2 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
