import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MessageBubble } from './MessageBubble';

describe('MessageBubble', () => {
  const defaultProps = {
    message: 'Hello, world!',
    isUser: true,
  };

  it('renders user message correctly', () => {
    render(<MessageBubble {...defaultProps} />);
    
    const message = screen.getByText('Hello, world!');
    expect(message).toBeInTheDocument();
    expect(screen.getByRole('article')).toHaveAttribute('aria-label', 'Your message');
  });

  it('renders assistant message correctly', () => {
    render(<MessageBubble {...defaultProps} isUser={false} />);
    
    const message = screen.getByText('Hello, world!');
    expect(message).toBeInTheDocument();
    expect(screen.getByRole('article')).toHaveAttribute('aria-label', 'Assistant message');
  });

  it('displays timestamp when provided', () => {
    const timestamp = '2024-02-20T12:00:00';
    render(<MessageBubble {...defaultProps} timestamp={timestamp} />);
    
    const time = screen.getByRole('time');
    expect(time).toBeInTheDocument();
    expect(time).toHaveAttribute('dateTime', timestamp);
  });

  it('does not display timestamp when not provided', () => {
    render(<MessageBubble {...defaultProps} />);
    
    const time = screen.queryByRole('time');
    expect(time).not.toBeInTheDocument();
  });
}); 