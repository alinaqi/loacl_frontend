import React from 'react';
import { ChatHeader } from '../organisms/ChatHeader';
import { MessageList } from '../organisms/MessageList';
import { ChatInput } from '../organisms/ChatInput';
import { SuggestedQuestions, SuggestedQuestion } from '../organisms/SuggestedQuestions';
import { ErrorBoundary } from '../ErrorBoundary';
import { Message } from '../../types/chat';

interface ChatLayoutProps {
  className?: string;
  children?: React.ReactNode;
  title?: string;
  messages?: Message[];
  suggestedQuestions?: SuggestedQuestion[];
  onQuestionSelect?: (question: SuggestedQuestion) => void;
  isTyping?: boolean;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ 
  className,
  title = "Chat Assistant",
  messages = [],
  suggestedQuestions = [],
  onQuestionSelect = () => {},
  isTyping = false,
}) => {
  return (
    <div className={`flex flex-col h-screen bg-gray-50 ${className || ''}`}>
      <ErrorBoundary>
        <div className="flex-none">
          <ChatHeader title={title} />
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <MessageList 
                messages={messages}
                isTyping={isTyping}
              />
            </div>
            
            <div className="flex-none p-4 bg-white border-t border-gray-200">
              <SuggestedQuestions 
                className="mb-4"
                questions={suggestedQuestions}
                onQuestionSelect={onQuestionSelect}
              />
              <ChatInput />
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default ChatLayout; 