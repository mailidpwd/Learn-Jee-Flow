import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Send, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

// Production n8n webhook URL
const N8N_WEBHOOK_URL = "https://mailidpwd.app.n8n.cloud/webhook/e4187911-12cb-4d99-b426-bd78e8ede93e";

async function askN8n(message: string, context: { subject: string; chapter: string; level: string }) {
  try {
    const contextPrompt = `You are teaching ${context.chapter} to a ${context.level} level student in ${context.subject}.

STUDENT QUESTION: ${message}

INSTRUCTIONS:
- I am a ${context.level} level student studying ${context.chapter}
- Answer my question directly and educationally
- Keep it short and understandable (2-3 lines maximum)
- Use simple language and analogies for beginner level
- Use proper mathematical notation with $ for inline math and $$ for block math
- Be direct and helpful, no greetings or small talk
- Focus on explaining the concept clearly and concisely

Provide a ${context.level}-level explanation of my question about ${context.chapter}.`;

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        message: contextPrompt,
        context: {
          subject: context.subject,
          chapter: context.chapter,
          level: context.level,
          originalMessage: message
        }
      })
    });

    if (!response.ok) return undefined;

    const responseText = await response.text();
    
    if (responseText.trim() === '') return undefined;
    
    try {
      const responseData = JSON.parse(responseText);
      if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
        return responseData[0].output;
      }
      return responseData.reply || responseData.message || responseData.output || responseText;
    } catch (e) {
      return responseText;
    }
  } catch {
    return undefined;
  }
}

interface AIBotProps {
  subject: string;
  chapter: string;
  level: string;
}

export function AIBot({ subject, chapter, level }: AIBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: `Hey! 👋 I see you're studying ${chapter} in ${subject} (${level} level). What doubts do you have? I'm here to help! 🤖`
    }
  ]);
  const [input, setInput] = useState('');
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  
  const motivationalQuotes = [
    "Are you trying hard or something? 💪",
    "You got this! Keep pushing! 🚀",
    "Don't give up, you're close! ⭐",
    "Believe in yourself! 🌟", 
    "Every expert was once a beginner! 📚",
    "Progress, not perfection! 🎯",
    "You're doing amazing! ✨",
    "Keep going, success is near! 🏆",
    "Learning never stops! 🧠",
    "You're stronger than you think! 💫"
  ];

  // Cycle through quotes every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput('');

    setMessages(prev => [...prev, { type: 'user', content: text }]);

    const ai = await askN8n(text, { subject, chapter, level });
    if (ai) {
      setMessages(prev => [...prev, { type: 'bot', content: ai }]);
    } else {
      setMessages(prev => [...prev, { type: 'bot', content: `That's a great question about ${chapter}! Could you specify which part is confusing?` }]);
    }
  };

  return (
    <>
      {/* AI Bot Toggle Button - Right Side */}
      <div className="fixed right-6 bottom-6 z-50">
        {/* Top highlight line */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-primary rounded-full animate-pulse" />
        
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full shadow-elegant transition-all duration-300 relative",
            "bg-gradient-primary text-white hover:scale-110 group",
            "ring-2 ring-primary/20 hover:ring-primary/40",
            "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-primary/50 before:to-transparent before:animate-pulse",
            isOpen && "rotate-180"
          )}
        >
          {isOpen ? (
            <X className="h-6 w-6 relative z-10" />
          ) : (
            <div className="relative z-10">
              <Bot className="h-6 w-6" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
          )}
        </Button>
        
        {!isOpen && (
          <div className="absolute bottom-16 right-0 bg-gradient-card text-card-foreground px-4 py-3 rounded-lg shadow-elegant text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 border border-primary/20">
            <div className="text-xs text-muted-foreground mb-1">💡 Motivation</div>
            <div className="font-medium text-primary animate-fade-in">
              {motivationalQuotes[currentQuoteIndex]}
            </div>
          </div>
        )}
      </div>

      {/* AI Bot Chat Interface - Right Side */}
      {isOpen && (
        <div className="fixed right-6 bottom-24 w-80 z-40">
          <Card className="shadow-elegant border-0 bg-gradient-card border border-primary/20">
            <CardHeader className="pb-3 relative">
              {/* Top decorative line */}
              <div className="absolute -top-px left-0 right-0 h-px bg-gradient-primary" />
              <CardTitle className="text-lg flex items-center space-x-2">
                <Bot className="h-5 w-5 text-primary" />
                <span>AI Study Assistant</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {subject} • {chapter} • {level}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages */}
              <div className="max-h-60 overflow-y-auto space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex",
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] p-3 rounded-lg text-sm",
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Input */}
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about this chapter..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  size="sm"
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
