
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from 'react-hook-form';
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Message, SuggestedPrompt } from "@/types/ai";
import { 
  SendIcon, 
  RefreshCcw, 
  ClipboardList, 
  Mail, 
  FileText, 
  BookOpen, 
  Sparkles,
  Loader2,
  MessageCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from 'uuid';

const AIAssistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ message: string }>();

  // Suggested prompts
  const suggestedPrompts: SuggestedPrompt[] = [
    {
      title: "Write a to-do list for a personal project or task",
      prompt: "Create a comprehensive to-do list for studying for my upcoming math exam",
      icon: <ClipboardList className="h-5 w-5" />
    },
    {
      title: "Generate an email or reply to a job offer",
      prompt: "Write a professional email to request an extension on my assignment deadline",
      icon: <Mail className="h-5 w-5" />
    },
    {
      title: "Summarize this article or text for me in one paragraph",
      prompt: "Summarize the key concepts of cellular respiration in one paragraph",
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: "How does AI work in a technical capacity",
      prompt: "Explain how AI like yourself works in a way that a high school student would understand",
      icon: <Sparkles className="h-5 w-5" />
    }
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle form submission
  const onSubmit = async (data: { message: string }) => {
    try {
      if (!data.message.trim()) return;
      
      // Add user message to the chat
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: data.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      reset();
      
      // Format conversation history for the API
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Call the Gemini API via our edge function
      const response = await supabase.functions.invoke('gemini-ai', {
        body: {
          message: data.message,
          history,
          subject: activeSubject
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to get response');
      }
      
      // Add AI response to the chat
      const aiMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.data.reply,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in AI conversation:', error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggested prompt click
  const handlePromptClick = (prompt: string) => {
    if (formRef.current) {
      const messageInput = formRef.current.elements.namedItem('message') as HTMLInputElement;
      if (messageInput) {
        messageInput.value = prompt;
        messageInput.focus();
      }
    }
  };

  // Clear conversation
  const handleClearConversation = () => {
    setMessages([]);
    toast.success("Conversation cleared");
  };

  // Set subject filter
  const handleSetSubject = (subject: string | null) => {
    setActiveSubject(subject);
    toast.success(subject ? `Context set to ${subject}` : "Context cleared");
  };

  // Get current user's first name
  const getUserFirstName = () => {
    if (!user) return "there";
    const email = user.email || "";
    return email.split('@')[0] || "there";
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full border-none shadow-none">
        <CardHeader className="pb-0">
          <CardTitle className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-indigo-700">
              Hi {getUserFirstName()},
            </span>
            <div className="mt-2 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-500">
              What would you like to know?
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Use one of the most common prompts below or use your own to begin
            </div>
          </CardTitle>
        </CardHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-6 mt-4">
          {suggestedPrompts.map((item, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handlePromptClick(item.prompt)}
            >
              <CardContent className="p-4 flex items-start space-x-3">
                <div className="mt-1">
                  {item.icon}
                </div>
                <div className="text-sm">{item.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="px-6 mt-4 mb-2 flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearConversation}
            className="text-xs"
          >
            <RefreshCcw className="h-3 w-3 mr-1" /> 
            Refresh Prompts
          </Button>
          
          {activeSubject ? (
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-background"
              onClick={() => handleSetSubject(null)}
            >
              {activeSubject} ×
            </Badge>
          ) : null}
        </div>
        
        <CardContent className="flex-grow overflow-auto p-6 pt-0">
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-3/4 rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-3/4 rounded-lg p-4 bg-muted flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center text-muted-foreground">
              <div>
                <MessageCircle className="mx-auto h-12 w-12 opacity-50 mb-2" />
                <p>Ask me anything about your studies, homework,<br />or any topic you need help with!</p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t bg-card p-4">
          <form 
            ref={formRef}
            className="flex w-full items-center space-x-2" 
            onSubmit={handleSubmit(onSubmit)}
          >
            <Input
              {...register("message", { required: true })}
              placeholder="Ask whatever you want..."
              className="flex-grow"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading} 
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendIcon className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AIAssistant;
