import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import hljs from 'highlight.js';

// Import KaTeX for math rendering
declare const katex: any;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SidebarAIBotProps {
  subject: string;
  chapter: string;
  level: string;
  isOpen: boolean;
  onClose: () => void;
}

// Use proxy to avoid CORS issues
const N8N_WEBHOOK_URL = import.meta.env.PROD 
  ? "/api/webhook-proxy" 
  : "/api/webhook-proxy";

export default function SidebarAIBot({ subject, chapter, level, isOpen, onClose }: SidebarAIBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChapterTopics: Record<string, { topics: string[], prompts: Record<string, string[]> }> = {
    'Sets & Relations': {
      topics: ['Sets', 'Functions', 'Relations'],
      prompts: {
        'Sets': ['Definition', 'Explanation', 'Numeric Example'],
        'Functions': ['Definition', 'Explanation', 'Numeric Example'],
        'Relations': ['Definition', 'Explanation', 'Numeric Example']
      }
    },
    'Complex Numbers & Quadratic Equations': {
      topics: ['Complex Numbers', 'Quadratic Equations', 'Roots & Discriminant'],
      prompts: {
        'Complex Numbers': ['Definition', 'Explanation', 'Numeric Example'],
        'Quadratic Equations': ['Definition', 'Explanation', 'Numeric Example'],
        'Roots & Discriminant': ['Definition', 'Explanation', 'Numeric Example']
      }
    }
  };

  const chapterData = currentChapterTopics[chapter] || currentChapterTopics['Sets & Relations'];

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

  // Set initial greeting when component mounts
  useEffect(() => {
    const initialGreetings = {
      beginner: `Hi! I'm here to help you understand ${chapter} at beginner level. I'll explain concepts simply with clear examples. What would you like to learn? 🌟`,
      intermediate: `Hello! I'm here to help with ${chapter} at intermediate level. I'll provide detailed explanations with step-by-step breakdowns and practical examples! What concept interests you? 📚`,
      advanced: `Ready for advanced ${chapter}? I'll provide comprehensive explanations with deep theory, proofs, and advanced applications. What advanced topic shall we explore? ⚡`
    };
    
    const greeting: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: initialGreetings[level as keyof typeof initialGreetings] || initialGreetings.beginner,
      timestamp: new Date()
    };
    
    setMessages([greeting]);
  }, [chapter, level]);

  // Professional Math Rendering with MathJax
  const renderMessageContent = (content: string) => {
    // Process markdown and LaTeX formatting
    let processedContent = content
      // Convert markdown headers to HTML
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Convert bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Convert line breaks
      .replace(/\n/g, '<br>')
      // Convert bullet points
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      // Wrap consecutive list items
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      // Clean up nested ul tags
      .replace(/<\/ul>\s*<ul>/g, '');
    
    return processedContent;
  };

  // MathJax rendering effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((window as any).MathJax && (window as any).MathJax.typesetPromise) {
        (window as any).MathJax.typesetPromise().then(() => {
          console.log('MathJax rendered successfully');
        }).catch((err: any) => {
          console.log('MathJax rendering error:', err);
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // NO RESTRICTIONS - Users can ask ANY question they want!

  // Handle main topic click - expand/collapse sub-topics
  const handleMainTopicClick = (topic: string) => {
    if (expandedTopic === topic) {
      setExpandedTopic(null); // Collapse if already expanded
    } else {
      setExpandedTopic(topic); // Expand this topic
    }
  };

  // Handle topic button clicks - auto-send prompts
  const handleTopicPrompt = async (topic: string, prompt: string) => {
    // Collapse the sub-topics immediately when clicked
    setExpandedTopic(null);
    
    const fullPrompt = `Explain ${prompt.toLowerCase()} of ${topic} in ${chapter} for ${level} level`;
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: fullPrompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponse = await askN8n(fullPrompt, chapter, level);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse || 'Sorry, I could not process your request. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Sorry, I'm having trouble connecting right now. Please try again in a moment. 🔄`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    // NO RESTRICTIONS - Process ALL user questions!

    try {
      const aiResponse = await askN8n(currentInput, chapter, level);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse || 'Sorry, I could not process your request. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I'm having trouble processing your question right now. Please try again in a moment! 😅`,
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
    <div className="fixed right-0 top-16 w-[450px] h-[calc(100vh-4rem)] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col chatbot-container">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">🧮 AI Study Assistant</h3>
          <p className="text-sm opacity-90">{subject} • {chapter} • {level}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>


      {/* Messages */}
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 200px)', maxHeight: 'calc(100vh - 200px)' }}>
        <ScrollArea className="h-full w-full" style={{ height: '100%' }}>
          <div className="p-4" style={{ paddingBottom: '20px' }}>
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                style={{ marginTop: index === 0 ? '20px' : '0px' }}
              >
                <div
                  className={`px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                  style={{
                    maxWidth: '100%',
                    width: '100%',
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                    minHeight: 'auto',
                    boxSizing: 'border-box'
                  }}
                >
                  <div
                    className="message-content response-content"
                    dangerouslySetInnerHTML={{ __html: renderMessageContent(message.content) }}
                    style={{
                      lineHeight: '1.6',
                      padding: '16px 0',
                      fontSize: '15px',
                      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      textAlign: 'left',
                      color: '#333',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}
                  />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div 
                  className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg"
                  style={{
                    maxWidth: '100%',
                    width: '100%',
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                    boxSizing: 'border-box'
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Quick Topics - Above Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-sm font-medium text-gray-700 mb-3">Quick Topics:</p>
        
        {/* Main Topic Boxes - Horizontal Layout */}
        <div className="flex gap-2 mb-3">
          {chapterData.topics.map((topic) => (
            <button
              key={topic}
              onClick={() => handleMainTopicClick(topic)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                expandedTopic === topic 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Sub-topics Display - Show when a main topic is selected */}
        {expandedTopic && (
          <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
            <p className="text-xs font-medium text-gray-600 mb-2">Choose what you want to learn about <span className="text-blue-600 font-semibold">{expandedTopic}:</span></p>
            <div className="grid grid-cols-1 gap-1">
              {chapterData.prompts[expandedTopic as keyof typeof chapterData.prompts].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleTopicPrompt(expandedTopic, prompt)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded hover:bg-blue-50 hover:text-blue-700 transition-colors text-left border border-gray-100"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Field */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask about ${chapter}...`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple and clean n8n webhook function
async function askN8n(question: string, chapter: string, level: string): Promise<string> {
  try {
    const levelPrompts = {
      beginner: `EXACTLY 2-3 sentences max. NO practice problems, NO exam tips. Just the core concept explained simply.`,
      intermediate: `EXACTLY 4-5 sentences. Include theoretical foundation. NO practice problems, NO exam tips.`,
      advanced: `EXACTLY 6-8 sentences. Include deep theory, mathematical proofs, and advanced applications. NO practice problems, NO exam tips.`
    };

    const contextPrompt = `You are a mathematics tutor for JEE Mains preparation. 
Subject: Mathematics
Chapter: ${chapter}
Student Level: ${level}
Student Question: "${question}"

Instructions: Answer directly without greetings. Be helpful and answer ANY question the user asks, whether it's about math, general topics, or anything else. ${levelPrompts[level as keyof typeof levelPrompts]}

  For NUMERIC EXAMPLE requests, ignore sentence limits and provide a complete step-by-step example with this EXACT structure:
  
  ## Sets Definition
  
  Let \\( A = \\{1, 2, 3, 4\\} \\)  
  Let \\( B = \\{p, q, r\\} \\)
  
  ## Cartesian Product
  
  The Cartesian product \\( A \\times B \\) is:
  
  $$
  A \\times B = \\{
    (1,p), (1,q), (1,r), (2,p), (2,q), (2,r), 
    (3,p), (3,q), (3,r), (4,p), (4,q), (4,r)
  \\}
  $$
  
  ## Defining the Relation
  
  A relation \\( R \\) from \\( A \\) to \\( B \\) is any subset of \\( A \\times B \\). Let's define \\( R \\) as:
  
  $$
  R = \\{ (1,q), (2,p), (3,r) \\}
  $$
  
  ### Explanation:
  - \\( 1 \\) from set \\( A \\) is related to \\( q \\) from set \\( B \\)
  - \\( 2 \\) from set \\( A \\) is related to \\( p \\) from set \\( B \\)  
  - \\( 3 \\) from set \\( A \\) is related to \\( r \\) from set \\( B \\)
  - \\( 4 \\) from set \\( A \\) does not relate to anything in \\( B \\) under this specific relation \\( R \\)

For problem-solving requests (containing words like "solve", "calculate", "find"), provide clear, numbered steps showing the complete solution process. Do NOT skip any mathematical operations.

Use PROFESSIONAL LaTeX formatting for all mathematical expressions:
- Inline math: \\( A = \\{1, 2, 3\\} \\)
- Display math: $$ A \\times B = \\{(1,p), (2,q)\\} $$
- Sets: \\( A = \\{1, 2, 3\\} \\), \\( B = \\{p, q, r\\} \\)
- Relations: \\( R = \\{(1,p), (2,q)\\} \\)
- Use \\times for Cartesian product
- Use \\{ and \\} for set braces
- Use proper spacing in LaTeX expressions
- Use ## for main headings, ### for subheadings
- Use bullet points (-) for explanations`;

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: crypto.randomUUID(),
        message: contextPrompt
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    
    if (responseText.trim() === '') {
      return "⚠️ No response received from the AI service. Please try again.";
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      // Handle n8n response format: [{"output": "..."}]
      if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
        responseData = { reply: responseData[0].output };
      }
    } catch (e) {
      responseData = { reply: responseText };
    }

    return responseData.reply || "Sorry, I couldn't process your request. Please try again.";
  } catch (error) {
    console.error('Error calling n8n webhook:', error);
    return "I'm having trouble connecting to the AI service. Please try again in a moment.";
  }
}
