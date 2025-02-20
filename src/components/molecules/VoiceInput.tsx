import React, { useCallback, useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

type Timer = ReturnType<typeof setTimeout>;

export interface VoiceInputProps {
  /**
   * Called when recording is complete with the audio blob
   */
  onRecordingComplete: (blob: Blob) => void;
  /**
   * Called when recording starts
   */
  onRecordingStart?: () => void;
  /**
   * Maximum recording duration in milliseconds
   */
  maxDuration?: number;
  /**
   * Custom class name
   */
  className?: string;
  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onRecordingComplete,
  onRecordingStart,
  maxDuration = 60000, // 1 minute default
  className,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string>();
  const [duration, setDuration] = useState(0);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<Timer>();
  
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        stream.getTracks().forEach(track => track.stop());
        setDuration(0);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      onRecordingStart?.();
      setError(undefined);

      // Start duration timer
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const currentDuration = Date.now() - startTime;
        setDuration(currentDuration);
        
        if (currentDuration >= maxDuration) {
          stopRecording();
        }
      }, 100);
    } catch (err) {
      setError('Microphone access denied');
      console.error('Error accessing microphone:', err);
    }
  }, [maxDuration, onRecordingComplete, onRecordingStart]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorder.current?.state === 'recording') {
        mediaRecorder.current.stop();
      }
    };
  }, []);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={clsx(
          'relative p-3 rounded-full transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          {
            'bg-red-500 hover:bg-red-600 focus:ring-red-500': isRecording,
            'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500': !isRecording,
            'opacity-50 cursor-not-allowed': disabled,
          }
        )}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording ? (
          <svg
            className="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="6" y="6" width="12" height="12" />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="6" />
          </svg>
        )}
        {isRecording && (
          <span className="absolute -top-1 -right-1 h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
        )}
      </button>
      {isRecording && (
        <span className="text-sm text-gray-600">
          {formatDuration(duration)}
        </span>
      )}
      {error && (
        <span className="text-sm text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}; 