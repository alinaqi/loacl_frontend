import React from 'react';
import clsx from 'clsx';

export interface ErrorMessageProps {
  /**
   * The error message to display
   */
  message: string;
  /**
   * Optional retry callback
   */
  onRetry?: () => void;
  /**
   * Optional detailed error information
   */
  details?: string;
  /**
   * Whether to show a retry button
   */
  showRetry?: boolean;
  /**
   * Custom class name
   */
  className?: string;
  /**
   * Error severity level
   */
  severity?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  details,
  showRetry = false,
  className,
  severity = 'error',
}) => {
  const severityStyles = {
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-400',
      text: 'text-red-800',
      button: 'text-red-600 hover:text-red-500',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-400',
      text: 'text-yellow-800',
      button: 'text-yellow-600 hover:text-yellow-500',
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-400',
      text: 'text-blue-800',
      button: 'text-blue-600 hover:text-blue-500',
    },
  };

  const styles = severityStyles[severity];

  return (
    <div
      className={clsx(
        'rounded-lg border p-4',
        styles.container,
        className
      )}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {severity === 'error' && (
            <svg
              className={clsx('h-5 w-5', styles.icon)}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {severity === 'warning' && (
            <svg
              className={clsx('h-5 w-5', styles.icon)}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {severity === 'info' && (
            <svg
              className={clsx('h-5 w-5', styles.icon)}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <h3 className={clsx('text-sm font-medium', styles.text)}>
            {message}
          </h3>
          {details && (
            <div className={clsx('mt-2 text-sm', styles.text)}>
              {details}
            </div>
          )}
          {showRetry && onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className={clsx(
                  'text-sm font-medium',
                  styles.button,
                  'focus:outline-none focus:underline'
                )}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 