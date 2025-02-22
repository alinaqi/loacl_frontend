export interface PlaygroundConfig {
  openaiKey: string;
  assistantId: string;
  name: string;
  description: string;
  uuid?: string;
  theme?: {
    primary_color: string;
    secondary_color: string;
    text_color: string;
    background_color: string;
  };
  chat_bubble_text?: string;
  initial_message?: string;
  features?: {
    showFileUpload: boolean;
    showVoiceInput: boolean;
    showEmoji: boolean;
  };
} 