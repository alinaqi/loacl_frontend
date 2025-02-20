import React from 'react';
import { Text, Heading } from '@chakra-ui/react';
import clsx from 'clsx';

interface TypographyBaseProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

interface TextProps extends TypographyBaseProps {
  variant?: 'body1' | 'body2' | 'caption' | 'overline';
}

interface HeadingProps extends TypographyBaseProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const textStyles = {
  body1: 'text-base leading-relaxed',
  body2: 'text-sm leading-relaxed',
  caption: 'text-xs leading-normal',
  overline: 'text-xs uppercase tracking-wider',
};

export const Typography = {
  Text: React.forwardRef<HTMLParagraphElement, TextProps>(
    ({ variant = 'body1', color, className, children, ...props }, ref) => {
      const classes = clsx(
        textStyles[variant],
        {
          [`text-${color}`]: color,
        },
        className
      );

      return (
        <Text ref={ref} className={classes} {...props}>
          {children}
        </Text>
      );
    }
  ),

  Heading: React.forwardRef<HTMLHeadingElement, HeadingProps>(
    ({ level = 1, color, className, children, ...props }, ref) => {
      const headingStyles = {
        1: 'text-4xl font-bold leading-tight',
        2: 'text-3xl font-bold leading-tight',
        3: 'text-2xl font-bold leading-tight',
        4: 'text-xl font-bold leading-snug',
        5: 'text-lg font-bold leading-snug',
        6: 'text-base font-bold leading-snug',
      };

      const classes = clsx(
        headingStyles[level],
        {
          [`text-${color}`]: color,
        },
        className
      );

      return (
        <Heading ref={ref} as={`h${level}`} className={classes} {...props}>
          {children}
        </Heading>
      );
    }
  ),
}; 