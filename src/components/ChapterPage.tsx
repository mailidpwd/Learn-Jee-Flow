import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronRight, BookOpen, Brain, Target, ArrowRight, MessageCircle } from 'lucide-react';
import BackButton from './BackButton';
import { getSubject, getChapter, getSubtopicsByChapter, getContent, getChaptersBySubject } from '@/data/sampleData';
import { useAppStore, Level } from '@/store/useAppStore';
import { SubtopicContentPanel } from './SubtopicContentPanel';
import SidebarAIBot from './SidebarAIBot';
import { PhysicsAIBot } from './PhysicsAIBot';
import { ChemistryAIBot } from './ChemistryAIBot';
import { SetsRelationsFunctionsPlayground } from './SetsRelationsFunctionsPlayground';
import { ComplexPlaneMini } from './ComplexPlaneMini';
import { QuadraticParabolaMini } from './QuadraticParabolaMini';
import { MatrixTransformMini } from './MatrixTransformMini';
import { PermutationsCombinationsPlayground } from './PermutationsCombinationsPlayground';
import { BinomialTheoremPlayground } from './BinomialTheoremPlayground';
import SequencesSeriesPlayground from './SequencesSeriesPlayground';
import CalculusBasicsPlayground from './CalculusBasicsPlayground';
import IntegrationBasicsPlayground from './IntegrationBasicsPlayground';
import CoordinateGeometryLab from './CoordinateGeometryLab';
import TrigonometryPlayground from './TrigonometryPlayground';
import StatisticsProbabilityPlayground from './StatisticsProbabilityPlayground';
import ComplexNumbersInteractive from './ComplexNumbersInteractive';
import SetsRelationsIntermediatePlayground from './SetsRelationsIntermediatePlayground';
import SetsRelationsPlaygroundV2 from './SetsRelationsPlaygroundV2.jsx';
import SRFStudio from './SRFStudio';
import SetsRelationsPlayground from './SetsRelationsPlayground';
import ComplexNumbersIntermediatePlayground from './ComplexNumbersIntermediatePlayground';
import AdvancedComplexPlayground from './AdvancedComplexPlayground';
import BasicMathsPlayground from './BasicMathsPlayground';
import BasicMathsIntermediatePlayground from './BasicMathsIntermediatePlayground';
import BasicMathsAdvancedPlayground from './BasicMathsAdvancedPlayground';
import KinematicsPlayground from './KinematicsPlayground';
import KinematicsIntermediatePlayground from './KinematicsIntermediatePlayground';
import KinematicsAdvancedPlayground from './KinematicsAdvancedPlayground';
import ChemistryPlayground from './ChemistryPlayground';
import AtomicStructurePlayground from './AtomicStructurePlayground';
import ChemistryIntermediatePlayground from './ChemistryIntermediatePlayground';
import AtomicStructureIntermediatePlayground from './AtomicStructureIntermediatePlayground';
import ChemistryAdvancedPlayground from './ChemistryAdvancedPlayground';
import AtomicStructureAdvancedPlayground from './AtomicStructureAdvancedPlayground';
import katex from 'katex';
import React from 'react';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) {
      return <div className="text-sm text-red-600">Interactive lab failed to load. Please refresh.</div>;
    }
    return this.props.children as React.ReactElement;
  }
}

