import React from 'react';
import clsx from 'clsx';
import { Avatar } from '../atoms/Avatar';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';

export interface ChatHeaderProps {
  /**
   * Title of the chat (e.g., "AI Assistant")
   */
  title: string;
  /**
   * Subtitle or status text (e.g., "Online")
   */
  subtitle?: string;
  /**
   * Avatar image URL
   */
  avatarUrl?: string;
  /**
   * Online status of the assistant
   */
  status?: 'online' | 'offline' | 'away' | 'busy';
  /**
   * Whether to show the settings button
   */
  showSettings?: boolean;
  /**
   * Callback when settings button is clicked
   */
  onSettingsClick?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  subtitle,
  avatarUrl,
  status = 'online',
  showSettings = true,
  onSettingsClick,
  className,
}) => {
  return (
    <header
      className={clsx(
        'flex items-center justify-between',
        'px-4 py-3',
        'bg-white',
        'border-b border-gray-200',
        'shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar
          src={avatarUrl}
          name={title}
          size="md"
          status={status}
        />
        <div>
          <Typography.Text
            className="font-semibold text-gray-900"
          >
            {title}
          </Typography.Text>
          {subtitle && (
            <Typography.Text
              variant="caption"
              className="text-gray-500"
            >
              {subtitle}
            </Typography.Text>
          )}
        </div>
      </div>

      {showSettings && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettingsClick}
          aria-label="Open settings"
          className="text-gray-500 hover:text-gray-700"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </Button>
      )}
    </header>
  );
}; 