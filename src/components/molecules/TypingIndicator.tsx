import React from 'react';
import clsx from 'clsx';

export interface TypingIndicatorProps {
  /**
   * Whether the typing indicator is visible
   */
  isVisible?: boolean;
  /**
   * Custom class name
   */
  className?: string;
  /**
   * The text to show before the dots (e.g., "Assistant is typing")
   */
  text?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isVisible = true,
  className,
  text = 'Assistant is typing',
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2',
        'text-sm text-gray-500',
        'animate-fade-in',
        className
      )}
      role="status"
      aria-label={text}
    >
      <span>{text}</span>
      <span className="flex gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </span>
    </div>
  );
};

/**
 * Add to tailwind.config.js:
 * {
 *   theme: {
 *     extend: {
 *       keyframes: {
 *         'fade-in': {
 *           '0%': { opacity: '0' },
 *           '100%': { opacity: '1' },
 *         },
 *       },
 *       animation: {
 *         'fade-in': 'fade-in 0.3s ease-in-out',
 *       },
 *     },
 *   },
 * }
 */ 