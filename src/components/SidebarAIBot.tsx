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

// Use direct n8n webhook URL for now (CORS needs to be fixed in n8n)
const N8N_WEBHOOK_URL = "https://testbee.app.n8n.cloud/webhook/bf4dd093-bb02-472c-9454-7ab9af97bd1d";

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
    },
    'Matrices & Determinants': {
      topics: ['Matrix Basics', 'Types of Matrices', 'Determinants'],
      prompts: {
        'Matrix Basics': ['Definition', 'Explanation', 'Numeric Example'],
        'Types of Matrices': ['Definition', 'Explanation', 'Numeric Example'],
        'Determinants': ['Definition', 'Explanation', 'Numeric Example']
      }
    },
    'Permutations & Combinations': {
      topics: ['Permutations', 'Combinations', 'Applications'],
      prompts: {
        'Permutations': ['Definition', 'Explanation', 'Numeric Example'],
        'Combinations': ['Definition', 'Explanation', 'Numeric Example'],
        'Applications': ['Definition', 'Explanation', 'Numeric Example']
      }
    },
    'Binomial Theorem': {
      topics: ['Binomial Expansion', 'Coefficients', 'Applications'],
      prompts: {
        'Binomial Expansion': ['Definition', 'Explanation', 'Numeric Example'],
        'Coefficients': ['Definition', 'Explanation', 'Numeric Example'],
        'Applications': ['Definition', 'Explanation', 'Numeric Example']
      }
    },
    'Sequences & Series': {
      topics: ['Arithmetic Sequences', 'Geometric Sequences', 'Series Sum'],
      prompts: {
        'Arithmetic Sequences': ['Definition', 'Explanation', 'Numeric Example'],
        'Geometric Sequences': ['Definition', 'Explanation', 'Numeric Example'],
        'Series Sum': ['Definition', 'Explanation', 'Numeric Example']
      }
    },
    'Sequences and Series': {
      topics: ['Arithmetic Sequences', 'Geometric Sequences', 'Series Sum'],
      prompts: {
        'Arithmetic Sequences': ['Definition', 'Explanation', 'Numeric Example'],
        'Geometric Sequences': ['Definition', 'Explanation', 'Numeric Example'],
        'Series Sum': ['Definition', 'Explanation', 'Numeric Example']
      }
    },
    'Calculus Basics': {
      topics: ['Limits', 'Derivatives', 'Applications'],
      prompts: {
        'Limits': ['Definition', 'Explanation', 'Numeric Example'],
        'Derivatives': ['Definition', 'Explanation', 'Numeric Example'],
        'Applications': ['Definition', 'Explanation', 'Numeric Example']
      }
    },
    'Integration Basics': {
      topics: ['Indefinite Integration', 'Definite Integration', 'Applications'],
      prompts: {
        'Indefinite Integration': ['Definition', 'Explanation', 'Numeric Example'],
        'Definite Integration': ['Definition', 'Explanation', 'Numeric Example'],
        'Applications': ['Definition', 'Explanation', 'Numeric Example']
      }
    },
    'Coordinate Geometry Basics': {
      topics: ['Distance Formula', 'Midpoint Formula', 'Slope'],
      prompts: {
        'Distance Formula': ['Definition', 'Explanation', 'Numeric Example'],
        'Midpoint Formula': ['Definition', 'Explanation', 'Numeric Example'],
        'Slope': ['Definition', 'Explanation', 'Numeric Example']
      }
    },
    'Trigonometry': {
      topics: ['Trigonometric Ratios', 'Identities', 'Applications'],
      prompts: {
        'Trigonometric Ratios': ['Definition', 'Explanation', 'Numeric Example'],
        'Identities': ['Definition', 'Explanation', 'Numeric Example'],
        'Applications': ['Definition', 'Explanation', 'Numeric Example']
      }
    },
    'Statistics & Probability': {
      topics: ['Mean, Median, Mode', 'Probability Basics', 'Distributions'],
      prompts: {
        'Mean, Median, Mode': ['Definition', 'Explanation', 'Numeric Example'],
        'Probability Basics': ['Definition', 'Explanation', 'Numeric Example'],
        'Distributions': ['Definition', 'Explanation', 'Numeric Example']
      }
    }
  };

  const chapterData = currentChapterTopics[chapter] || currentChapterTopics['Sets & Relations'];
  
  // Debug: Log the chapter name and available topics
  console.log('🔍 Current chapter:', chapter);
  console.log('🔍 Available topics:', chapterData.topics);

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

  // PROFESSIONAL MATHEMATICAL RENDERING - ENHANCED FOR MATH EDUCATION
  const renderMessageContent = (content: string) => {
    let processedContent = content
      // Convert markdown headers to professional HTML with better spacing
      .replace(/^### (.*$)/gim, '<h3 style="font-weight: 600; margin: 12px 0 8px 0; color: #1f2937; font-size: 16px; line-height: 1.4;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-weight: 600; margin: 16px 0 10px 0; color: #1f2937; font-size: 18px; line-height: 1.4;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="font-weight: 600; margin: 20px 0 12px 0; color: #1f2937; font-size: 20px; line-height: 1.4;">$1</h1>')
      // Convert bold text with better styling
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #111827;">$1</strong>')
      // Convert italic text
      .replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #374151;">$1</em>')
      // Convert line breaks with proper spacing
      .replace(/\n/g, '<br>')
      // Convert bullet points to professional list items
      .replace(/^- (.*$)/gim, '<li style="margin: 6px 0; padding-left: 4px; line-height: 1.5;">$1</li>');
    
    // Wrap list items in professional <ul> styling
    if (processedContent.includes('<li>') && !processedContent.includes('<ul>')) {
      processedContent = `<ul style="margin: 8px 0; padding-left: 20px; list-style-type: disc;">${processedContent}</ul>`;
    }
    
    return processedContent;
  };

  // COMPREHENSIVE CSS RESET - REMOVE ALL POSSIBLE VERTICAL LINES IN MATH CONTENT
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Remove table borders that cause vertical lines in matrices/determinants */
      .message-content table,
      .message-content th,
      .message-content td {
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
      }
      
      /* Remove SVG vertical lines and bars inside KaTeX/MathJax blocks */
      .message-content svg,
      .message-content svg line,
      .message-content svg rect,
      .message-content svg path {
        stroke: none !important;
        border: none !important;
        box-shadow: none !important;
        fill: none !important;
      }
      
      /* CRITICAL: Remove KaTeX SVG paths that draw matrix brackets/determinant bars */
      .message-content .katex-svg path {
        display: none !important;
        stroke: none !important;
        fill: none !important;
      }
      
      /* Remove ALL SVG paths in math content (comprehensive approach) */
      .message-content svg path,
      .message-content svg line,
      .message-content svg rect {
        display: none !important;
        stroke: none !important;
        fill: none !important;
      }
      
      /* MathML/KaTeX vertical bars or decorations */
      .message-content .mopen, 
      .message-content .mclose, 
      .message-content .mjx-vl, 
      .message-content .mjx-bar, 
      .message-content mo[stretchy="true"] {
        color: transparent !important;
        display: none !important;
        border: none !important;
        background: none !important;
      }
      
      /* Remove horizontal rules that might cause lines */
      .message-content hr {
        border: none !important;
        height: 1px !important;
        background: #eee !important;
      }
      
      /* Keep list formatting clean but readable */
      .message-content ul, 
      .message-content ol {
        margin-left: 1.2em !important;
        padding-left: 0 !important;
      }
      
      .message-content li {
        margin: 4px 0 !important;
        padding: 0 !important;
      }
      
      /* Professional math rendering spacing and styling */
      .message-content .katex,
      .message-content .math-rendered,
      .message-content .MathJax {
        margin: 12px 0 !important;
        font-size: 16px !important;
        line-height: 1.6 !important;
      }
      
      /* Enhanced mathematical expressions */
      .message-content .katex-display {
        margin: 16px 0 !important;
        text-align: center !important;
        font-size: 18px !important;
      }
      
      /* Professional inline math styling */
      .message-content .katex-inline {
        font-size: 16px !important;
        margin: 0 2px !important;
      }
      
      /* Better spacing for mathematical content */
      .message-content p {
        margin: 8px 0 !important;
        line-height: 1.6 !important;
      }
      
      /* Professional list styling */
      .message-content ul {
        margin: 12px 0 !important;
        padding-left: 24px !important;
        list-style-type: disc !important;
      }
      
      .message-content li {
        margin: 6px 0 !important;
        line-height: 1.5 !important;
      }
      
      /* Enhanced mathematical typography for better readability */
      .message-content {
        font-variant-numeric: tabular-nums;
        font-feature-settings: "kern" 1, "liga" 1;
      }
      
      /* Professional mathematical expressions styling */
      .message-content sup,
      .message-content sub {
        font-size: 0.75em;
        line-height: 0;
        position: relative;
        vertical-align: baseline;
      }
      
      .message-content sup {
        top: -0.5em;
      }
      
      .message-content sub {
        bottom: -0.25em;
      }
      
      /* Additional KaTeX/MathJax specific line removals */
      .message-content .katex .mord,
      .message-content .katex .mbin,
      .message-content .katex .mrel,
      .message-content .katex .mopen,
      .message-content .katex .mclose {
        border: none !important;
        background: none !important;
      }
      
      /* Remove any remaining vertical lines from math containers */
      .message-content .MathJax,
      .message-content .MathJax_Display,
      .message-content .mjx-container {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // MathJax rendering effect for LaTeX
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
    <div className="fixed right-0 top-16 w-[450px] h-[calc(100vh-4rem)] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col chatbot-container" style={{
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      backdropFilter: 'blur(10px)',
      background: 'rgba(255, 255, 255, 0.95)'
    }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5 flex items-center justify-between" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
      }}>
        <div>
          <h3 className="font-semibold text-xl mb-1" style={{ fontWeight: '600', letterSpacing: '0.02em' }}>🧮 AI Study Buddy</h3>
          <p className="text-sm opacity-90" style={{ fontSize: '13px', fontWeight: '400' }}>{subject} • {chapter} • {level}</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium" style={{ 
            background: 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
          }}>LIVE</span>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
            style={{ borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>
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
                  className={`px-5 py-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'text-white'
                      : 'text-gray-800'
                  }`}
                  style={{
                    background: message.role === 'user' 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    boxShadow: message.role === 'user'
                      ? '0 8px 25px rgba(102, 126, 234, 0.3)'
                      : '0 4px 15px rgba(0, 0, 0, 0.08)',
                    border: message.role === 'assistant' ? '1px solid rgba(0, 0, 0, 0.05)' : 'none'
                  }}
                >
                  <div
                    className="message-content"
                    dangerouslySetInnerHTML={{ __html: renderMessageContent(message.content) }}
                    style={{ 
                      fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      lineHeight: '1.6',
                      fontSize: '15px',
                      color: 'inherit',
                      fontWeight: '400',
                      letterSpacing: '0.01em',
                      wordSpacing: '0.05em'
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
      <div className="p-5 border-t border-gray-200" style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <p className="text-sm font-semibold text-gray-800 mb-4" style={{ 
          fontSize: '14px', 
          fontWeight: '600',
          letterSpacing: '0.02em'
        }}>Quick Topics:</p>
        
        {/* Main Topic Boxes - Horizontal Layout */}
        <div className="flex gap-2 mb-3">
          {chapterData.topics.map((topic) => (
            <button
              key={topic}
              onClick={() => handleMainTopicClick(topic)}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                expandedTopic === topic 
                  ? 'text-white shadow-lg'
                  : 'text-gray-700 hover:shadow-md border'
              }`}
              style={{
                background: expandedTopic === topic 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderColor: expandedTopic === topic ? 'transparent' : 'rgba(0, 0, 0, 0.1)',
                boxShadow: expandedTopic === topic 
                  ? '0 4px 15px rgba(102, 126, 234, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.05)',
                fontWeight: '500',
                letterSpacing: '0.01em'
              }}
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
        <div className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask about ${chapter}...`}
            className="flex-1 px-4 py-3 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              fontSize: '15px',
              fontWeight: '400',
              letterSpacing: '0.01em'
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-5 py-3 text-white rounded-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              minWidth: '48px',
              minHeight: '48px'
            }}
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
      mode: 'cors',
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
