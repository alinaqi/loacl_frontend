import api from './api';
import { Chatbot, CreateChatbotRequest, ChatbotDesignSettings } from '../types/chatbot';

const BACKEND_API_KEY = import.meta.env.VITE_BACKEND_KEY;

export const chatbotApi = {
  getChatbots: async (): Promise<Chatbot[]> => {
    try {
      const response = await api.get<Chatbot[]>('/assistants', {
        headers: {
          'X-API-Key': BACKEND_API_KEY
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting chatbots:', error);
      throw error;
    }
  },

  createChatbot: async (data: CreateChatbotRequest): Promise<Chatbot> => {
    try {
      const response = await api.post<Chatbot>('/assistants', data, {
        headers: {
          'X-API-Key': BACKEND_API_KEY
        }
      });
      // Store the OpenAI API key for future OpenAI API calls
      localStorage.setItem('openai_api_key', data.api_key);
      return response.data;
    } catch (error) {
      console.error('Error creating chatbot:', error);
      throw error;
    }
  },

  updateChatbotSettings: async (assistantId: string, settings: ChatbotDesignSettings): Promise<Chatbot> => {
    try {
      const response = await api.put<Chatbot>(`/assistants/${assistantId}`, {
        theme: settings.theme,
        chat_bubble_text: "Chat with me!",
        initial_message: "Hello! How can I help you today!"
      }, {
        headers: {
          'X-API-Key': BACKEND_API_KEY
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating chatbot settings:', error);
      throw error;
    }
  },

  getChatbotSettings: async (assistantId: string): Promise<Chatbot> => {
    try {
      const response = await api.get<Chatbot>(`/assistants/${assistantId}`, {
        headers: {
          'X-API-Key': BACKEND_API_KEY
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting chatbot settings:', error);
      throw error;
    }
  },

  deleteChatbot: async (assistantId: string): Promise<void> => {
    try {
      await api.delete(`/assistants/${assistantId}`, {
        headers: {
          'X-API-Key': BACKEND_API_KEY
        }
      });
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      throw error;
    }
  },

  getWidgetCode: async (assistantId: string): Promise<string> => {
    try {
      const response = await api.get<{ code: string }>(`/assistants/${assistantId}/embed`, {
        headers: {
          'X-API-Key': BACKEND_API_KEY
        }
      });
      return response.data.code;
    } catch (error) {
      console.error('Error getting widget code:', error);
      throw error;
    }
  },

  getChatbotApiKey: async (assistantId: string): Promise<{ api_key: string }> => {
    try {
      const response = await api.get<{ api_key: string }>(`/assistants/${assistantId}/api-key`, {
        headers: {
          'X-API-Key': BACKEND_API_KEY
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting chatbot API key:', error);
      throw error;
    }
  }
}; 