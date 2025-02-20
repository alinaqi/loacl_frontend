import React, { useState, useCallback, useRef } from 'react';
import clsx from 'clsx';
import { Input } from '../atoms/Input';
import { VoiceInput } from '../molecules/VoiceInput';
import { FileUpload } from '../molecules/FileUpload';
import { useChatContext } from '../../context/ChatContext';

export interface ChatInputProps {
  /**
   * Whether to show the file upload button
   */
  enableFileUpload?: boolean;
  /**
   * Whether to show the voice input button
   */
  enableVoiceInput?: boolean;
  /**
   * Placeholder text for the input
   */
  placeholder?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  enableFileUpload = true,
  enableVoiceInput = true,
  placeholder = 'Type a message...',
  className,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileUploadRef = useRef<HTMLDivElement>(null);
  
  const { sendMessage, isLoading } = useChatContext();

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() && !isUploading) return;
    
    try {
      await sendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [message, sendMessage, isUploading]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleFileUpload = useCallback(async (files: File[]) => {
    setIsUploading(true);
    try {
      // TODO: Implement file upload logic
      const fileNames = files.map(f => f.name).join(', ');
      await sendMessage(`Uploaded files: ${fileNames}`);
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setIsUploading(false);
    }
  }, [sendMessage]);

  const handleVoiceRecording = useCallback(async (blob: Blob) => {
    try {
      // TODO: Implement voice message logic
      const audioUrl = URL.createObjectURL(blob);
      await sendMessage(`Voice message recorded: ${audioUrl}`);
    } catch (error) {
      console.error('Failed to process voice recording:', error);
    }
  }, [sendMessage]);

  return (
    <div 
      className={clsx(
        'flex flex-col gap-2',
        'p-4',
        'border-t border-gray-200',
        'bg-white',
        className
      )}
    >
      {enableFileUpload && (
        <div ref={fileUploadRef} className="mb-2">
          <FileUpload
            onFileSelect={handleFileUpload}
            accept={['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png']}
            maxSize={10 * 1024 * 1024} // 10MB
            multiple={true}
          />
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <div className="flex-grow">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            variant="outline"
            size="md"
            rightElement={
              <button
                onClick={handleSendMessage}
                disabled={(!message.trim() && !isUploading) || disabled || isLoading}
                className={clsx(
                  'p-2 rounded-full',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                  {
                    'bg-blue-500 text-white hover:bg-blue-600': message.trim() || isUploading,
                    'bg-gray-200 text-gray-400 cursor-not-allowed': !message.trim() && !isUploading,
                  }
                )}
                aria-label="Send message"
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            }
          />
        </div>
        
        {enableVoiceInput && (
          <VoiceInput
            onRecordingComplete={handleVoiceRecording}
            disabled={disabled || isLoading}
            maxDuration={60000} // 1 minute
          />
        )}
      </div>
    </div>
  );
}; 