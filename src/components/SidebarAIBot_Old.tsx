import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
// @ts-ignore
import DOMPurify from 'dompurify';
// @ts-ignore
import { marked } from 'marked';

// Configure marked to prevent HTML escaping
marked.setOptions({
  gfm: true, // Use GitHub Flavored Markdown
  breaks: true, // Enable GFM line breaks
  sanitize: false, // Disable marked's own sanitization/escaping
  smartypants: false, // Disable smartypants for better control
  xhtml: false // Disable XHTML compliance
});
import katex from 'katex';
import 'katex/dist/katex.min.css';
// @ts-ignore
import hljs from 'highlight.js';

// Production n8n webhook URL
const N8N_WEBHOOK_URL = "https://mailidpwd.app.n8n.cloud/webhook/e4187911-12cb-4d99-b426-bd78e8ede93e";

async function askN8n(message: string, context: { subject: string; chapter: string; level: string }) {
  try {
    // Create focused, educational prompt for n8n
    const contextPrompt = `You are teaching ${context.chapter} to a ${context.level} level student in ${context.subject}.

STUDENT QUESTION: ${message}

INSTRUCTIONS:
- I am a ${context.level} level student studying ${context.chapter}
- Use **bold** for key terms and concepts
- Use simple, clear mathematical expressions:
  * For simple math: use plain text (e.g., x = 3, discriminant = b² - 4ac)
  * For complex formulas: use basic LaTeX with $$...$$ (e.g., $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$)
  * Keep formulas simple and avoid complex LaTeX syntax
  * Use Δ for discriminant, √ for square roots, ± for plus-minus in plain text
  * Only use LaTeX for essential formulas that need special formatting

${message.toLowerCase().includes('solve') || message.toLowerCase().includes('calculate') || message.toLowerCase().includes('find') ? `
PROBLEM SOLVING REQUEST: The student wants a step-by-step solution. Provide clear, numbered steps showing the complete solution process. Include all mathematical operations and explain each step briefly.` : 
context.level === 'beginner' ? `
BEGINNER LEVEL: Answer in EXACTLY 2-3 sentences only. Use simple language. NO examples, NO practice problems, NO exam tips. Just the basic definition and one simple explanation.` : 
context.level === 'intermediate' ? `
INTERMEDIATE LEVEL: Answer in EXACTLY 4-5 sentences. Include one simple example. NO practice problems, NO exam tips, NO multiple methods. Focus on understanding the concept with basic application.` : 
`
ADVANCED LEVEL: Answer in EXACTLY 6-8 sentences. Include theoretical foundation and one detailed example. NO practice problems, NO exam tips. Focus on deep understanding and mathematical rigor.`}

${message.toLowerCase().includes('solve') || message.toLowerCase().includes('calculate') || message.toLowerCase().includes('find') ? 
'Provide a complete step-by-step solution with numbered steps.' :
context.level === 'advanced' ? 'Make this an advanced-level comprehensive explanation with deep theoretical insights.' : 
context.level === 'intermediate' ? 'Make this an intermediate-level detailed explanation with practical examples.' : 
'Make this a beginner-level simple and clear explanation.'}

${message.toLowerCase().includes('solve') || message.toLowerCase().includes('calculate') || message.toLowerCase().includes('find') ? 
'IMPORTANT: Show complete solution steps. Do NOT skip any mathematical operations.' :
context.level === 'beginner' ? 'CRITICAL: STOP after 2-3 sentences. Do NOT add examples, practice problems, or exam tips.' : 
context.level === 'intermediate' ? 'CRITICAL: STOP after 4-5 sentences. Do NOT add practice problems or exam tips.' : 
'CRITICAL: STOP after 6-8 sentences. Do NOT add practice problems or exam tips.'}`;

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

    if (!response.ok) {
      console.error('n8n webhook failed:', response.status, response.statusText);
      return undefined;
    }

    const responseText = await response.text();
    
    // Handle different response formats from n8n
    let finalResponse;
    if (responseText.trim() === '') {
      finalResponse = "I'm having trouble processing your question right now. Please try again in a moment! 😅";
    } else {
      try {
        const responseData = JSON.parse(responseText);
        // Handle n8n response format: [{"output": "..."}]
        if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
          finalResponse = responseData[0].output;
        }
        // Handle direct reply format
        else if (responseData && responseData.reply) {
          finalResponse = responseData.reply;
        }
        // Handle other possible formats
        else {
          finalResponse = responseData.reply || responseData.message || responseData.output || responseText;
        }
      } catch (e) {
        // If not JSON, return as plain text
        finalResponse = responseText;
      }
    }
    
    // Clean up the response text and fix mathematical errors
    finalResponse = finalResponse
      .replace(/\|/g, '') // Remove pipe characters that cause truncation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\s*:\s*$/, '') // Remove trailing colons
      // Fix common mathematical errors and convert to LaTeX
      .replace(/<strong>/g, '').replace(/<\/strong>/g, '') // Remove HTML tags
      .replace(/x\s*-\s*4x\s*\+\s*3/g, '$$x^2 - 4x + 3$$') // Fix quadratic equation
      .replace(/x\s*-\s*4x/g, '$$x^2 - 4x$$') // Fix missing superscript
      .replace(/x\s*\+/g, '$$x^2 +$$') // Fix missing superscript
      .replace(/x\s*-/g, '$$x^2 -$$') // Fix missing superscript
      .replace(/\(\s*-4\s*\)\^2\s*\(1\)/g, '$$(-4)^2$$') // Fix erroneous superscript
      .replace(/4\s*\(\s*1\s*\)\s*\(\s*3\s*\)\^2/g, '$$4(1)(3)$$') // Fix erroneous superscript
      .replace(/122/g, '12') // Fix OCR errors
      .replace(/ture/g, 'nature') // Fix typo
      .replace(/qua-\s*dratic/g, 'quadratic') // Fix hyphenation
      // Remove problematic LaTeX conversions that cause parse errors
      // Keep only simple, safe replacements
      .trim();
    
    return finalResponse;
  } catch (error) {
    console.error('Error calling n8n webhook:', error);
    return undefined;
  }
}

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

