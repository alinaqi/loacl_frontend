import React, { useCallback, useState, useRef } from 'react';
import clsx from 'clsx';

export interface FileUploadProps {
  /**
   * Function called when files are selected
   */
  onFileSelect: (files: File[]) => void;
  /**
   * Allowed file types (e.g., ['image/*', '.pdf'])
   */
  accept?: string[];
  /**
   * Maximum file size in bytes
   */
  maxSize?: number;
  /**
   * Allow multiple file selection
   */
  multiple?: boolean;
  /**
   * Custom class name
   */
  className?: string;
  /**
   * Error message to display
   */
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = ['*/*'],
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  className,
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: File[]): File[] => {
    return files.filter(file => {
      // Check file size
      if (file.size > maxSize) {
        console.warn(`File ${file.name} is too large`);
        return false;
      }

      // Check file type if accept is specified
      if (accept[0] !== '*/*') {
        const fileType = file.type;
        const fileExtension = `.${file.name.split('.').pop()}`;
        const isValidType = accept.some(type => {
          if (type.startsWith('.')) {
            return type.toLowerCase() === fileExtension.toLowerCase();
          }
          if (type.endsWith('/*')) {
            const [category] = type.split('/');
            return fileType.startsWith(`${category}/`);
          }
          return type === fileType;
        });

        if (!isValidType) {
          console.warn(`File ${file.name} type not accepted`);
          return false;
        }
      }

      return true;
    });
  }, [accept, maxSize]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);
    if (validFiles.length) {
      onFileSelect(multiple ? validFiles : [validFiles[0]]);
    }
  }, [multiple, onFileSelect, validateFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    const validFiles = validateFiles(selectedFiles);
    if (validFiles.length) {
      onFileSelect(multiple ? validFiles : [validFiles[0]]);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [multiple, onFileSelect, validateFiles]);

  return (
    <div className={clsx('w-full', className)}>
      <div
        className={clsx(
          'relative border-2 border-dashed rounded-lg p-6',
          'flex flex-col items-center justify-center',
          'transition-colors duration-200',
          {
            'border-blue-500 bg-blue-50': isDragging,
            'border-blue-400 bg-blue-50': isHovered && !error,
            'border-gray-300 hover:border-blue-400': !isDragging && !isHovered && !error,
            'border-red-300 bg-red-50': error,
          }
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept.join(',')}
          multiple={multiple}
          onChange={handleFileSelect}
          aria-label="File upload"
        />
        <div className="text-center">
          <svg
            className={clsx(
              'w-12 h-12 mx-auto mb-3',
              error ? 'text-red-400' : 'text-gray-400'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className={clsx(
            'text-sm',
            error ? 'text-red-500' : 'text-gray-600'
          )}>
            {error || (
              <>
                Drag and drop your {multiple ? 'files' : 'file'} here, or{' '}
                <span className="text-blue-500">browse</span>
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {accept[0] === '*/*'
              ? 'Any file type accepted'
              : `Accepted types: ${accept.join(', ')}`}
            {' · '}Max size: {Math.round(maxSize / (1024 * 1024))}MB
          </p>
        </div>
      </div>
    </div>
  );
}; 