import React from 'react';
import clsx from 'clsx';

export interface MessageBubbleProps {
  /**
   * The content of the message
   */
  message: string;
  /**
   * Whether the message is from the user (sent) or the assistant (received)
   */
  isUser: boolean;
  /**
   * Timestamp of the message
   */
  timestamp?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isUser,
  timestamp,
  className,
}) => {
  return (
    <div
      className={clsx(
        'flex',
        isUser ? 'justify-end' : 'justify-start',
        'w-full',
        'mb-4',
        className
      )}
    >
      <div
        className={clsx(
          'max-w-[70%]',
          'rounded-2xl',
          'px-4 py-2',
          'break-words',
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none',
          'shadow-sm'
        )}
        role="article"
        aria-label={`${isUser ? 'Your' : 'Assistant'} message`}
      >
        <p className="text-sm md:text-base">{message}</p>
        {timestamp && (
          <time
            className={clsx(
              'text-xs',
              'block',
              'mt-1',
              isUser ? 'text-blue-100' : 'text-gray-500'
            )}
            dateTime={timestamp}
          >
            {new Date(timestamp).toLocaleTimeString()}
          </time>
        )}
      </div>
    </div>
  );
}; 