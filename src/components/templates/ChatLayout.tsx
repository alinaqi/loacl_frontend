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
  isMobile?: boolean;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ 
  className,
  title = "Chat Assistant",
  messages = [],
  suggestedQuestions = [],
  onQuestionSelect = () => {},
  isTyping = false,
  isMobile = false,
}) => {
  return (
    <div className={`flex flex-col h-screen bg-gray-50 ${className || ''}`}>
      <ErrorBoundary>
        <div className="flex-none">
          <ChatHeader 
            title={title}
            className="px-4 sm:px-6 md:px-8 py-2 sm:py-3"
          />
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 py-2 sm:py-3">
              <div className="max-w-3xl mx-auto">
                <MessageList 
                  messages={messages}
                  isTyping={isTyping}
                  className="space-y-2 sm:space-y-3"
                />
              </div>
            </div>
            
            <div className="flex-none bg-white border-t border-gray-200">
              <div className="max-w-3xl mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-3">
                <SuggestedQuestions 
                  className="mb-2 sm:mb-3 overflow-x-auto flex-nowrap"
                  questions={suggestedQuestions}
                  onQuestionSelect={onQuestionSelect}
                  initialCount={isMobile ? 2 : 3}
                />
                <ChatInput 
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default ChatLayout; 