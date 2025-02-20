import React, { useEffect } from 'react';
import ChatLayout from './ChatLayout';
import { Message } from '../../types/chat';
import { SuggestedQuestion } from '../organisms/SuggestedQuestions';

interface IframeMessageEvent {
  type: 'chat-message' | 'theme' | 'config';
  payload: {
    messages?: Message[];
    isTyping?: boolean;
    suggestedQuestions?: SuggestedQuestion[];
    theme?: 'light' | 'dark';
    content?: string;
    question?: SuggestedQuestion;
  };
}

export interface IframeChatLayoutProps {
  className?: string;
  defaultTitle?: string;
  defaultTheme?: 'light' | 'dark';
  targetOrigin?: string;
}

export const IframeChatLayout: React.FC<IframeChatLayoutProps> = ({
  className,
  defaultTitle = "Chat Assistant",
  defaultTheme = 'light',
  targetOrigin = '*'
}) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = React.useState<SuggestedQuestion[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const [theme, setTheme] = React.useState(defaultTheme);

  // Handle incoming messages from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent<IframeMessageEvent>) => {
      // Validate origin if specified
      if (targetOrigin !== '*' && event.origin !== targetOrigin) {
        return;
      }

      const { type, payload } = event.data;

      switch (type) {
        case 'chat-message':
          if (payload.messages) {
            setMessages(payload.messages);
          }
          if (typeof payload.isTyping === 'boolean') {
            setIsTyping(payload.isTyping);
          }
          if (payload.suggestedQuestions) {
            setSuggestedQuestions(payload.suggestedQuestions);
          }
          break;
        case 'theme':
          if (payload.theme && ['light', 'dark'].includes(payload.theme)) {
            setTheme(payload.theme);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Notify parent that iframe is ready
    window.parent.postMessage({ type: 'iframe-ready' }, targetOrigin);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [targetOrigin]);

  // Handle sending messages to parent
  const handleQuestionSelect = (question: SuggestedQuestion) => {
    window.parent.postMessage({
      type: 'question-selected',
      payload: { question }
    }, targetOrigin);
  };

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <ChatLayout
        className={className}
        title={defaultTitle}
        messages={messages}
        suggestedQuestions={suggestedQuestions}
        onQuestionSelect={handleQuestionSelect}
        isTyping={isTyping}
        isMobile={window.innerWidth < 640}
      />
    </div>
  );
}; 