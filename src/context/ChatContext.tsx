import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatContextType, Thread, Message } from '../types/chat';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createThread = useCallback(async () => {
    try {
      const newThread: Thread = {
        id: uuidv4(),
        title: 'New Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setThreads(prev => [...prev, newThread]);
      setCurrentThread(newThread);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create thread');
    }
  }, []);

  const switchThread = useCallback((threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      setCurrentThread(thread);
    }
  }, [threads]);

  const deleteThread = useCallback(async (threadId: string) => {
    try {
      setThreads(prev => prev.filter(t => t.id !== threadId));
      if (currentThread?.id === threadId) {
        setCurrentThread(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete thread');
    }
  }, [currentThread]);

  const sendMessage = useCallback(async (content: string) => {
    if (!currentThread) {
      throw new Error('No active thread');
    }

    try {
      setIsLoading(true);
      setError(null);

      const newMessage: Message = {
        id: uuidv4(),
        content,
        role: 'user',
        timestamp: new Date(),
        status: 'sending',
      };

      // Update the current thread with the new message
      const updatedThread: Thread = {
        ...currentThread,
        messages: [...currentThread.messages, newMessage],
        updatedAt: new Date(),
      };

      // Update threads state
      setThreads(prev =>
        prev.map(t => (t.id === currentThread.id ? updatedThread : t))
      );
      setCurrentThread(updatedThread);

      // TODO: Implement actual API call here
      // For now, just simulate a response
      const assistantMessage: Message = {
        id: uuidv4(),
        content: 'This is a mock response.',
        role: 'assistant',
        timestamp: new Date(),
        status: 'sent',
      };

      // Update thread with assistant's response
      const finalThread: Thread = {
        ...updatedThread,
        messages: [...updatedThread.messages, assistantMessage],
        updatedAt: new Date(),
      };

      setThreads(prev =>
        prev.map(t => (t.id === currentThread.id ? finalThread : t))
      );
      setCurrentThread(finalThread);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [currentThread]);

  const value: ChatContextType = {
    currentThread,
    threads,
    isLoading,
    error,
    sendMessage,
    createThread,
    switchThread,
    deleteThread,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}; 