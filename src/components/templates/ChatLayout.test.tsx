import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatLayout } from './ChatLayout';
import { Message } from '../../types/chat';
import { SuggestedQuestion } from '../organisms/SuggestedQuestions';

describe('ChatLayout', () => {
  const mockMessages: Message[] = [
    {
      id: '1',
      content: 'Hello',
      role: 'user',
      timestamp: new Date(),
      status: 'sent'
    },
    {
      id: '2',
      content: 'Hi there!',
      role: 'assistant',
      timestamp: new Date(),
      status: 'sent'
    }
  ];

  const mockSuggestedQuestions: SuggestedQuestion[] = [
    {
      id: '1',
      text: 'What is React?',
      category: 'Basics',
      priority: 1
    },
    {
      id: '2',
      text: 'How do hooks work?',
      category: 'Basics',
      priority: 2
    },
    {
      id: '3',
      text: 'What is TypeScript?',
      category: 'Advanced',
      priority: 1
    }
  ];

  it('renders with default props', () => {
    render(<ChatLayout />);
    expect(screen.getByText('Chat Assistant')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<ChatLayout title="Custom Assistant" />);
    expect(screen.getByText('Custom Assistant')).toBeInTheDocument();
  });

  it('renders messages correctly', () => {
    render(<ChatLayout messages={mockMessages} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('renders suggested questions', () => {
    render(
      <ChatLayout 
        suggestedQuestions={mockSuggestedQuestions}
        onQuestionSelect={() => {}}
      />
    );
    expect(screen.getByText('What is React?')).toBeInTheDocument();
    expect(screen.getByText('How do hooks work?')).toBeInTheDocument();
  });

  it('renders with typing indicator when isTyping is true', () => {
    render(<ChatLayout isTyping={true} />);
    expect(screen.getByText(/Assistant is typing/i)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ChatLayout className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  describe('Mobile Responsiveness', () => {
    it('shows fewer suggested questions on mobile', () => {
      render(
        <ChatLayout 
          suggestedQuestions={mockSuggestedQuestions}
          onQuestionSelect={() => {}}
          isMobile={true}
        />
      );
      
      // Should only show 2 questions on mobile
      expect(screen.getByText('What is React?')).toBeInTheDocument();
      expect(screen.getByText('How do hooks work?')).toBeInTheDocument();
      expect(screen.queryByText('What is TypeScript?')).not.toBeInTheDocument();
    });

    it('shows more suggested questions on desktop', () => {
      render(
        <ChatLayout 
          suggestedQuestions={mockSuggestedQuestions}
          onQuestionSelect={() => {}}
          isMobile={false}
        />
      );
      
      // Should show 3 questions on desktop
      expect(screen.getByText('What is React?')).toBeInTheDocument();
      expect(screen.getByText('How do hooks work?')).toBeInTheDocument();
      expect(screen.getByText('What is TypeScript?')).toBeInTheDocument();
    });

    it('applies responsive padding classes', () => {
      const { container } = render(<ChatLayout />);
      
      // Check for responsive padding classes
      expect(container.querySelector('.px-2.sm\\:px-4.md\\:px-6')).toBeInTheDocument();
    });
  });
}); 