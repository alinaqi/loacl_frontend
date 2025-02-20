import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VoiceInput } from './VoiceInput';

interface MockDataAvailableEvent {
  data: Blob;
}

// Mock MediaRecorder
class MockMediaRecorder {
  state: string = 'inactive';
  ondataavailable: ((e: MockDataAvailableEvent) => void) | null = null;
  onstop: (() => void) | null = null;

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) this.onstop();
  }
}

// Type assertion for global MediaRecorder
declare global {
  interface Window {
    MediaRecorder: typeof MockMediaRecorder;
  }
}

describe('VoiceInput', () => {
  const mockOnRecordingComplete = jest.fn();
  const mockOnRecordingStart = jest.fn();
  const defaultProps = {
    onRecordingComplete: mockOnRecordingComplete,
    onRecordingStart: mockOnRecordingStart,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock getUserMedia
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: () => [{
            stop: jest.fn()
          }]
        })
      }
    });
    // Mock MediaRecorder
    global.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder;
  });

  it('renders record button', () => {
    render(<VoiceInput {...defaultProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByLabelText('Start recording')).toBeInTheDocument();
  });

  it('starts recording when button is clicked', async () => {
    render(<VoiceInput {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(button);
    });

    expect(mockOnRecordingStart).toHaveBeenCalled();
    expect(screen.getByLabelText('Stop recording')).toBeInTheDocument();
  });

  it('stops recording when button is clicked again', async () => {
    render(<VoiceInput {...defaultProps} />);
    
    const button = screen.getByRole('button');
    
    // Start recording
    await act(async () => {
      fireEvent.click(button);
    });

    // Stop recording
    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByLabelText('Start recording')).toBeInTheDocument();
  });

  it('shows error when microphone access is denied', async () => {
    // Mock getUserMedia to reject
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn().mockRejectedValue(new Error('Permission denied'))
      }
    });

    render(<VoiceInput {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByText('Microphone access denied')).toBeInTheDocument();
  });

  it('disables recording when disabled prop is true', () => {
    render(<VoiceInput {...defaultProps} disabled />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('shows timer while recording', async () => {
    jest.useFakeTimers();
    
    render(<VoiceInput {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(button);
    });

    // Advance timer by 5 seconds
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.getByText('0:05')).toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it('stops recording when max duration is reached', async () => {
    jest.useFakeTimers();
    
    render(<VoiceInput {...defaultProps} maxDuration={5000} />);
    
    const button = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(button);
    });

    // Advance timer past max duration
    await act(async () => {
      jest.advanceTimersByTime(5100);
    });

    expect(screen.getByLabelText('Start recording')).toBeInTheDocument();
    
    jest.useRealTimers();
  });
}); 