export function SidebarAIBot({ subject, chapter, level, isOpen, onClose }: SidebarAIBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Chapter-specific topics and their prompts
  const chapterTopics = {
    'Sets, Relations & Functions': {
      topics: ['Sets', 'Functions', 'Relations'],
      prompts: {
        'Sets': {
          'Definition': `What is the definition of sets in mathematics? Explain it in ${level} level terms.`,
          'Example': `Give me a practical example of sets that I can understand at ${level} level.`,
          'Numeric Example': `Show me a numeric example of sets with calculations at ${level} level.`
        },
        'Functions': {
          'Definition': `What is the definition of functions in mathematics? Explain it in ${level} level terms.`,
          'Example': `Give me a practical example of functions that I can understand at ${level} level.`,
          'Numeric Example': `Show me a numeric example of functions with calculations at ${level} level.`
        },
        'Relations': {
          'Definition': `What is the definition of relations in mathematics? Explain it in ${level} level terms.`,
          'Example': `Give me a practical example of relations that I can understand at ${level} level.`,
          'Numeric Example': `Show me a numeric example of relations with calculations at ${level} level.`
        }
      }
    },
    'Complex Numbers & Quadratic Equations': {
      topics: ['Complex Numbers', 'Quadratic Equations', 'Roots & Discriminant'],
      prompts: {
        'Complex Numbers': {
          'Definition': `What are complex numbers? Explain the definition in ${level} level terms.`,
          'Example': `Give me a practical example of complex numbers at ${level} level.`,
          'Numeric Example': `Show me a numeric example of complex number operations at ${level} level.`
        },
        'Quadratic Equations': {
          'Definition': `What are quadratic equations? Explain the definition in ${level} level terms.`,
          'Example': `Give me a practical example of quadratic equations at ${level} level.`,
          'Numeric Example': `Show me a numeric example of solving quadratic equations at ${level} level.`
        },
        'Roots & Discriminant': {
          'Definition': `What is the discriminant and roots of quadratic equations? Explain in ${level} level terms.`,
          'Example': `Give me a practical example of finding roots using discriminant at ${level} level.`,
          'Numeric Example': `Show me a numeric example of calculating discriminant and roots at ${level} level.`
        }
      }
    },
    'Sequences & Series': {
      topics: ['Arithmetic Progression', 'Geometric Progression', 'Sum Formulas'],
      prompts: {
        'Arithmetic Progression': {
          'Definition': `What is arithmetic progression (AP)? Explain in ${level} level terms.`,
          'Example': `Give me a practical example of arithmetic progression at ${level} level.`,
          'Numeric Example': `Show me a numeric example of AP with calculations at ${level} level.`
        },
        'Geometric Progression': {
          'Definition': `What is geometric progression (GP)? Explain in ${level} level terms.`,
          'Example': `Give me a practical example of geometric progression at ${level} level.`,
          'Numeric Example': `Show me a numeric example of GP with calculations at ${level} level.`
        },
        'Sum Formulas': {
          'Definition': `What are the sum formulas for sequences? Explain in ${level} level terms.`,
          'Example': `Give me a practical example of using sum formulas at ${level} level.`,
          'Numeric Example': `Show me a numeric example of calculating sums at ${level} level.`
        }
      }
    }
  };

  const currentChapterTopics = chapterTopics[chapter as keyof typeof chapterTopics] || {
    topics: ['Basic Concepts', 'Formulas', 'Examples'],
    prompts: {
      'Basic Concepts': {
        'Definition': `What are the basic concepts in ${chapter}? Explain in ${level} level terms.`,
        'Example': `Give me a practical example from ${chapter} at ${level} level.`,
        'Numeric Example': `Show me a numeric example from ${chapter} at ${level} level.`
      },
      'Formulas': {
        'Definition': `What are the key formulas in ${chapter}? Explain in ${level} level terms.`,
        'Example': `Give me a practical example using formulas from ${chapter} at ${level} level.`,
        'Numeric Example': `Show me a numeric example with formula calculations at ${level} level.`
      },
      'Examples': {
        'Definition': `What are the important examples in ${chapter}? Explain in ${level} level terms.`,
        'Example': `Give me a practical example from ${chapter} at ${level} level.`,
        'Numeric Example': `Show me a numeric example from ${chapter} at ${level} level.`
      }
    }
  };

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
        beginner: `Hi! I'm your AI tutor for ${chapter}. I'll give you simple, easy explanations perfect for beginners! What would you like to learn? 🎓`,
        intermediate: `Hello! I'm here to help with ${chapter} at intermediate level. I'll provide detailed explanations with step-by-step breakdowns and practical examples! What concept interests you? 📚`,
        advanced: `Ready for advanced ${chapter}? I'll provide comprehensive explanations with deep theory, proofs, and advanced applications. What advanced topic shall we explore? ⚡`
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

  // Render mathematical formulas and code blocks
  // Function to break long mathematical expressions
  const breakLongExpression = (formula: string, maxLength: number = 50) => {
    if (formula.length <= maxLength) return formula;
    
    // Try to break at operators
    const breakPoints = ['+', '-', '=', '\\pm', '\\cdot', '\\times'];
    
    for (const breakPoint of breakPoints) {
      const regex = new RegExp(`(.{1,${maxLength}})\\s*(${breakPoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
      if (regex.test(formula)) {
        return formula.replace(regex, `$1 \\\\ $2`);
      }
    }
    
    // If no good break point, force break
    return formula.replace(new RegExp(`(.{${maxLength}})`, 'g'), '$1 \\\\ ');
  };

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
      // Fix subscript notation like |A|_m to |A|_m
      .replace(/\|([A-Za-z]+)\|_([a-z0-9]+)/g, '|$1|_{$2}')
      .replace(/\|([A-Za-z]+)\|\s*_\s*([a-z0-9]+)/g, '|$1|_{$2}')
      // Fix superscript notation like 2^3 to 2^3
      .replace(/([0-9]+)\s*\^\s*([0-9]+)/g, '$1^{$2}')
      // Convert simple matrix patterns to LaTeX and render them
      .replace(/\[([0-9\-\s,]+)\]/g, (match, content) => {
        const cleaned = content.replace(/,/g, ' ').trim();
        const nums = cleaned.split(/\s+/).filter(n => n.trim() !== '');
        
        if (nums.length === 1) {
          // Single number - just display as text, not a matrix
          return `<span class="math-inline" style="margin: 0 4px; padding: 3px 6px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; display: inline-block;">${nums[0]}</span>`;
        } else if (nums.length === 4) {
          // 2x2 matrix - convert to LaTeX
          const latexMatrix = `\\begin{bmatrix} ${nums[0]} & ${nums[1]} \\\\ ${nums[2]} & ${nums[3]} \\end{bmatrix}`;
          try {
            return `<div class="matrix-display" style="margin: 12px 0; padding: 12px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; text-align: center;">${katex.renderToString(latexMatrix, { displayMode: true, throwOnError: false })}</div>`;
          } catch (e) {
            console.warn('Matrix rendering failed:', e);
            return match;
          }
        } else if (nums.length === 6) {
          // 2x3 matrix - convert to LaTeX
          const latexMatrix = `\\begin{bmatrix} ${nums[0]} & ${nums[1]} & ${nums[2]} \\\\ ${nums[3]} & ${nums[4]} & ${nums[5]} \\end{bmatrix}`;
          try {
            return `<div class="matrix-display" style="margin: 12px 0; padding: 12px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; text-align: center;">${katex.renderToString(latexMatrix, { displayMode: true, throwOnError: false })}</div>`;
          } catch (e) {
            console.warn('Matrix rendering failed:', e);
            return match;
          }
        } else if (nums.length === 9) {
          // 3x3 matrix - convert to LaTeX
          const latexMatrix = `\\begin{bmatrix} ${nums[0]} & ${nums[1]} & ${nums[2]} \\\\ ${nums[3]} & ${nums[4]} & ${nums[5]} \\\\ ${nums[6]} & ${nums[7]} & ${nums[8]} \\end{bmatrix}`;
          try {
            return `<div class="matrix-display" style="margin: 12px 0; padding: 12px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; text-align: center;">${katex.renderToString(latexMatrix, { displayMode: true, throwOnError: false })}</div>`;
          } catch (e) {
            console.warn('Matrix rendering failed:', e);
            return match;
          }
        } else if (nums.length === 3) {
          // 3x1 column matrix - convert to LaTeX
          const latexMatrix = `\\begin{bmatrix} ${nums[0]} \\\\ ${nums[1]} \\\\ ${nums[2]} \\end{bmatrix}`;
          try {
            return `<div class="matrix-display" style="margin: 12px 0; padding: 12px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; text-align: center;">${katex.renderToString(latexMatrix, { displayMode: true, throwOnError: false })}</div>`;
          } catch (e) {
            console.warn('Matrix rendering failed:', e);
            return match;
          }
        }
        return match;
      })
      .replace(/\(([0-9\-\s,]+)\)/g, (match, content) => {
        const cleaned = content.replace(/,/g, ' ').trim();
        const nums = cleaned.split(/\s+/).filter(n => n.trim() !== '');
        
        if (nums.length === 4) {
          // 2x2 matrix - convert to LaTeX
          const latexMatrix = `\\begin{bmatrix} ${nums[0]} & ${nums[1]} \\\\ ${nums[2]} & ${nums[3]} \\end{bmatrix}`;
          try {
            return `<div class="matrix-display">${katex.renderToString(latexMatrix, { displayMode: true, throwOnError: false })}</div>`;
          } catch (e) {
            console.warn('Matrix rendering failed:', e);
            return match;
          }
        } else if (nums.length === 6) {
          // 2x3 matrix - convert to LaTeX
          const latexMatrix = `\\begin{bmatrix} ${nums[0]} & ${nums[1]} & ${nums[2]} \\\\ ${nums[3]} & ${nums[4]} & ${nums[5]} \\end{bmatrix}`;
          try {
            return `<div class="matrix-display">${katex.renderToString(latexMatrix, { displayMode: true, throwOnError: false })}</div>`;
          } catch (e) {
            console.warn('Matrix rendering failed:', e);
            return match;
          }
        } else if (nums.length === 9) {
          // 3x3 matrix - convert to LaTeX
          const latexMatrix = `\\begin{bmatrix} ${nums[0]} & ${nums[1]} & ${nums[2]} \\\\ ${nums[3]} & ${nums[4]} & ${nums[5]} \\\\ ${nums[6]} & ${nums[7]} & ${nums[8]} \\end{bmatrix}`;
          try {
            return `<div class="matrix-display">${katex.renderToString(latexMatrix, { displayMode: true, throwOnError: false })}</div>`;
          } catch (e) {
            console.warn('Matrix rendering failed:', e);
            return match;
          }
        } else if (nums.length === 3) {
          // 3x1 column matrix
          const latexMatrix = `\\begin{bmatrix} ${nums[0]} \\\\ ${nums[1]} \\\\ ${nums[2]} \\end{bmatrix}`;
          try {
            return `<div class="matrix-display">${katex.renderToString(latexMatrix, { displayMode: true, throwOnError: false })}</div>`;
          } catch (e) {
            console.warn('Matrix rendering failed:', e);
            return match;
          }
        }
        return match;
      })
      // Also handle bracket format [a b c d] - convert to LaTeX
      .replace(/\[([0-9\-\s,]+)\]/g, (match, content) => {
        const cleaned = content.replace(/,/g, ' ').trim();
        const nums = cleaned.split(/\s+/).filter(n => n.trim() !== '');
        
        if (nums.length === 4) {
          const latexMatrix = `\\begin{bmatrix} ${nums[0]} & ${nums[1]} \\\\ ${nums[2]} & ${nums[3]} \\end{bmatrix}`;
          try {
            return `<div class="matrix-display">${katex.renderToString(latexMatrix, { displayMode: true, throwOnError: false })}</div>`;
          } catch (e) {
            console.warn('Matrix rendering failed:', e);
            return match;
          }
        }
        return match;
      });

    // Code block highlighting
    const codeBlocks = element.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
      
      // Add copy button for code blocks
      const copyBtn = document.createElement('button');
      copyBtn.innerHTML = '📋';
      copyBtn.className = 'absolute top-2 right-2 p-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors';
      copyBtn.style.position = 'relative';
      
      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const codeText = block.textContent || '';
        try {
          await navigator.clipboard.writeText(codeText);
          copyBtn.innerHTML = '✅';
          setTimeout(() => {
            copyBtn.innerHTML = '📋';
          }, 2000);
        } catch (err) {
          console.error('Failed to copy text: ', err);
        }
      });

      // Make the code block container relative for positioning
      const pre = block.parentElement;
      if (pre) {
        pre.style.position = 'relative';
        pre.appendChild(copyBtn);
      }
    });
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

  // Check if question is relevant to mathematics
  const isMathRelevant = (question: string): boolean => {
    const mathKeywords = [
      // Basic math terms
      'number', 'numbers', 'calculate', 'solve', 'equation', 'formula', 'theorem', 'proof',
      'algebra', 'geometry', 'calculus', 'trigonometry', 'statistics', 'probability',
      'function', 'functions', 'matrix', 'matrices', 'vector', 'vectors', 'derivative', 'integral',
      'quadratic', 'polynomial', 'complex', 'real', 'imaginary', 'determinant', 'eigenvalue',
      'limit', 'continuity', 'differentiation', 'integration', 'series', 'sequence',
      'permutation', 'combination', 'binomial', 'logarithm', 'exponential',
      // Math symbols and operations
      'plus', 'minus', 'multiply', 'divide', 'square', 'root', 'power', 'exponent',
      'angle', 'triangle', 'circle', 'parabola', 'hyperbola', 'ellipse',
      // JEE specific topics
      'jee', 'mains', 'advanced', 'iit', 'entrance', 'exam', 'preparation',
      // Common math symbols
      'x', 'y', 'z', 'a', 'b', 'c', 'sin', 'cos', 'tan', 'log', 'ln', 'e', 'pi'
    ];
    
    const questionLower = question.toLowerCase();
    return mathKeywords.some(keyword => questionLower.includes(keyword));
  };

  // Handle topic button clicks - auto-send prompts
  const handleTopicPrompt = async (topic: string, promptType: string) => {
    if (isLoading) return;

    const prompt = currentChapterTopics.prompts[topic as keyof typeof currentChapterTopics.prompts][promptType as keyof typeof currentChapterTopics.prompts[keyof typeof currentChapterTopics.prompts]];
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setSelectedTopic(null); // Close sub-menu

    try {
      // Check if question is math-relevant (should always be true for our prompts)
      const aiResponse = await askN8n(prompt, { subject, chapter, level });
      
      const fallbackResponses = {
        beginner: `Hi! I'm your AI tutor for ${chapter}. I'll give you simple, easy explanations perfect for beginners! 🎓`,
        intermediate: `Hello! I'm here to help with ${chapter} at intermediate level. I'll provide detailed explanations with step-by-step breakdowns and practical examples! 📚`,
        advanced: `Ready for advanced ${chapter}? I'll provide comprehensive explanations with deep theory, proofs, and advanced applications. Let's master this! ⚡`
      };


      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse || fallbackResponses[level as keyof typeof fallbackResponses],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
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
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Check if question is math-relevant
      if (!isMathRelevant(input)) {
        const irrelevantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I'm sorry, but this question is not related to mathematics. I can only help with mathematical concepts, problems, and topics related to ${chapter}. Please ask me about math topics like equations, functions, geometry, calculus, or any other mathematical concepts! 📚`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, irrelevantMessage]);
        setIsLoading(false);
        return;
      }

      const aiResponse = await askN8n(input, { subject, chapter, level });
      
      const fallbackResponses = {
        beginner: `Hi! I'm your AI tutor for ${chapter}. I'll give you simple, easy explanations perfect for beginners! 🎓`,
        
        intermediate: `Hello! I'm here to help with ${chapter} at intermediate level. I'll provide detailed explanations with step-by-step breakdowns and practical examples! 📚`,
        
        advanced: `Ready for advanced ${chapter}? I'll provide comprehensive explanations with deep theory, proofs, and advanced applications. Let's master this! ⚡`
      };

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse || fallbackResponses[level as keyof typeof fallbackResponses] || fallbackResponses.beginner,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
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
    <div className="fixed right-0 top-16 h-[calc(100vh-6rem)] w-[450px] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-lg overflow-hidden chatbot-container" style={{ marginTop: '32px', maxWidth: '450px', width: '450px', overflow: 'hidden', boxSizing: 'border-box' }}>
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Monitor className="h-5 w-5" />
            <CardTitle className="text-lg font-semibold">AI Study Assistant</CardTitle>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-blue-100 mt-2">
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
                      : "bg-gray-100 text-gray-900 message assistant max-w-[90%]"
                  )}
                  style={{ 
                    minHeight: 'auto', 
                    maxHeight: 'none', 
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    whiteSpace: 'normal',
                    marginTop: '8px',
                    marginBottom: '8px',
                    width: 'auto',
                    maxWidth: message.role === 'user' ? '85%' : '90%'
                  }}
                >
                   <div
                     className="message-content prose prose-sm"
                     style={{
                       lineHeight: '1.6',
                       wordBreak: 'break-word',
                       overflowWrap: 'break-word',
                       whiteSpace: 'normal',
                       hyphens: 'auto',
                       maxWidth: '100%',
                       width: '100%',
                       margin: '0',
                       padding: '6px 0',
                       overflow: 'hidden',
                       minHeight: 'auto',
                       textAlign: 'left',
                       direction: 'ltr',
                       fontSize: '14px',
                       fontFamily: 'inherit',
                       boxSizing: 'border-box'
                     }}
                     dangerouslySetInnerHTML={{
                       __html: renderMessageContent(message.content)
                     }}
                   />
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Topic Buttons */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-2 font-medium">Quick Topics:</p>
          <div className="flex flex-wrap gap-2">
            {currentChapterTopics.topics.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                className={`px-3 py-1 text-xs rounded-full border transition-all duration-200 ${
                  selectedTopic === topic
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-menu for selected topic */}
        {selectedTopic && (
          <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-2 font-medium">Choose question type for {selectedTopic}:</p>
            <div className="flex flex-wrap gap-2">
              {['Definition', 'Example', 'Numeric Example'].map((promptType) => (
                <button
                  key={promptType}
                  onClick={() => handleTopicPrompt(selectedTopic, promptType)}
                  disabled={isLoading}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {promptType}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about this chapter..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
