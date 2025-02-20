export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
}

export interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatContextType {
  currentThread: Thread | null;
  threads: Thread[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  createThread: () => Promise<void>;
  switchThread: (threadId: string) => void;
  deleteThread: (threadId: string) => Promise<void>;
} 