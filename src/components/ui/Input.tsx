'use client';

import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, labelClassName, error, type, 'aria-describedby': describedBy, ...props }, ref) => {
    const generatedId = useId();
    const id = props.id || generatedId;
    return (
      <div className="w-full space-y-2">
        {label && (
          <label htmlFor={id} className={cn('block text-sm font-medium text-surface-800', labelClassName)}>
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          className={cn(
            'flex w-full rounded-xl border border-surface-300 bg-white px-4 py-3 text-base sm:text-sm text-surface-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-surface-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={[describedBy, error ? `${id}-error` : undefined].filter(Boolean).join(' ') || undefined}
        />
        {error && (
          <p id={`${id}-error`} role="alert" className="text-sm text-red-700 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
