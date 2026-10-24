'use client';

import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  theme?: 'light' | 'dark';
  label?: string;
  labelClassName?: string;
  error?: string;
  success?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, theme = 'light', label, labelClassName, error, success, type, 'aria-describedby': describedBy, ...props }, ref) => {
    const generatedId = useId();
    const id = props.id || generatedId;
    const state = error ? 'error' : success ? 'success' : 'default';
    return (
      <div className="w-full space-y-2" data-control-theme={theme}>
        {label && (
          <label htmlFor={id} className={cn('ui-input-label block text-sm font-medium', labelClassName)}>
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          className={cn(
            'ui-input flex w-full rounded-xl px-4 py-3 text-base sm:text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium transition-colors',
            className
          )}
          ref={ref}
          data-theme={theme}
          data-state={state}
          {...props}
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={[describedBy, error ? `${id}-error` : undefined].filter(Boolean).join(' ') || undefined}
        />
        {error && (
          <p id={`${id}-error`} role="alert" className="ui-input-error text-sm font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
