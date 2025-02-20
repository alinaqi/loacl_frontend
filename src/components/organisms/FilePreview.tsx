import React from 'react';
import clsx from 'clsx';

export interface FileInfo {
  /**
   * The file object
   */
  file: File;
  /**
   * URL to preview the file (for images, PDFs, etc.)
   */
  previewUrl?: string;
  /**
   * Upload progress (0-100)
   */
  progress?: number;
  /**
   * Error message if upload failed
   */
  error?: string;
}

export interface FilePreviewProps {
  /**
   * Array of files to preview
   */
  files: FileInfo[];
  /**
   * Called when a file is removed
   */
  onRemove?: (file: File) => void;
  /**
   * Called when retry is clicked for a failed file
   */
  onRetry?: (file: File) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const FilePreview: React.FC<FilePreviewProps> = ({
  files,
  onRemove,
  onRetry,
  className,
}) => {
  const renderPreview = (fileInfo: FileInfo) => {
    const { file, previewUrl, progress, error } = fileInfo;
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    const fileSize = formatFileSize(file.size);

    return (
      <div
        key={file.name}
        className={clsx(
          'relative',
          'flex items-center',
          'p-4 rounded-lg',
          'border border-gray-200',
          'bg-white',
          'group',
          error && 'border-red-300 bg-red-50'
        )}
      >
        {/* Preview thumbnail */}
        <div className="w-12 h-12 flex-shrink-0 mr-4">
          {isImage && previewUrl ? (
            <img
              src={previewUrl}
              alt={file.name}
              className="w-full h-full object-cover rounded"
            />
          ) : isPDF && previewUrl ? (
            <iframe
              src={previewUrl}
              title={file.name}
              className="w-full h-full rounded"
            />
          ) : (
            <div className="w-full h-full rounded bg-gray-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* File info */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <p className="text-sm text-gray-500 ml-2">{fileSize}</p>
          </div>

          {error ? (
            <div className="flex items-center mt-1">
              <p className="text-sm text-red-600">{error}</p>
              {onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(file)}
                  className="ml-2 text-sm text-red-600 hover:text-red-500 font-medium"
                >
                  Retry
                </button>
              )}
            </div>
          ) : progress !== undefined && progress < 100 ? (
            <div className="mt-1">
              <div className="bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">{progress}% uploaded</p>
            </div>
          ) : null}
        </div>

        {/* Remove button */}
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(file)}
            className={clsx(
              'ml-4 p-1 rounded-full',
              'text-gray-400 hover:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            )}
            aria-label={`Remove ${file.name}`}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={clsx('space-y-2', className)} role="list">
      {files.map((fileInfo) => renderPreview(fileInfo))}
    </div>
  );
}; 