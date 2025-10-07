import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
// @ts-ignore
import DOMPurify from 'dompurify';
// @ts-ignore
import { marked } from 'marked';
// @ts-ignore
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

const N8N_WEBHOOK_URL = "https://mailidpwd.app.n8n.cloud/webhook/e4187911-12cb-4d99-b426-bd78e8ede93e";

export default function SidebarAIBot({ subject, chapter, level, isOpen, onClose }: SidebarAIBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChapterTopics = {
    'Sets & Relations': {
      topics: ['Sets', 'Functions', 'Relations'],
      prompts: {
        'Sets': ['Definition', 'Example', 'Numeric Example'],
        'Functions': ['Definition', 'Example', 'Numeric Example'],
        'Relations': ['Definition', 'Example', 'Numeric Example']
      }
    },
    'Complex Numbers & Quadratic Equations': {
      topics: ['Complex Numbers', 'Quadratic Equations', 'Roots & Discriminant'],
      prompts: {
        'Complex Numbers': ['Definition', 'Example', 'Numeric Example'],
        'Quadratic Equations': ['Definition', 'Example', 'Numeric Example'],
        'Roots & Discriminant': ['Definition', 'Example', 'Numeric Example']
      }
    }
  };

  const chapterData = currentChapterTopics[chapter as keyof typeof currentChapterTopics] || currentChapterTopics['Sets & Relations'];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  // Simple and clean math rendering function
  const renderMathInElement = (element: HTMLElement) => {
    if (!element) return;

    // Clean up the HTML content first - remove all malformed HTML and styles
    let content = element.innerHTML
      // Decode HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Remove malformed HTML tags and styles that cause parse errors
      .replace(/style="[^"]*"/g, '')
      .replace(/<span[^>]*>/g, '')
      .replace(/<\/span>/g, '')
      .replace(/<div[^>]*>/g, '')
      .replace(/<\/div>/g, '')
      // Remove KaTeX parse error fragments
      .replace(/inmathmodeatposition\d+[^>]*>/g, '')
      .replace(/color:#cc0000">/g, '')
      .replace(/Expected 'EOF', got '[^']*' at position \d+: [^<]*</g, '')
      // Clean up text
      .replace(/\|/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Apply basic text formatting
    content = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');

    // Handle block math: $$ ... $$
    content = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
      try {
        const cleanFormula = formula.trim();
        if (!cleanFormula) return '<div class="math-display" style="padding: 12px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; text-align: center; color: #666;">[Invalid formula]</div>';

        const rendered = katex.renderToString(cleanFormula, { 
          displayMode: true, 
          throwOnError: false,
          strict: false
        });
        
        return `<div class="math-display" style="margin: 12px 0; padding: 12px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; text-align: center; overflow-x: auto;">${rendered}</div>`;
      } catch (e) {
        console.warn('Block math rendering failed:', e);
        return `<div class="math-display" style="padding: 12px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; text-align: center; font-family: monospace; color: #666;">[Math rendering error]</div>`;
      }
    });

    // Handle inline math: $ ... $
    content = content.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
      try {
        const cleanFormula = formula.trim();
        if (!cleanFormula) return '<span class="math-inline" style="padding: 2px 4px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; color: #666;">[Invalid]</span>';

        const rendered = katex.renderToString(cleanFormula, { 
          displayMode: false, 
          throwOnError: false,
          strict: false
        });
        
        return `<span class="math-inline" style="margin: 0 2px; padding: 2px 4px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; display: inline-block;">${rendered}</span>`;
      } catch (e) {
        console.warn('Inline math rendering failed:', e);
        return `<span class="math-inline" style="padding: 2px 4px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; font-family: monospace; color: #666;">[Math error]</span>`;
      }
    });

    // Update the element with cleaned content
    element.innerHTML = content;
  };

  // Render message content with markdown and math
  const renderMessageContent = (content: string) => {
    const html = marked(content);
    const cleanHtml = DOMPurify.sanitize(html);
    return cleanHtml;
  };

  // Apply math rendering after DOM update
  useEffect(() => {
    const timer = setTimeout(() => {
      const assistantMessages = document.querySelectorAll('.message.assistant .message-content');
      assistantMessages.forEach((element) => {
        renderMathInElement(element as HTMLElement);
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Check if question is math-related
  const isMathRelevant = (question: string) => {
    const mathKeywords = [
      'solve', 'equation', 'formula', 'calculate', 'find', 'math', 'algebra', 'geometry', 
      'calculus', 'trigonometry', 'statistics', 'probability', 'matrix', 'vector', 
      'function', 'derivative', 'integral', 'limit', 'series', 'sequence', 'complex',
      'quadratic', 'polynomial', 'linear', 'exponential', 'logarithm', 'graph',
      'slope', 'intercept', 'vertex', 'roots', 'discriminant', 'factor', 'expand'
    ];
    
    const questionLower = question.toLowerCase();
    return mathKeywords.some(keyword => questionLower.includes(keyword));
  };

  // Handle topic button clicks - auto-send prompts
  const handleTopicPrompt = async (topic: string, prompt: string) => {
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

    // Check if question is math-related
    if (!isMathRelevant(currentInput)) {
      const irrelevantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I'm sorry, but this question is not related to mathematics. I can only help with mathematical concepts, problems, and topics related to ${chapter}. Please ask me about math topics like equations, functions, geometry, calculus, or any other mathematical concepts! 📚`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, irrelevantMessage]);
      setIsLoading(false);
      return;
    }

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

      {/* Topic Buttons */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <p className="text-sm font-medium text-gray-700 mb-2">Quick Topics:</p>
        <div className="space-y-2">
          {chapterData.topics.map((topic) => (
            <div key={topic}>
              <div className="flex gap-1 mb-1">
                <button
                  onClick={() => handleTopicPrompt(topic, 'Definition')}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  {topic}
                </button>
                {chapterData.prompts[topic as keyof typeof chapterData.prompts].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleTopicPrompt(topic, prompt)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 space-y-4" style={{ maxHeight: 'calc(100vh - 240px)' }}>
        <div style={{ paddingTop: '20px' }}>
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${index === 0 ? 'mt-5' : ''}`}
              style={{ marginTop: index === 0 ? '20px' : '8px', marginBottom: '8px' }}
            >
              <div
                className={`max-w-[90%] px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
                style={{
                  maxWidth: '90%',
                  overflow: 'hidden',
                  wordWrap: 'break-word',
                  whiteSpace: 'normal'
                }}
              >
                <div
                  className="message-content"
                  dangerouslySetInnerHTML={{ __html: renderMessageContent(message.content) }}
                  style={{
                    lineHeight: '1.6',
                    padding: '6px 0',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    overflow: 'hidden',
                    textAlign: 'left',
                    direction: 'ltr'
                  }}
                />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg max-w-[90%]">
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

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
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
      beginner: `EXACTLY 2-3 sentences max. NO examples, NO practice problems, NO exam tips. Just the core concept explained simply.`,
      intermediate: `EXACTLY 4-5 sentences. Include theoretical foundation with ONE simple example. NO practice problems, NO exam tips.`,
      advanced: `EXACTLY 6-8 sentences. Include deep theory, mathematical proofs, and advanced applications. NO practice problems, NO exam tips.`
    };

    const contextPrompt = `You are a mathematics tutor for JEE Mains preparation. 
Subject: Mathematics
Chapter: ${chapter}
Student Level: ${level}
Student Question: "${question}"

Instructions: Answer directly without greetings. ${levelPrompts[level as keyof typeof levelPrompts]}

For problem-solving requests (containing words like "solve", "calculate", "find"), provide clear, numbered steps showing the complete solution process. Do NOT skip any mathematical operations.

Use PERFECT LaTeX formatting for all mathematical expressions:
- Inline math: $x^2 + bx + c = 0$
- Display math: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
- Use \\Delta for discriminant
- Use \\sqrt{} for square roots
- Use \\pm for plus-minus
- Use \\frac{numerator}{denominator} for fractions
- Use ^{} for superscripts and _{} for subscripts
- Use \\cdot for multiplication`;

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
