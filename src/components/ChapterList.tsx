import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Clock, ArrowRight } from 'lucide-react';
import BackButton from './BackButton';
import { getSubject, getChaptersBySubject } from '@/data/sampleData';
import { useAppStore } from '@/store/useAppStore';

export function ChapterList() {
  const navigate = useNavigate();
  const { subject, level } = useParams();
  const { selectedLevel } = useAppStore();
  
  const subjectData = getSubject(subject || '');
  const chapters = getChaptersBySubject(subject || '');
  const currentLevel = level || selectedLevel;

  const handleBackToSubjects = () => {
    navigate('/');
  };

  const handleChapterClick = (chapterId: string) => {
    navigate(`/${subject}/${level}/${chapterId}`);
  };

  if (!subjectData || !currentLevel) {
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
        {/* Header */}
        <div className="mb-8">
          <BackButton onClick={handleBackToSubjects} label="Back to Subjects" className="mb-4" />
          
          <div className="flex flex-col items-center space-y-3 mb-4 text-center">
            <div className="text-[42px] leading-5">{subjectData.icon}</div>
            <div>
              <h1 className="text-[40px] leading-9 font-bold text-card-foreground">
                {subjectData.name}
              </h1>
              <div className="flex justify-center mt-2">
                <Badge className={`${levelColors[currentLevel as keyof typeof levelColors]}`}>
                  {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)} Level
                </Badge>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground text-lg text-center">
            {subjectData.description}
          </p>
        </div>

        {/* Chapter Grid - Apple-inspired glass tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {chapters.map((chapter) => {
            // Rotating accent palette to avoid gray defaults and ensure all chapters have vibrant UI
            const palette: { glow: string; badge: string; cta: string; icon: string }[] = [
              { glow: 'from-fuchsia-400 to-rose-300',  badge: 'from-fuchsia-500 to-rose-500',  cta: 'from-fuchsia-600 to-rose-600',  icon: '✨' },
              { glow: 'from-sky-400 to-cyan-300',      badge: 'from-sky-500 to-cyan-500',      cta: 'from-sky-600 to-cyan-600',      icon: '🔢' },
              { glow: 'from-emerald-400 to-teal-300',  badge: 'from-emerald-500 to-teal-500',  cta: 'from-emerald-600 to-teal-600',  icon: '📊' },
              { glow: 'from-orange-400 to-rose-300',   badge: 'from-orange-500 to-rose-500',   cta: 'from-orange-600 to-rose-600',   icon: '🎲' },
              { glow: 'from-indigo-400 to-violet-300', badge: 'from-indigo-500 to-violet-500', cta: 'from-indigo-600 to-violet-600', icon: '⚡' },
              { glow: 'from-teal-400 to-blue-300',     badge: 'from-teal-500 to-blue-500',     cta: 'from-teal-600 to-blue-600',     icon: '📈' },
              { glow: 'from-rose-400 to-pink-300',     badge: 'from-rose-500 to-pink-500',     cta: 'from-rose-600 to-pink-600',     icon: '📐' },
              { glow: 'from-amber-400 to-orange-300',  badge: 'from-amber-500 to-orange-500',  cta: 'from-amber-600 to-orange-600',  icon: '🔍' },
              { glow: 'from-violet-400 to-purple-300', badge: 'from-violet-500 to-purple-500', cta: 'from-violet-600 to-purple-600', icon: '📘' },
              { glow: 'from-lime-400 to-emerald-300',  badge: 'from-lime-500 to-emerald-500',  cta: 'from-lime-600 to-emerald-600',  icon: '🧪' },
              { glow: 'from-cyan-400 to-blue-300',     badge: 'from-cyan-500 to-blue-500',     cta: 'from-cyan-600 to-blue-600',     icon: '🧭' },
              { glow: 'from-pink-400 to-fuchsia-300',  badge: 'from-pink-500 to-fuchsia-500',  cta: 'from-pink-600 to-fuchsia-600',  icon: '🛰️' },
            ];

            const accent = palette[(chapter.index - 1) % palette.length];

            // Compact, consistent label for level/difficulty
            const fullDifficulty = String(chapter.difficulty[currentLevel as keyof typeof chapter.difficulty] || '');
            const compactLevel = /advanced/i.test(fullDifficulty)
              ? 'Advanced'
              : /main/i.test(fullDifficulty)
              ? 'JEE Main'
              : /foundation|beginner/i.test(fullDifficulty)
              ? 'Foundation'
              : fullDifficulty.replace(/\s*Level$/i, '');

            return (
              <div key={chapter.id} className="relative group cursor-pointer select-none h-full" onClick={() => handleChapterClick(chapter.id)}>
                {/* Ambient glow */}
                <div className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-br ${accent.glow} opacity-30 blur-xl transition-opacity group-hover:opacity-60`}></div>

                {/* Glass card */}
                <Card className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1 h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="px-3.5 py-1.5 rounded-full bg-white/80 ring-1 ring-black/5 text-slate-900 text-base sm:text-lg font-semibold tracking-tight tabular-nums">
                          {chapter.index}
                        </div>
                        <CardTitle className="text-[18px] sm:text-[20px] font-semibold tracking-tight text-slate-900 line-clamp-2">
                          {chapter.title}
                        </CardTitle>
                      </div>
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${accent.badge} text-white text-lg shadow-inner`}>
                        {accent.icon}
                      </div>
                    </div>

                    <CardDescription className="text-slate-600 leading-relaxed mb-4 line-clamp-3">
                      {chapter.levelDescriptions[currentLevel as keyof typeof chapter.levelDescriptions]}
                    </CardDescription>

                    <div className="mt-auto flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 rounded-full bg-white/80 ring-1 ring-slate-200 text-slate-700 text-xs flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="font-medium">~45 min</span>
                        </div>

                        <div
                          className="px-3 py-1 rounded-full bg-white/80 ring-1 ring-slate-200 text-slate-700 text-xs font-medium whitespace-nowrap min-w-[96px] flex items-center justify-center"
                          title={fullDifficulty}
                        >
                          {compactLevel}
                        </div>
                      </div>

                      <div className={`ml-auto mr-2 px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${accent.cta} ring-1 ring-white/40 shadow-sm hover:shadow-md transition-all flex items-center`}> 
                        <span className="tracking-tight">Start</span>
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Level Description */}
        <div className="mt-12 p-6 bg-gradient-card rounded-lg shadow-soft">
          <h3 className="font-semibold text-card-foreground mb-2">
            {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)} Level Learning
          </h3>
          <p className="text-muted-foreground">
            {currentLevel === 'beginner' && 'Focus on understanding basic concepts with simple explanations and plenty of examples.'}
            {currentLevel === 'intermediate' && 'Standard JEE preparation with formal definitions and comprehensive problem solving.'}
            {currentLevel === 'advanced' && 'Deep conceptual understanding with rigorous proofs and advanced problem-solving techniques.'}
          </p>
        </div>
      </div>
    </div>
  );
}
