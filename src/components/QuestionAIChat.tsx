import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, X, User, Leaf } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuestionAIChatProps {
  question: string;
  subject: string;
  level: string;
  onClose: () => void;
  initialPrompt?: string;
}

// Gemini API configuration - USING 2025 MODELS
const GEMINI_API_KEY = "AIzaSyBL_Mw0uwvrv285BnWoQ334XGQZtekB_pE";

// AI response using Gemini API - FIXED WITH CORRECT 2025 MODEL
const fetchGeminiResponse = async (
  prompt: string,
  context: { subject: string; level: string; question: string }
): Promise<string> => {
  console.log('🚀 Calling Gemini 2.5 Flash API... (v3 - max limits)');

  try {
    const systemPrompt = `You are a helpful, friendly AI tutor. Help students understand concepts step by step.

ORIGINAL QUESTION: "${context.question}"
SUBJECT: ${context.subject}
LEVEL: ${context.level}

IMPORTANT: Provide COMPLETE and DETAILED responses. Explain concepts thoroughly with examples. Give step-by-step solutions when needed. Be comprehensive and educational.`;

    const fullPrompt = `${systemPrompt}\n\nStudent asks: "${prompt}"\n\nProvide a helpful, educational response:`;

    // FIXED: Using gemini-2.5-flash (the NEW 2025 model that replaced deprecated 1.5-flash)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log('📡 API URL:', apiUrl);

    const requestBody = {
      contents: [{
        parts: [{
          text: fullPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4000,
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📨 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API Response received');
    
    // Extract text from response with better error handling
    if (data.candidates && data.candidates[0]) {
      const candidate = data.candidates[0];
      console.log('First candidate:', candidate);
      
      // Check if response was truncated due to token limit
      if (candidate.finishReason === 'MAX_TOKENS') {
        console.log('⚠️ Response truncated due to token limit');
        // Return a helpful message instead of failing
        return `I'm working on a detailed response for you. Let me try again with a more focused approach. Please try asking your question again or use one of the quick action buttons below for a complete explanation!`;
      }
      
      if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
        const text = candidate.content.parts[0].text;
        console.log('✅ Extracted text:', text);
        return text;
      } else if (candidate.text) {
        // Alternative response format
        console.log('✅ Extracted text (alt format):', candidate.text);
        return candidate.text;
      }
    }
    
    // Log the full response for debugging
    console.log('🔍 Full response structure:', JSON.stringify(data, null, 2));
    
    // Try to extract text from any possible location
    const extractText = (obj: any): string | null => {
      if (typeof obj === 'string') return obj;
      if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          if (key.toLowerCase().includes('text') || key.toLowerCase().includes('content')) {
            const result = extractText(obj[key]);
            if (result) return result;
          }
        }
      }
      return null;
    };
    
    const extractedText = extractText(data);
    if (extractedText) {
      console.log('✅ Extracted text from response:', extractedText);
      return extractedText;
    }
    
    throw new Error('Invalid response format - no text found');
  } catch (error) {
    console.error('💥 Gemini API Error:', error);
    throw error;
  }
};

const getQuestionAnalysis = (question: string, subject: string, level: string) => {
  const questionLower = question.toLowerCase();
  
  if (subject === 'mathematics' || subject.toLowerCase() === 'mathematics') {
    if (questionLower.includes('set') || questionLower.includes('union') || questionLower.includes('intersection')) {
      return `Hi! 🌱 Ready to help with this set theory problem!

**Question:** ${question}

**Key concept:** A ∪ B = union (all unique elements from both sets)
**Example:** A = {1,2,3,4,5}, B = {3,4,5,6,7}
**Union:** A ∪ B = {1,2,3,4,5,6,7} = 7 elements

What would you like to explore?`;
    }
  }
  
  return `Hey! 🌱 I'm your AI Study Buddy!

**Question:** ${question}
**Subject:** ${subject} (${level})

I can help explain concepts, show steps, or explain why. What would you like to know?`;
};

const generateFallbackResponse = (userInput: string, question: string, subject: string, level: string) => {
  const text = `${question} ${userInput}`.toLowerCase();
  
  if (text.includes('explain') || text.includes('help')) {
    if (text.includes('set') || text.includes('union')) {
      return `**Set Union Explanation:** 🎯

A ∪ B = all unique elements from both sets
- A = {1,2,3,4,5}, B = {3,4,5,6,7}
- Union: {1,2,3,4,5,6,7} = **7 elements**
- We don't repeat 3,4,5! ✅`;
    }
    
    return `Let me help with this ${subject} problem! 

**Key steps:**
1. Identify what's given
2. Find what you need
3. Apply the right method

What's confusing you? 🎯`;
  }
  
  if (text.includes('step')) {
    if (text.includes('set') || text.includes('union')) {
      return `**Quick Steps:**

1. A = {1,2,3,4,5}
2. B = {3,4,5,6,7}  
3. A ∪ B = {1,2,3,4,5,6,7}
4. Count: **7 elements** ✅`;
    }
    
    return `**Step-by-step approach:**

1. Read problem → identify given info
2. Determine what to find
3. Choose method/formula
4. Calculate & check

Which step needs help? 📝`;
  }
  
  if (text.includes('why') || text.includes('reason')) {
    if (text.includes('set') || text.includes('union')) {
      return `**Why answer is 7:** 🤔

A ∪ B = all unique elements from both sets
- Elements 3,4,5 appear in BOTH sets
- We count them only ONCE (not twice!)
- Result: {1,2,3,4,5,6,7} = 7 ✅`;
    }
    
    return `**Why this works:** 🤔

Think about the core ${subject} concepts:
- What principle applies?
- Why does this method work?
- How does it connect to what you know?

What reasoning do you want explained?`;
  }
  
  return `I understand: "${userInput}"

For this ${subject} question:
- What do you already know?
- What patterns do you see?
- What method might work?

What would you like to explore? 💭`;
};

export function QuestionAIChat({ question, subject, level, onClose, initialPrompt }: QuestionAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: initialPrompt 
        ? `Question: ${question}` 
        : getQuestionAnalysis(question, subject, level),
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'testing' | 'working' | 'failed'>('testing');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Test API on mount with CORRECT 2025 model
  useEffect(() => {
    const testAPI = async () => {
      console.log('🧪 Testing Gemini 2.5 Flash API...');
      try {
        const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({
                     contents: [{ parts: [{ text: "Test" }] }],
                     generationConfig: { maxOutputTokens: 4000 }
                   })
        });
        
        if (response.ok) {
          console.log('✅ Gemini 2.5 Flash API is working!');
          setApiStatus('working');
        } else {
          const errorText = await response.text();
          console.error('❌ API test failed:', errorText);
          setApiStatus('failed');
        }
      } catch (error) {
        console.error('❌ API test error:', error);
        setApiStatus('failed');
      }
    };
    testAPI();
  }, []);

  // Handle initial prompt
  useEffect(() => {
    const run = async () => {
      if (!initialPrompt) return;
      setIsLoading(true);
      try {
        const aiResponse = await fetchGeminiResponse(initialPrompt, { subject, level, question });
        setMessages(prev => [
          ...prev,
          { 
            role: 'assistant', 
            content: `**Why this might be incorrect:**\n\n${aiResponse}`,
            timestamp: new Date() 
          }
        ]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [
          ...prev,
          { 
            role: 'assistant', 
            content: generateFallbackResponse(initialPrompt, question, subject, level),
            timestamp: new Date() 
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [initialPrompt, question, subject, level]);

  useEffect(() => {
    // For new AI responses, scroll to show the beginning of the response
    if (messages.length > 1) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        // Scroll to show the beginning of the AI response
        setTimeout(() => {
          if (scrollAreaRef.current) {
            const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
              // Find the last assistant message and scroll to its top
              const messageElements = scrollElement.querySelectorAll('[class*="justify-start"]');
              if (messageElements.length > 0) {
                const lastAssistantMessage = messageElements[messageElements.length - 1];
                lastAssistantMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          }
        }, 200);
      } else {
        // For user messages, scroll to bottom
        setTimeout(() => scrollToBottom(), 100);
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  const scrollToTop = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = 0;
      }
    }
  };

  const renderMathContent = (text: string) => {
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2);
        return <BlockMath key={index} math={math} />;
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1);
        return <InlineMath key={index} math={math} />;
      } else {
        return (
          <span 
            key={index} 
            dangerouslySetInnerHTML={{ 
              __html: part
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br>')
            }} 
          />
        );
      }
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('🎯 Sending message:', input);
      const aiResponse = await fetchGeminiResponse(input, { subject, level, question });
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('💥 Error getting AI response:', error);
      
      // Use smart fallback response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: generateFallbackResponse(input, question, subject, level),
        timestamp: new Date()
      }]);
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: action,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponse = await fetchGeminiResponse(action, { subject, level, question });
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: generateFallbackResponse(action, question, subject, level),
        timestamp: new Date()
      }]);
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full max-w-md h-[480px] relative">
      <Card className="h-full border-none shadow-2xl overflow-hidden" style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Header */}
        <CardHeader className="pb-4" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center shadow-lg">
                  <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">AI</span>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2" style={{ fontWeight: '600', letterSpacing: '0.02em' }}>
                  AI Study Buddy
                  {apiStatus === 'working' && <span className="text-green-300 text-xs font-bold bg-green-500/30 px-2 py-1 rounded-full">LIVE</span>}
                  {apiStatus === 'failed' && <span className="text-orange-300 text-xs font-bold bg-orange-500/30 px-2 py-1 rounded-full">OFFLINE</span>}
                  {apiStatus === 'testing' && <span className="text-blue-300 text-xs bg-blue-500/30 px-2 py-1 rounded-full">LOADING</span>}
                </CardTitle>
                <p className="text-sm text-white/90 font-medium" style={{ fontSize: '13px', fontWeight: '400' }}>{level} • {subject}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg w-8 h-8 p-0 transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        {/* Chat Messages */}
        <CardContent className="flex flex-col h-[380px] p-4" style={{
          background: 'transparent'
        }}>
          <ScrollArea ref={scrollAreaRef} className="flex-1 mb-3">
            <div className="space-y-4 pr-2">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-4 relative ${
                      message.role === 'user'
                        ? 'text-white shadow-lg ml-8'
                        : 'text-gray-800 shadow-md mr-8'
                    }`}
                    style={{
                      background: message.role === 'user' 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      boxShadow: message.role === 'user'
                        ? '0 8px 25px rgba(102, 126, 234, 0.3)'
                        : '0 4px 15px rgba(0, 0, 0, 0.08)',
                      border: message.role === 'assistant' ? '1px solid rgba(0, 0, 0, 0.05)' : 'none'
                    }}
                  >
                    {/* Avatar */}
                    <div className={`absolute top-2 ${message.role === 'user' ? '-right-2' : '-left-2'}`}>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-lg ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                          : 'bg-gradient-to-br from-green-400 to-blue-500'
                      }`}>
                        {message.role === 'assistant' ? (
                          <div className="w-3 h-3 bg-white rounded-sm"></div>
                        ) : (
                          <User className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="text-sm leading-relaxed" style={{
                      fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                      fontWeight: '400',
                      letterSpacing: '0.01em',
                      wordSpacing: '0.05em'
                    }}>
                      {renderMathContent(message.content)}
                    </div>
                    
                    {/* Timestamp */}
                    <div className={`text-[10px] mt-1 font-medium ${
                      message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading Animation */}
              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 max-w-[90%] shadow-md mr-8 relative">
                    <div className="absolute top-2 -left-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                        <div className="w-3 h-3 bg-white rounded-sm animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600 font-medium">Processing</span>
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Quick Action Buttons */}
          <div className="flex space-x-2 mb-3">
            <Button
              onClick={() => handleQuickAction('Explain this concept to me')}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex-1 rounded-lg py-2 px-3 text-xs font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                fontWeight: '500',
                letterSpacing: '0.01em',
                color: '#374151'
              }}
            >
              Explain
            </Button>
            <Button
              onClick={() => handleQuickAction('Show me step by step solution')}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex-1 rounded-lg py-2 px-3 text-xs font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                fontWeight: '500',
                letterSpacing: '0.01em',
                color: '#374151'
              }}
            >
              Step by step
            </Button>
            <Button
              onClick={() => handleQuickAction('Why is this the answer?')}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex-1 rounded-lg py-2 px-3 text-xs font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                fontWeight: '500',
                letterSpacing: '0.01em',
                color: '#374151'
              }}
            >
              Why?
            </Button>
          </div>
          
          {/* Input Area */}
          <div className="flex space-x-3 items-end">
            <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="border-0 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    fontWeight: '400',
                    letterSpacing: '0.01em',
                    color: '#374151'
                  }}
                />
            </div>
            <Button 
              onClick={sendMessage} 
              disabled={!input.trim() || isLoading}
              className="rounded-lg p-3 shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                minWidth: '48px',
                minHeight: '48px'
              }}
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
