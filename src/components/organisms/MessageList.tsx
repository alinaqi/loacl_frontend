import React, { useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Message } from '../../types/chat';
import { MessageBubble } from '../molecules/MessageBubble';
import { TypingIndicator } from '../molecules/TypingIndicator';
import { ErrorMessage } from '../molecules/ErrorMessage';

export interface MessageListProps {
  /**
   * Array of messages to display
   */
  messages: Message[];
  /**
   * Whether the assistant is currently typing
   */
  isTyping?: boolean;
  /**
   * Error message to display if any
   */
  error?: string | null;
  /**
   * Callback when retry is clicked on error
   */
  onRetry?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping = false,
  error = null,
  onRetry,
  className,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive or typing status changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div 
      className={clsx(
        'flex flex-col',
        'space-y-4',
        'overflow-y-auto',
        'px-4 py-6',
        'min-h-[300px]',
        'max-h-[600px]',
        className
      )}
      role="log"
      aria-label="Message list"
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message.content}
          isUser={message.role === 'user'}
          timestamp={message.timestamp.toISOString()}
        />
      ))}
      
      {isTyping && (
        <div className="flex justify-start">
          <TypingIndicator isVisible={true} />
        </div>
      )}

      {error && (
        <ErrorMessage
          message="Failed to send message"
          details={error}
          showRetry={true}
          onRetry={onRetry}
          severity="error"
        />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}; 