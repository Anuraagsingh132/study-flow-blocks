
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface SuggestedPrompt {
  title: string;
  prompt: string;
  icon: React.ReactNode;
}
