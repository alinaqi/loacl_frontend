export interface ChatbotAnalytics {
  total_conversations: number;
  total_messages: number;
  average_response_time: number;
  user_satisfaction_rate: number;
  daily_active_users: number;
  messages_per_conversation: number;
  peak_usage_times: { hour: number; count: number }[];
  common_topics: { topic: string; count: number }[];
}

export interface ChatbotDesignSettings {
  theme: {
    primary_color: string;
    secondary_color: string;
    text_color: string;
    background_color: string;
  };
  chat_bubble_text: string;
  initial_message: string;
}

export interface Chatbot {
  id: string;
  name: string;
  description: string;
  instructions: string;
  model: string;
  assistant_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  design_settings: ChatbotDesignSettings;
  analytics?: ChatbotAnalytics;
}

export interface CreateChatbotRequest {
  name: string;
  description: string;
  instructions: string;
  model: string;
  api_key: string;
  assistant_id: string;
  tools_enabled: string[];
}

export interface NewChatbotInput {
  name: string;
  assistant_id: string;
  api_key: string;
  features: {
    showFileUpload: boolean;
    showVoiceInput: boolean;
    showEmoji: boolean;
    showGuidedQuestions: boolean;
    showFollowUpSuggestions: boolean;
  };
  design_settings: ChatbotDesignSettings;
} 