export function ChapterPage() {
  const navigate = useNavigate();
  const { subject, level, chapter } = useParams();
  const { selectedLevel } = useAppStore();
  const isMatricesChapter = chapter === 'matrices-determinants';
  const isPermutationsChapter = chapter === 'permutations-combinations';
  const isBinomialChapter = chapter === 'binomial-theorem';
  const isSequencesChapter = chapter === 'sequences-series';
  const isCalculusChapter = chapter === 'calculus-basics';
  const isIntegrationChapter = chapter === 'integration-basics';
  const isCoordinateChapter = chapter === 'coordinate-geometry-basics';
  const isStatisticsChapter = chapter === 'statistics-probability';
  const isComplexChapter = chapter === 'complex-numbers';
  const [currentSubtopicIndex, setCurrentSubtopicIndex] = React.useState(0);
  const [showMCQs, setShowMCQs] = React.useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = React.useState(true);
  
  const subjectData = getSubject(subject || '');
  const chapterData = getChapter(chapter || '');
  const subtopics = getSubtopicsByChapter(chapter || '');
  const currentLevel = level || selectedLevel;

  // Get all chapters for navigation
  const allChapters = getChaptersBySubject(subject || '').sort((a, b) => a.index - b.index);
  const currentChapterIndex = allChapters.findIndex(ch => ch.id === chapter);
  const previousChapter = currentChapterIndex > 0 ? allChapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < allChapters.length - 1 ? allChapters[currentChapterIndex + 1] : null;

  // Get all content for current level
  const subtopicContents = subtopics.map(subtopic => ({
    subtopic,
    content: getContent(subtopic.id, currentLevel as string)
  })).filter(item => item.content);

  const currentSubtopic = subtopicContents[currentSubtopicIndex];

  // Display overrides for Coordinate Geometry Basics and Statistics & Probability (single combined view)
  const displaySubtopicIndex = isCoordinateChapter || isStatisticsChapter ? 0 : currentSubtopicIndex;
  const displaySubtopicTotal = isCoordinateChapter || isStatisticsChapter ? 1 : subtopicContents.length;

  const handleBackToChapters = () => {
    navigate(`/${subject}/${level}`);
  };

  const handlePreviousChapter = () => {
    if (previousChapter) {
      navigate(`/${subject}/${level}/${previousChapter.id}`);
    }
  };

  const handleNextChapter = () => {
    if (nextChapter) {
      navigate(`/${subject}/${level}/${nextChapter.id}`);
    }
  };

  const handleNextSubtopic = () => {
    if (currentSubtopicIndex < subtopicContents.length - 1) {
      setCurrentSubtopicIndex(currentSubtopicIndex + 1);
      setShowMCQs(false);
    }
  };

  const handlePrevSubtopic = () => {
    if (currentSubtopicIndex > 0) {
      setCurrentSubtopicIndex(currentSubtopicIndex - 1);
      setShowMCQs(false);
    }
  };

  const renderMathContent = (text: string) => {
    if (!text) return '';
    
    let content = text;
    
    // Render LaTeX via KaTeX
    content = content.replace(/\$\$(.*?)\$\$/gs, (_match, formula) => {
      try {
        return katex.renderToString(String(formula).trim(), { displayMode: true, throwOnError: false });
      } catch {
        return String(formula);
      }
    });
    content = content.replace(/\$(.*?)\$/g, (_match, formula) => {
      try {
        return katex.renderToString(String(formula).trim(), { displayMode: false, throwOnError: false });
      } catch {
        return String(formula);
      }
    });
    
    // Handle markdown formatting
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    content = content.replace(/^### (.*$)/gm, '<h3 class="text-card-foreground font-semibold mt-0 mb-1">$1</h3>');
    content = content.replace(/^## (.*$)/gm, '<h3 class="text-card-foreground font-semibold mt-0 mb-1">$1</h3>');
    content = content.replace(/^# (.*$)/gm, '<h3 class="text-card-foreground font-semibold mt-0 mb-1">$1</h3>');
    // Convert markdown bullets to dot bullets (remove leading * or -)
    content = content.replace(/^\s*[\*-]\s+/gm, '• ');
    // Bold key section labels
    content = content.replace(/^📝\s*Symbols:/gm, '<strong>📝 Symbols:</strong>');
    content = content.replace(/^📚\s*Types of Sets \(exam must-know!\)/gm, '<strong>📚 Types of Sets (exam must-know!)</strong>');
    content = content.replace(/^🔑\s*Set Operations \(very important for JEE basics\)/gm, '<strong>🔑 Set Operations (very important for JEE basics)</strong>');
    content = content.replace(/^📖\s*Story Check/gm, '<strong>📖 Story Check</strong>');
    content = content.replace(/^💡\s*Exam Pointers \(Quick Recap for JEE\)/gm, '<strong>💡 Exam Pointers (Quick Recap for JEE)</strong>');
    // Handle plain star headings as subheadings
    content = content.replace(/^🌟(.*)$/gm, '<h3 class="text-card-foreground font-semibold mt-0 mb-1">🌟$1</h3>');

    content = content.replace(/\n\n/g, '</p><p class="mb-1">');
    content = content.replace(/\n/g, '<br>');
    // Cleanup excess breaks and empty paragraphs
    content = content.trim();
    content = content.replace(/^(<br\s*\/?>(\s|&nbsp;)*)+/i, '');
    content = content.replace(/(<br\s*\/?>(\s|&nbsp;)*){2,}/gi, '<br>');
    content = content.replace(/<p class=\"mb-1\">\s*<\/p>/g, '');

    return `<div class="space-y-1">${content}</div>`;
  };

  if (!subjectData || !chapterData || !currentLevel || !currentSubtopic) {
    return null;
  }

  const levelColors = {
    beginner: 'bg-levels-beginner text-white',
    intermediate: 'bg-levels-intermediate text-white',
    advanced: 'bg-levels-advanced text-white'
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <BackButton onClick={handleBackToChapters} label="Back to Chapters" className="mb-4" />
          
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <span className="font-medium">{subjectData.name}</span>
            <ChevronRight className="h-4 w-4" />
            <Badge className={`${levelColors[currentLevel as keyof typeof levelColors]} text-xs`}>
              {currentLevel}
            </Badge>
            <ChevronRight className="h-4 w-4" />
            <span className="text-card-foreground font-medium">{chapterData.title}</span>
          </nav>
        </div>

        {/* Chapter Progress */}
        <div className="mb-6 p-4 bg-gradient-card rounded-lg shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="text-lg">{subjectData.icon}</div>
              <h1 className="text-xl font-bold text-card-foreground">
                {isMatricesChapter 
                  ? 'Matrices and Determinants' 
                  : isCoordinateChapter 
                    ? 'Coordinate Geometry Basics' 
                    : isStatisticsChapter
                      ? 'Statistics & Probability Beginners'
                      : currentSubtopic.subtopic.title}
              </h1>
            </div>
            {chapter !== 'matrices-determinants' && (
              <Badge variant="outline">
                {displaySubtopicIndex + 1} of {displaySubtopicTotal}
              </Badge>
            )}
          </div>
          {!isMatricesChapter && (
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${isStatisticsChapter ? 'bg-blue-500' : 'bg-primary'}`}
                style={{ width: `${isCoordinateChapter || isStatisticsChapter ? 100 : ((currentSubtopicIndex + 1) / subtopicContents.length) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Content Tabs */}
        <div className="flex space-x-2 mb-6">
          <Button
            variant={!showMCQs ? "default" : "outline"}
            onClick={() => setShowMCQs(false)}
            className="flex items-center space-x-2"
          >
            <BookOpen className="h-4 w-4" />
            <span>Theory</span>
          </Button>
          <Button
            variant={showMCQs ? "default" : "outline"}
            onClick={() => setShowMCQs(true)}
            className="flex items-center space-x-2"
          >
            <Brain className="h-4 w-4" />
            <span>Practice MCQs</span>
          </Button>
        </div>

        {/* Main Content */}
        <Card className="shadow-soft border-0 bg-gradient-card mb-6">
          <CardContent className="p-6">
            {!showMCQs ? (
              <div className="space-y-4">
                {/* Theory Content */}
                <div>
                  <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span>Theory</span>
                  </h2>
                  <div className="space-y-8">
                    {
                      subtopicContents.map(({ subtopic, content }, idx) => (
                      <div key={subtopic.id} className="pt-2">
                        <h3 className="text-xl font-bold text-card-foreground mb-3">{subtopic.title}</h3>
                        <div
                            className="text-black leading-6 prose prose-lg max-w-none [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-blue-600 [&>h1]:mb-6 [&>h1]:font-['Arial',sans-serif] [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-gray-800 [&>h2]:mb-4 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-gray-700 [&>h3]:mb-3"
                          dangerouslySetInnerHTML={{ __html: renderMathContent(content.theory) }}
                        />

                        {subtopic.id === 'sets-representation' && currentLevel === 'beginner' && (
                          <div className="mt-4 space-y-2">
                            <h4 className="text-card-foreground font-semibold">Explore visually</h4>
                            <p className="text-sm text-muted-foreground">Use the interactive widgets below to play with sets, relations, and function mappings based on the theory above.</p>
                            <div className="mt-2">
                              <SetsRelationsFunctionsPlayground />
                            </div>
                          </div>
                        )}

                        {/* Intermediate-only interactive lab (end of theory) */}
                        {subtopic.id === 'sets-representation' && currentLevel === 'intermediate' && (
                          <div className="mt-8">
                            <ErrorBoundary>
                              <SetsRelationsIntermediatePlayground />
                            </ErrorBoundary>
                          </div>
                        )}

                        {subtopic.id === 'sets-representation' && currentLevel === 'advanced' && (
                          <div className="mt-8">
                            <h4 className="text-card-foreground font-semibold mb-2">🎮 SRF Studio — Advanced Interactive Playground</h4>
                            <ErrorBoundary>
                              <SRFStudio />
                            </ErrorBoundary>
                          </div>
                        )}

                          {isPermutationsChapter && subtopic.id === 'counting-principle' && (
                            <div className="mt-6 space-y-2">
                              <h4 className="text-card-foreground font-semibold">🎮 Interactive Learning Playground</h4>
                              <p className="text-sm text-muted-foreground">Play with permutations, combinations, and factorial concepts through visual animations and interactive examples. Drag sliders, click animate, and watch the magic happen!</p>
                              <div className="mt-4">
                                <PermutationsCombinationsPlayground />
                              </div>
                            </div>
                          )}

                          {isBinomialChapter && subtopic.id === 'binomial-expansion' && (
                            <div className="mt-6 space-y-2">
                              <h4 className="text-card-foreground font-semibold">🎮 Interactive Binomial Theorem Playground</h4>
                              <p className="text-sm text-muted-foreground">Explore binomial expansions, Pascal's triangle, and coefficient properties through interactive animations. Adjust n, a, b values and watch the expansion unfold in real-time!</p>
                              <div className="mt-4">
                                <BinomialTheoremPlayground />
                              </div>
                            </div>
                          )}

                          {isSequencesChapter && subtopic.id === 'arithmetic-progression' && (
                            <div className="mt-6 space-y-2">
                              <h4 className="text-card-foreground font-semibold">🎮 Interactive Sequences & Series Playground</h4>
                              <p className="text-sm text-muted-foreground">Explore Arithmetic Progressions, Geometric Progressions, and Special Series through interactive visualizations. Adjust parameters with sliders and watch sequences come to life with animations!</p>
                              <div className="mt-4">
                                <SequencesSeriesPlayground />
                              </div>
                            </div>
                          )}

                          {isCalculusChapter && subtopic.id === 'functions-graphs' && (
                            <div className="mt-6 space-y-2">
                              <h4 className="text-card-foreground font-semibold">🎮 Interactive Calculus Playground</h4>
                              <p className="text-sm text-muted-foreground">Visualize limits, derivatives, and integrals with interactive graphs and animations. Drag sliders to see how functions behave and understand the core concepts of calculus through hands-on exploration!</p>
                              <div className="mt-4">
                                <CalculusBasicsPlayground />
                              </div>
                            </div>
                          )}

                          {isIntegrationChapter && subtopic.id === 'standard-integrals' && (
                            <div className="mt-6 space-y-2">
                              <h4 className="text-card-foreground font-semibold">🎮 Interactive Integration Playground</h4>
                              <p className="text-sm text-muted-foreground">Visualize area under curves, compare antiderivatives, and explore integration rules through interactive graphs. Change function types, adjust bounds, and watch the magic of integration unfold in real-time!</p>
                              <div className="mt-4">
                                <IntegrationBasicsPlayground />
                              </div>
                            </div>
                          )}

                          {subtopic.id === 'trig-basics' && (
                            <div className="mt-6 space-y-2">
                              <h4 className="text-card-foreground font-semibold">🎮 Interactive Trigonometry Playground</h4>
                              <p className="text-sm text-muted-foreground">Explore the unit circle, drag points to see how angles relate to coordinates, and watch live graphs of sin, cos, and tan functions. Perfect for understanding trigonometric relationships through hands-on interaction!</p>
                              <div className="mt-4">
                                <TrigonometryPlayground />
                              </div>
                            </div>
                          )}

                          {subtopic.id === 'complex-intro' && chapter !== 'complex-numbers' && (
                          <div className="mt-4 space-y-4">
                            <div className="space-y-2">
                              <h4 className="text-card-foreground font-semibold">Complex Plane (Visual)</h4>
                              <ComplexPlaneMini />
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-card-foreground font-semibold">Quadratic Graph (Parabola)</h4>
                              <QuadraticParabolaMini />
                            </div>
                          </div>
                        )}

                          {chapter === 'complex-numbers' && currentLevel === 'intermediate' && idx === subtopicContents.length - 1 && (
                          <div className="mt-8">
                            <ErrorBoundary>
                              <ComplexNumbersIntermediatePlayground />
                            </ErrorBoundary>
                          </div>
                        )}

                        {chapter === 'complex-numbers' && currentLevel === 'advanced' && idx === subtopicContents.length - 1 && (
                          <div className="mt-8">
                            <ErrorBoundary>
                              <AdvancedComplexPlayground />
                            </ErrorBoundary>
                          </div>
                        )}

                        {subject === 'physics' && chapter === 'basic-maths' && currentLevel === 'beginner' && idx === subtopicContents.length - 1 && (
                          <div className="mt-8">
                            <ErrorBoundary>
                              <BasicMathsPlayground />
                            </ErrorBoundary>
                          </div>
                        )}

                        {subject === 'physics' && chapter === 'basic-maths' && currentLevel === 'intermediate' && idx === subtopicContents.length - 1 && (
                          <div className="mt-8">
                            <ErrorBoundary>
                              <BasicMathsIntermediatePlayground />
                            </ErrorBoundary>
                          </div>
                        )}

                        {subject === 'physics' && chapter === 'basic-maths' && currentLevel === 'advanced' && idx === subtopicContents.length - 1 && (
                          <div className="mt-8">
                            <ErrorBoundary>
                              <BasicMathsAdvancedPlayground />
                            </ErrorBoundary>
                          </div>
                        )}

                        {subject === 'physics' && chapter === 'kinematics' && currentLevel === 'beginner' && idx === subtopicContents.length - 1 && (
                          <div className="mt-8">
                            <ErrorBoundary>
                              <KinematicsPlayground />
                            </ErrorBoundary>
                          </div>
                        )}

                        {subject === 'physics' && chapter === 'kinematics' && currentLevel === 'intermediate' && idx === subtopicContents.length - 1 && (
                          <div className="mt-8">
                            <ErrorBoundary>
                              <KinematicsIntermediatePlayground />
                            </ErrorBoundary>
                          </div>
                        )}

                        {subject === 'physics' && chapter === 'kinematics' && currentLevel === 'advanced' && idx === subtopicContents.length - 1 && (
                          <div className="mt-8">
                            <ErrorBoundary>
                              <KinematicsAdvancedPlayground />
                            </ErrorBoundary>
                          </div>
                        )}

                        {subject === 'chemistry' && chapter === 'basic-concepts-chemistry' && currentLevel === 'beginner' && idx === subtopicContents.length - 1 && (
                          <div className="mt-8">
                            <ErrorBoundary>
                              <ChemistryPlayground />
                            </ErrorBoundary>
                          </div>
                        )}

                        {subject === 'chemistry' && chapter === 'atomic-structure' && currentLevel === 'beginner' && idx === subtopicContents.length - 1 && (
                          <div className="mt-8">
                            <ErrorBoundary>
                              <AtomicStructurePlayground />
                            </ErrorBoundary>
                          </div>
                        )}

                        {subject === 'chemistry' && chapter === 'basic-concepts-chemistry' && currentLevel === 'intermediate' && idx === subtopicContents.length - 1 && (
                          <div className="mt-8">
                            <ErrorBoundary>
                              <ChemistryIntermediatePlayground />
                            </ErrorBoundary>
                          </div>
                        )}

                        {subject === 'chemistry' && chapter === 'atomic-structure' && currentLevel === 'intermediate' && idx === subtopicContents.length - 1 && (
                          <div className="mt-8">
                            <ErrorBoundary>
                              <AtomicStructureIntermediatePlayground />
                            </ErrorBoundary>
                          </div>
                        )}

                        {subject === 'chemistry' && chapter === 'basic-concepts-chemistry' && currentLevel === 'advanced' && idx === subtopicContents.length - 1 && (
                          <div className="mt-8">
                            <ErrorBoundary>
                              <ChemistryAdvancedPlayground />
                            </ErrorBoundary>
                          </div>
                        )}

                        {subject === 'chemistry' && chapter === 'atomic-structure' && currentLevel === 'advanced' && idx === subtopicContents.length - 1 && (
                          <div className="mt-8">
                            <ErrorBoundary>
                              <AtomicStructureAdvancedPlayground />
                            </ErrorBoundary>
                          </div>
                        )}

                          {(subtopic.id === 'quadratic-roots' || subtopic.id === 'discriminant' || subtopic.id === 'vertex-form') && chapter !== 'complex-numbers' && (
                          <div className="mt-4 space-y-2">
                            <h4 className="text-card-foreground font-semibold">Graph View</h4>
                            <QuadraticParabolaMini />
                          </div>
                        )}

                          {content.examples.length > 0 && subtopic.id !== 'sets-representation' && chapter !== 'complex-numbers' && (
                          <div className="mt-4">
                            <h4 className="font-medium text-card-foreground mb-2">Examples</h4>
                            <div className="space-y-4">
                              {content.examples.map((example, eIdx) => (
                                <div key={eIdx} className="bg-muted/30 p-4 rounded-lg">
                                  <h5 className="font-medium text-card-foreground mb-2">Example {eIdx + 1}</h5>
                                  <div
                                    className="text-sm text-muted-foreground mb-3"
                                    dangerouslySetInnerHTML={{ __html: renderMathContent(example.prompt) }}
                                  />
                                  <div className="border-t border-border pt-2">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Solution:</p>
                                    <div
                                      className="text-sm text-card-foreground"
                                      dangerouslySetInnerHTML={{ __html: renderMathContent(example.solution) }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                          {chapter === 'coordinate-geometry-basics' && idx === subtopicContents.length - 1 && (
                            <div className="mt-8 space-y-2">
                              <h4 className="text-card-foreground font-semibold">🎮 Coordinate Geometry Visual Lab</h4>
                              <p className="text-sm text-muted-foreground">Drag points, adjust sliders, and watch formulas update live.</p>
                              <div className="mt-2">
                                <CoordinateGeometryLab />
                              </div>
                            </div>
                          )}

                          {chapter === 'statistics-probability' && idx === subtopicContents.length - 1 && (
                            <div className="mt-8 space-y-2">
                              <h4 className="text-card-foreground font-semibold">🎨 Interactive Visual Playground</h4>
                              <p className="text-sm text-muted-foreground">Drag, click, and play to understand Statistics & Probability forever!</p>
                              <div className="mt-2">
                                <StatisticsProbabilityPlayground />
                            </div>
                          </div>
                        )}
                      </div>
                      ))
                    }
                  </div>
                  {isMatricesChapter && (
                    <div className="mt-6 space-y-2">
                      <h4 className="text-card-foreground font-semibold">Matrix Transform (Visual)</h4>
                      <p className="text-sm text-muted-foreground">Move the sliders to change A = [a b; c d]. See unit square transform, determinant area, and column vectors.</p>
                      <div className="mt-2">
                        <MatrixTransformMini />
                      </div>
                    </div>
                  )}
                </div>



                 {/* Chapter Navigation & Actions */}
                 <div className="mt-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                   <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                     {/* Previous Chapter */}
                     <Button
                       variant="outline"
                       onClick={handlePreviousChapter}
                       disabled={!previousChapter}
                       className="flex items-center space-x-2 px-4 py-2 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <ArrowLeft className="h-4 w-4" />
                       <span className="font-medium">{previousChapter ? `Previous: ${previousChapter.title}` : 'Previous Chapter'}</span>
                     </Button>

                     {/* Practice MCQs */}
                     <Button
                       onClick={() => setShowMCQs(true)}
                       className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                     >
                       <Brain className="h-4 w-4" />
                       <span>Practice MCQs</span>
                     </Button>

                     {/* Next Chapter */}
                     <Button
                       variant="outline"
                       onClick={handleNextChapter}
                       disabled={!nextChapter}
                       className="flex items-center space-x-2 px-4 py-2 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <span className="font-medium">{nextChapter ? `Next: ${nextChapter.title}` : 'Next Chapter'}</span>
                       <ArrowRight className="h-4 w-4" />
                     </Button>
                   </div>
                 </div>
              </div>
            ) : (
              <SubtopicContentPanel 
                subtopicId={currentSubtopic.subtopic.id}
                level={currentLevel as Level}
                onClose={() => setShowMCQs(false)}
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* AI Study Assistant - Subject Specific */}
      {subjectData.id === 'mathematics' && (
        <SidebarAIBot 
          subject={subjectData.name}
          chapter={chapterData.title}
          level={currentLevel as string}
          isOpen={isChatbotOpen}
          onClose={() => setIsChatbotOpen(false)}
        />
      )}
      
      {subjectData.id === 'physics' && (
        <PhysicsAIBot 
          subject={subjectData.name}
          chapter={chapterData.title}
          level={currentLevel as string}
          isOpen={isChatbotOpen}
          onClose={() => setIsChatbotOpen(false)}
        />
      )}
      
      {subjectData.id === 'chemistry' && (
        <ChemistryAIBot 
          subject={subjectData.name}
          chapter={chapterData.title}
          level={currentLevel as string}
          isOpen={isChatbotOpen}
          onClose={() => setIsChatbotOpen(false)}
        />
      )}
      
      {/* Floating Chat Button - appears when chatbot is closed */}
      {!isChatbotOpen && (
        <div className="fixed right-6 bottom-6 z-50">
          <Button
            onClick={() => setIsChatbotOpen(true)}
            className={`w-14 h-14 rounded-full shadow-lg text-white transition-all duration-300 hover:scale-110 ${
              subjectData.id === 'mathematics' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                : subjectData.id === 'physics'
                ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
            }`}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
