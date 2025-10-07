import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CardHeader, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { X, Monitor, Send } from 'lucide-react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChemistryAIBotProps {
  subject: string;
  chapter: string;
  level: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChemistryAIBot({ subject, chapter, level, isOpen, onClose }: ChemistryAIBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Set initial greeting when chatbot opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialGreetings = {
        beginner: `Hi! I'm your Chemistry tutor for ${chapter}. I'll give you simple, easy explanations perfect for beginners! What would you like to learn? 🧪`,
        intermediate: `Hello! I'm here to help with ${chapter} at intermediate level. I'll provide detailed explanations with step-by-step breakdowns and practical examples! What concept interests you? ⚗️`,
        advanced: `Ready for advanced ${chapter}? I'll provide comprehensive explanations with deep theory, proofs, and advanced applications. What advanced topic shall we explore? 🔬`
      };
      
      const greeting: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: initialGreetings[level as keyof typeof initialGreetings] || initialGreetings.beginner,
        timestamp: new Date()
      };
      
      setMessages([greeting]);
    }
  }, [isOpen, chapter, level]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // No webhook URL - show placeholder response
      const placeholderResponses = {
        beginner: `I'm your Chemistry tutor for ${chapter}. I'll give you simple, easy explanations perfect for beginners! 🧪`,
        intermediate: `Hello! I'm here to help with ${chapter} at intermediate level. I'll provide detailed explanations with step-by-step breakdowns and practical examples! ⚗️`,
        advanced: `Ready for advanced ${chapter}? I'll provide comprehensive explanations with deep theory, proofs, and advanced applications. 🔬`
      };

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: placeholderResponses[level as keyof typeof placeholderResponses] || placeholderResponses.beginner,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Chemistry chatbot is coming soon! Stay tuned for AI-powered chemistry tutoring. 🧪`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-2 top-16 h-[calc(100vh-6rem)] w-[420px] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-lg" style={{ marginTop: '32px' }}>
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Monitor className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Chemistry AI Assistant</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-green-100 mt-2">
          {subject} • {chapter} • {level}
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full" style={{ height: 'calc(100vh - 240px)', maxHeight: 'calc(100vh - 240px)', overflowY: 'auto', overflowX: 'hidden' }}>
          <div className="p-4 space-y-6" style={{ minHeight: 'auto', width: '100%', paddingTop: '40px', paddingBottom: '20px', maxHeight: 'none', overflow: 'hidden' }}>
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
                style={{ marginTop: index === 0 ? '20px' : '0px' }}
              >
                <div
                  className={cn(
                    "rounded-lg px-4 py-3 text-sm my-2",
                    message.role === 'user'
                      ? "bg-blue-600 text-white max-w-[85%]"
                      : "bg-gray-100 text-gray-900 message assistant w-full"
                  )}
                  style={{ 
                    minHeight: 'auto', 
                    maxHeight: 'none', 
                    overflow: 'visible',
                    wordWrap: 'break-word',
                    whiteSpace: 'normal',
                    marginTop: '8px',
                    marginBottom: '8px'
                  }}
                >
                   <div
                     className="message-content prose prose-sm max-w-none"
                     style={{
                       lineHeight: '1.6',
                       wordBreak: 'break-word',
                       overflowWrap: 'break-word',
                       whiteSpace: 'normal',
                       hyphens: 'auto',
                       maxWidth: '100%',
                       margin: '0',
                       padding: '6px 0',
                       overflow: 'hidden',
                       minHeight: 'auto',
                       textAlign: 'left',
                       direction: 'ltr',
                       fontSize: '14px',
                       fontFamily: 'inherit'
                     }}
                   >
                     {message.content}
                   </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    <span>Chemistry AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input Area */}
      <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about this chapter..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !input.trim()}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
