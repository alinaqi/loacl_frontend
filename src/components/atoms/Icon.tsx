import React from 'react';
import { Icon as ChakraIcon, IconProps as ChakraIconProps } from '@chakra-ui/react';
import clsx from 'clsx';

export interface IconProps extends Omit<ChakraIconProps, 'size'> {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

const sizeMap = {
  xs: '1rem',
  sm: '1.25rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '2.5rem',
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color,
  className,
  ...props
}) => {
  const iconStyles = clsx(
    'inline-block',
    {
      'text-current': !color,
    },
    className
  );

  return (
    <ChakraIcon
      as={name}
      className={iconStyles}
      boxSize={sizeMap[size]}
      color={color}
      {...props}
    />
  );
}; 