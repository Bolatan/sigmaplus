import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, fullWidth = false, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col', fullWidth ? 'w-full' : '')}>
        {label && (
          <label
            htmlFor={props.id}
            className="mb-1 text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            className={cn(
              'shadow-sm rounded-md border border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm block w-full p-2.5',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-error-500 focus:border-error-500 focus:ring-error-500',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';