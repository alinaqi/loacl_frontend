import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatInput } from './ChatInput';
import { useChatContext } from '../../context/ChatContext';

// Mock the ChatContext
jest.mock('../../context/ChatContext', () => ({
  useChatContext: jest.fn(),
}));

describe('ChatInput', () => {
  const mockSendMessage = jest.fn();
  
  beforeEach(() => {
    (useChatContext as jest.Mock).mockReturnValue({
      sendMessage: mockSendMessage,
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<ChatInput />);
    
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByLabelText('Send message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start recording' })).toBeInTheDocument();
  });

  it('handles text input and sends message', async () => {
    render(<ChatInput />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByLabelText('Send message');

    fireEvent.change(input, { target: { value: 'Hello world' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Hello world');
    });
    expect(input).toHaveValue('');
  });

  it('handles Enter key press to send message', async () => {
    render(<ChatInput />);
    
    const input = screen.getByPlaceholderText('Type a message...');

    fireEvent.change(input, { target: { value: 'Hello world' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Hello world');
    });
    expect(input).toHaveValue('');
  });

  it('disables input when loading or disabled prop is true', () => {
    (useChatContext as jest.Mock).mockReturnValue({
      sendMessage: mockSendMessage,
      isLoading: true,
    });

    render(<ChatInput />);
    
    expect(screen.getByPlaceholderText('Type a message...')).toBeDisabled();
    expect(screen.getByLabelText('Send message')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Start recording' })).toBeDisabled();
  });

  it('hides file upload when enableFileUpload is false', () => {
    render(<ChatInput enableFileUpload={false} />);
    
    expect(screen.queryByText(/drag and drop your file here/i)).not.toBeInTheDocument();
  });

  it('hides voice input when enableVoiceInput is false', () => {
    render(<ChatInput enableVoiceInput={false} />);
    
    expect(screen.queryByRole('button', { name: 'Start recording' })).not.toBeInTheDocument();
  });

  it('handles file upload', async () => {
    render(<ChatInput />);
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText('File upload');

    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Uploaded files: test.txt');
    });
  });
}); 