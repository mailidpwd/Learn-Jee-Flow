import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, CheckCircle, XCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { getContent, getChaptersBySubject } from '@/data/sampleData';
import { Level } from '@/store/useAppStore';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { QuestionAIChat } from '@/components/QuestionAIChat';

interface SubtopicContentPanelProps {
  subtopicId: string;
  level: Level;
  onClose: () => void;
}

export function SubtopicContentPanel({ subtopicId, level, onClose }: SubtopicContentPanelProps) {
  const navigate = useNavigate();
  const { subject, chapter } = useParams();
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showExplanations, setShowExplanations] = useState<{ [key: number]: boolean }>({});
  const [showHints, setShowHints] = useState<{ [key: number]: boolean }>({});
  const [showAiHelp, setShowAiHelp] = useState<{ [key: number]: boolean }>({});
  const [activeAIChat, setActiveAIChat] = useState<number | null>(null);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState(100); // Starting points
  const [submitted, setSubmitted] = useState(false);

  const content = getContent(subtopicId, level);

  // Get next chapter for navigation
  const allChapters = getChaptersBySubject(subject || '').sort((a, b) => a.index - b.index);
  const currentChapterIndex = allChapters.findIndex(ch => ch.id === chapter);
  const nextChapter = currentChapterIndex < allChapters.length - 1 ? allChapters[currentChapterIndex + 1] : null;

  const handleNextChapter = () => {
    if (nextChapter && subject && level) {
      navigate(`/${subject}/${level}/${nextChapter.id}`);
    }
  };

  if (!content) {
    return (
      <Card className="shadow-soft border-0 bg-gradient-card animate-in slide-in-from-top-4 duration-300">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Content not available for this level yet.
            <Button variant="outline" onClick={onClose} className="ml-4">
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const levelColors = {
    beginner: 'bg-levels-beginner text-white',
    intermediate: 'bg-levels-intermediate text-white',
    advanced: 'bg-levels-advanced text-white'
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
    // Hide only this question’s result when changing after submit; don’t affect others
    if (submitted) {
      setShowExplanations(prev => ({ ...prev, [questionIndex]: false }));
    }
    if (activeAIChat === questionIndex) setActiveAIChat(null);
  };

  const handleCheckAnswer = (questionIndex: number, pointsCost: number) => {
    setShowExplanations(prev => ({
      ...prev,
      [questionIndex]: true
    }));
    setUserPoints(prev => Math.max(0, prev - pointsCost));
  };

  const handleShowHint = (questionIndex: number) => {
    setShowHints(prev => ({
      ...prev,
      [questionIndex]: true
    }));
  };

  const handleShowAiHelp = (questionIndex: number, prompt?: string) => {
    if (prompt) setAiInitialPrompt(prompt);
    setActiveAIChat(questionIndex);
  };

  const handleCloseAIChat = () => {
    setActiveAIChat(null);
  };

  const renderMathContent = (text: string) => {
    // Split content by math delimiters and render accordingly
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math
        const math = part.slice(2, -2);
        return <BlockMath key={index} math={math} />;
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // Inline math
        const math = part.slice(1, -1);
        return <InlineMath key={index} math={math} />;
      } else {
        // Regular text - render markdown-style formatting with table support
        return (
          <span 
            key={index} 
            dangerouslySetInnerHTML={{ 
              __html: part
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
                .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
                .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
                .replace(/\n\n/g, '</p><p class="mb-4">')
                .replace(/^\- (.*$)/gm, '<li class="ml-4">• $1</li>')
                // Enhanced table rendering with proper styling
                .replace(/\|(.+)\|\n\|[-\s|]+\|\n((?:\|.+\|\n?)*)/g, (match, header, rows) => {
                  const headerCells = header.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell);
                  const rowLines = rows.trim().split('\n').filter((line: string) => line.trim());
                  const columnCount = headerCells.length;
                  
                  // Determine column class based on number of columns
                  let columnClass = '';
                  if (columnCount === 2) columnClass = 'cols-2';
                  else if (columnCount === 3) columnClass = 'cols-3';
                  else if (columnCount === 4) columnClass = 'cols-4';
                  
                  let tableHtml = `<div class="table-container"><table class="theory-table ${columnClass}">`;
                  
                  // Header
                  tableHtml += '<thead>';
                  tableHtml += '<tr>';
                  headerCells.forEach((cell: string) => {
                    tableHtml += `<th>${cell}</th>`;
                  });
                  tableHtml += '</tr></thead>';
                  
                  // Body
                  tableHtml += '<tbody>';
                  rowLines.forEach((row: string) => {
                    const cells = row.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell);
                    tableHtml += '<tr>';
                    cells.forEach((cell: string) => {
                      tableHtml += `<td>${cell}</td>`;
                    });
                    tableHtml += '</tr>';
                  });
                  tableHtml += '</tbody></table></div>';
                  
                  return tableHtml;
                })
            }} 
          />
        );
      }
    });
  };

  const totalQuestions = content?.mcqs?.length || 0;
  const correctCount = totalQuestions === 0 ? 0 : content!.mcqs.reduce((acc, mcq, i) => acc + ((selectedAnswers[i] ?? -1) === mcq.correctIndex ? 1 : 0), 0);
  const percent = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
  const passed = percent >= 80;
  const gatingActive = (level === 'beginner');

  return (
    <div className="animate-in slide-in-from-top-4 duration-300">
      <Card className="shadow-strong border-0 bg-gradient-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <CardTitle className="text-xl text-card-foreground">Practice Questions</CardTitle>
            <Badge className={levelColors[level]}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-primary font-bold">🏆 {userPoints}</span>
              <span className="text-muted-foreground">points</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* MCQs Section */}
          {content.mcqs.length > 0 && (
            <div>
              <div className="mb-6 p-4 bg-gradient-primary/10 rounded-lg border border-primary/20">
                <h3 className="text-lg font-semibold mb-2 text-card-foreground flex items-center">
                  <span className="mr-2">🧠</span>
                  Practice Questions for {level.charAt(0).toUpperCase() + level.slice(1)} Level
                </h3>
                <p className="text-sm text-muted-foreground">
                  {level === 'beginner' && "Simple numerical examples with IQ 70-80 difficulty level. Perfect for building your foundation!"}
                  {level === 'intermediate' && "Standard JEE Main level questions to test your understanding."}
                  {level === 'advanced' && "Advanced JEE level questions for deep conceptual mastery."}
                </p>
                <div className="mt-2 text-xs text-primary font-medium">
                  📚 {content.mcqs.length} Questions • ⏱️ ~{Math.ceil(content.mcqs.length * 1.5)} minutes
                </div>
              </div>
              <div className="space-y-6">
                {content.mcqs.map((mcq, questionIndex) => (
                  <div key={questionIndex} className="flex gap-4">
                    <Card className="flex-1 border border-border">
                      <CardContent className="p-4">
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-card-foreground">
                              Question {questionIndex + 1}:
                            </h4>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleShowAiHelp(questionIndex)}
                              disabled={activeAIChat === questionIndex}
                              className="flex items-center space-x-1"
                            >
                              <span>🤖</span>
                              <span>AI Help</span>
                            </Button>
                          </div>
                          <div className="mb-4 text-card-foreground">
                            {renderMathContent(mcq.question)}
                          </div>
                        </div>
                      
                      <div className="space-y-2 mb-4">
                        {mcq.options.map((option, optionIndex) => (
                          <Button
                            key={optionIndex}
                            variant={selectedAnswers[questionIndex] === optionIndex ? "default" : "outline"}
                            className="w-full justify-start text-left h-auto p-3"
                            onClick={() => handleAnswerSelect(questionIndex, optionIndex)}
                          >
                            <span className="mr-3 font-medium">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            <span>{renderMathContent(option)}</span>
                          </Button>
                        ))}
                      </div>

                      {submitted && (
                        <Alert className={`${
                          selectedAnswers[questionIndex] === mcq.correctIndex 
                            ? 'border-success bg-success/10' 
                            : 'border-destructive bg-destructive/10'
                        }`}>
                          <div className="flex items-center space-x-2 mb-2">
                            {selectedAnswers[questionIndex] === mcq.correctIndex ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                            <span className="font-medium">
                              {selectedAnswers[questionIndex] === mcq.correctIndex ? 'Correct!' : 'Incorrect'}
                            </span>
                          </div>
                          <AlertDescription>
                            <div className="text-sm">
                              {selectedAnswers[questionIndex] === mcq.correctIndex
                                ? 'Great job!'
                                : 'Review with AI to understand the mistake.'}
                            </div>
                            {selectedAnswers[questionIndex] !== mcq.correctIndex && (
                              <div className="mt-3 flex items-center justify-between gap-3">
                                <span className="text-sm text-muted-foreground">Do you want to check why your option is wrong?</span>
                                <Button size="sm" onClick={() => handleShowAiHelp(
                                  questionIndex,
                                  `Question: ${mcq.question}\nOptions:\n${mcq.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n')}\nChosen option: ${String.fromCharCode(65 + (selectedAnswers[questionIndex] ?? -1))}. Correct option: ${String.fromCharCode(65 + mcq.correctIndex)}.\nExplain step-by-step (beginner-friendly). End with a single line: \\\"Final answer: ${String.fromCharCode(65 + mcq.correctIndex)}\\\".`
                                )}>Try AI</Button>
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                      </CardContent>
                    </Card>

                    {/* AI Chat Panel */}
                    {activeAIChat === questionIndex && (
                      <div className="w-96">
                        <QuestionAIChat
                          question={mcq.question}
                          subject="Mathematics"
                          level={level}
                          onClose={handleCloseAIChat}
                          initialPrompt={aiInitialPrompt || undefined}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit and Summary */}
              <div className="mt-6 flex flex-col items-center gap-4">
                <Button onClick={() => {
                  const map: { [key:number]: boolean } = {};
                  content.mcqs.forEach((_, idx) => { map[idx] = true; });
                  setShowExplanations(map);
                  setSubmitted(true);
                }} className="px-6 py-3 bg-primary text-white">
                  {submitted ? 'Recheck' : 'Submit Answers'}
                </Button>

                {submitted && (
                  <div className={`px-4 py-2 rounded-md ${passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    Score: {correctCount}/{totalQuestions} ({percent}%). {passed ? 'Great job! You can continue.' : 'Score at least 80% to unlock Next Chapter.'}
                  </div>
                )}
              </div>

              {/* Next Chapter Button (gated) */}
              <div className="flex justify-center mt-6">
                {nextChapter ? (
                  <Button
                    onClick={handleNextChapter}
                    disabled={gatingActive && (!submitted || !passed)}
                    className={`flex items-center space-x-2 bg-gradient-primary text-white transition-all duration-200 px-6 py-3 ${gatingActive && (!submitted || !passed) ? 'opacity-60 blur-[1px] cursor-not-allowed' : 'hover:scale-105'}`}
                  >
                    <span>Next Chapter: {nextChapter.title}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-muted-foreground">🎉 You've completed all chapters in this subject!</p>
                    <Button
                      variant="ghost"
                      onClick={() => navigate(`/${subject}/${level}`)}
                      className="mt-2 group relative inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/70 hover:bg-white/80 text-slate-800 shadow-sm hover:shadow-md ring-1 ring-black/5 backdrop-blur transition-all duration-200"
                    >
                      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
                      Back to Chapter List
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
