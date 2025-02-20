import React from 'react';
import { Avatar as ChakraAvatar, AvatarProps as ChakraAvatarProps } from '@chakra-ui/react';
import clsx from 'clsx';

export interface AvatarProps extends Omit<ChakraAvatarProps, 'size'> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  src?: string;
  name?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const sizeMap = {
  xs: '24px',
  sm: '32px',
  md: '40px',
  lg: '48px',
  xl: '56px',
};

const statusColorMap = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

export const Avatar: React.FC<AvatarProps> = ({
  size = 'md',
  src,
  name,
  status,
  className,
  ...props
}) => {
  const avatarStyles = clsx(
    'relative inline-block',
    className
  );

  return (
    <div className={avatarStyles}>
      <ChakraAvatar
        src={src}
        name={name}
        width={sizeMap[size]}
        height={sizeMap[size]}
        {...props}
      />
      {status && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 block rounded-full border-2 border-white',
            statusColorMap[status],
            {
              'h-2 w-2': size === 'xs' || size === 'sm',
              'h-3 w-3': size === 'md',
              'h-4 w-4': size === 'lg' || size === 'xl',
            }
          )}
        />
      )}
    </div>
  );
}; 