import React, { forwardRef } from 'react';
import { Input as ChakraInput, InputProps as ChakraInputProps } from '@chakra-ui/react';
import clsx from 'clsx';

export interface InputProps extends Omit<ChakraInputProps, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'flushed';
  error?: string;
  fullWidth?: boolean;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      variant = 'outline',
      error,
      fullWidth = false,
      leftElement,
      rightElement,
      className,
      ...props
    },
    ref
  ) => {
    const inputStyles = clsx(
      'w-full rounded-md border transition-colors duration-200',
      {
        'w-full': fullWidth,
        // Size variants
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-4 py-2 text-base': size === 'md',
        'px-6 py-3 text-lg': size === 'lg',
        // Variant styles
        'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50':
          variant === 'outline',
        'bg-gray-100 border-transparent focus:bg-white focus:border-primary-500':
          variant === 'filled',
        'border-b border-t-0 border-l-0 border-r-0 rounded-none focus:border-primary-500':
          variant === 'flushed',
        // Error state
        'border-red-500 focus:border-red-500 focus:ring-red-500': error,
      },
      className
    );

    return (
      <div className="relative w-full">
        {leftElement && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {leftElement}
          </div>
        )}
        <ChakraInput
          ref={ref}
          className={inputStyles}
          pl={leftElement ? '10' : undefined}
          pr={rightElement ? '10' : undefined}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {rightElement}
          </div>
        )}
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
); 