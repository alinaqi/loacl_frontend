import React from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IframeChatLayout } from './IframeChatLayout';
import { Message } from '../../types/chat';
import { SuggestedQuestion } from '../organisms/SuggestedQuestions';

describe('IframeChatLayout', () => {
  const mockMessages: Message[] = [
    {
      id: '1',
      content: 'Hello',
      role: 'user',
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
    }
  ];

  beforeEach(() => {
    // Mock postMessage
    window.parent.postMessage = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sends iframe-ready message on mount', () => {
    render(<IframeChatLayout />);
    expect(window.parent.postMessage).toHaveBeenCalledWith(
      { type: 'iframe-ready' },
      '*'
    );
  });

  it('respects custom targetOrigin', () => {
    const targetOrigin = 'https://example.com';
    render(<IframeChatLayout targetOrigin={targetOrigin} />);
    expect(window.parent.postMessage).toHaveBeenCalledWith(
      { type: 'iframe-ready' },
      targetOrigin
    );
  });

  it('updates messages when receiving chat-message event', () => {
    const { getByText } = render(<IframeChatLayout />);

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'chat-message',
            payload: { messages: mockMessages }
          }
        })
      );
    });

    expect(getByText('Hello')).toBeInTheDocument();
  });

  it('updates suggested questions when receiving chat-message event', () => {
    const { getByText } = render(<IframeChatLayout />);

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'chat-message',
            payload: { suggestedQuestions: mockSuggestedQuestions }
          }
        })
      );
    });

    expect(getByText('What is React?')).toBeInTheDocument();
  });

  it('updates theme when receiving theme event', () => {
    const { container } = render(<IframeChatLayout />);

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'theme',
            payload: { theme: 'dark' }
          }
        })
      );
    });

    expect(container.firstChild).toHaveClass('dark');
  });

  it('sends message to parent when question is selected', () => {
    const { getByText } = render(<IframeChatLayout />);

    // First, add the questions
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'chat-message',
            payload: { suggestedQuestions: mockSuggestedQuestions }
          }
        })
      );
    });

    // Then click the question
    getByText('What is React?').click();

    expect(window.parent.postMessage).toHaveBeenCalledWith(
      {
        type: 'question-selected',
        payload: { question: mockSuggestedQuestions[0] }
      },
      '*'
    );
  });

  it('ignores messages from unauthorized origins', () => {
    const targetOrigin = 'https://example.com';
    const { container } = render(<IframeChatLayout targetOrigin={targetOrigin} />);

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'theme',
            payload: { theme: 'dark' }
          },
          origin: 'https://malicious.com'
        })
      );
    });

    expect(container.firstChild).not.toHaveClass('dark');
  });
}); 