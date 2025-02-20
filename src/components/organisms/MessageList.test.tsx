import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MessageList } from './MessageList';
import { Message } from '../../types/chat';

describe('MessageList', () => {
  const mockMessages: Message[] = [
    {
      id: '1',
      content: 'Hello!',
      role: 'user',
      timestamp: new Date('2024-02-20T10:00:00'),
      status: 'sent'
    },
    {
      id: '2',
      content: 'Hi there!',
      role: 'assistant',
      timestamp: new Date('2024-02-20T10:01:00'),
      status: 'sent'
    }
  ];

  it('renders messages correctly', () => {
    render(<MessageList messages={mockMessages} />);
    
    expect(screen.getByText('Hello!')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('shows typing indicator when isTyping is true', () => {
    render(<MessageList messages={mockMessages} isTyping={true} />);
    
    expect(screen.getByText('Assistant is typing')).toBeInTheDocument();
  });

  it('shows error message and retry button when error occurs', () => {
    const mockRetry = jest.fn();
    const errorMessage = 'Network error';
    
    render(
      <MessageList 
        messages={mockMessages} 
        error={errorMessage} 
        onRetry={mockRetry} 
      />
    );
    
    expect(screen.getByText('Failed to send message')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    
    const retryButton = screen.getByText('Try again');
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility attributes', () => {
    render(<MessageList messages={mockMessages} />);
    
    const messageList = screen.getByRole('log');
    expect(messageList).toHaveAttribute('aria-label', 'Message list');
  });
}); 