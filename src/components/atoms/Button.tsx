import React from 'react';
import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import clsx from 'clsx';

export interface ButtonProps extends Omit<ChakraButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  ...props
}) => {
  const buttonStyles = clsx(
    'inline-flex items-center justify-center font-medium transition-colors duration-200',
    {
      'w-full': fullWidth,
      // Size variants
      'px-3 py-1.5 text-sm': size === 'sm',
      'px-4 py-2 text-base': size === 'md',
      'px-6 py-3 text-lg': size === 'lg',
      // Color variants
      'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700': variant === 'primary',
      'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300': variant === 'secondary',
      'border-2 border-primary-500 text-primary-500 hover:bg-primary-50': variant === 'outline',
      'text-primary-500 hover:bg-primary-50': variant === 'ghost',
      'text-primary-500 hover:underline': variant === 'link',
    },
    'disabled:opacity-50 disabled:cursor-not-allowed',
    className
  );

  return (
    <ChakraButton
      className={buttonStyles}
      isLoading={isLoading}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      {...props}
    >
      {children}
    </ChakraButton>
  );
}; 