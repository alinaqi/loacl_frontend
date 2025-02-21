import api from './api';
import { Chatbot, CreateChatbotRequest, ChatbotDesignSettings } from '../types/chatbot';

export const chatbotApi = {
  createChatbot: async (data: CreateChatbotRequest): Promise<Chatbot> => {
    try {
      const response = await api.post<Chatbot>('/assistants', data);
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
      });
      return response.data;
    } catch (error) {
      console.error('Error updating chatbot settings:', error);
      throw error;
    }
  },

  getChatbotSettings: async (assistantId: string): Promise<Chatbot> => {
    try {
      const response = await api.get<Chatbot>(`/assistants/${assistantId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting chatbot settings:', error);
      throw error;
    }
  },

  deleteChatbot: async (assistantId: string): Promise<void> => {
    try {
      await api.delete(`/assistants/${assistantId}`);
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      throw error;
    }
  },

  getWidgetCode: async (assistantId: string): Promise<string> => {
    try {
      const response = await api.get<{ code: string }>(`/assistants/${assistantId}/embed`);
      return response.data.code;
    } catch (error) {
      console.error('Error getting widget code:', error);
      throw error;
    }
  }
}; 