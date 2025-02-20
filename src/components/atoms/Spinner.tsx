import React from 'react';
import { Spinner as ChakraSpinner } from '@chakra-ui/react';
import clsx from 'clsx';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  thickness?: string;
  speed?: string;
  className?: string;
  label?: string;
}

const sizeMap = {
  xs: '1rem',
  sm: '1.5rem',
  md: '2rem',
  lg: '3rem',
  xl: '4rem',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary.500',
  thickness = '4px',
  speed = '0.75s',
  className,
  label = 'Loading...',
}) => {
  const spinnerStyles = clsx(
    'inline-block',
    className
  );

  return (
    <div className="inline-flex flex-col items-center">
      <ChakraSpinner
        className={spinnerStyles}
        size={sizeMap[size]}
        color={color}
        thickness={thickness}
        speed={speed}
      />
      {label && (
        <span className="mt-2 text-sm text-gray-600">{label}</span>
      )}
    </div>
  );
}; 