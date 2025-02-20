import React from 'react';
import clsx from 'clsx';

export interface SuggestionChipProps {
  /**
   * The text content of the suggestion
   */
  text: string;
  /**
   * Icon component to display before the text
   */
  icon?: React.ReactNode;
  /**
   * Function called when the chip is clicked
   */
  onClick?: () => void;
  /**
   * Whether the chip is currently selected
   */
  selected?: boolean;
  /**
   * Whether the chip is disabled
   */
  disabled?: boolean;
  /**
   * Custom class name
   */
  className?: string;
}

export const SuggestionChip: React.FC<SuggestionChipProps> = ({
  text,
  icon,
  onClick,
  selected = false,
  disabled = false,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center gap-2',
        'px-4 py-2 rounded-full',
        'text-sm font-medium',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-blue-500':
            !selected && !disabled,
          'bg-blue-500 text-white hover:bg-blue-600':
            selected && !disabled,
          'bg-gray-100 text-gray-400 cursor-not-allowed':
            disabled,
        },
        className
      )}
      role="option"
      aria-selected={selected}
    >
      {icon && (
        <span className={clsx(
          'flex-shrink-0',
          selected ? 'text-white' : 'text-blue-500',
          disabled && 'text-gray-400'
        )}>
          {icon}
        </span>
      )}
      <span className="truncate">
        {text}
      </span>
    </button>
  );
}; 