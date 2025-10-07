import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSubject } from '@/data/sampleData';
import { useAppStore, Level } from '@/store/useAppStore';
import { BookOpen, Target, Trophy, Sparkles, X } from 'lucide-react';

const levelData = {
  beginner: {
    icon: BookOpen,
    gradient: 'from-green-400 via-emerald-500 to-teal-600',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-800',
    hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/20',
    badge: 'Start Here ✨',
    badgeColor: 'bg-green-500',
    description: 'Perfect for beginners • Step-by-step guidance • Visual learning',
    emoji: '🌱'
  },
  intermediate: {
    icon: Target, 
    gradient: 'from-orange-400 via-amber-500 to-yellow-500',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    borderColor: 'border-orange-200 dark:border-orange-800',
    hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
    badge: 'JEE Main 🎯',
    badgeColor: 'bg-orange-500',
    description: 'Standard JEE prep • Formal definitions • Practice problems',
    emoji: '🚀'
  },
  advanced: {
    icon: Trophy,
    gradient: 'from-purple-500 via-violet-600 to-indigo-600',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800',
    hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
    badge: 'JEE Advanced 💎',
    badgeColor: 'bg-purple-500',
    description: 'Rigorous concepts • Edge cases • Problem-solving mastery',
    emoji: '⚡'
  }
};

export function LevelPopup() {
  const navigate = useNavigate();
  const { subject } = useParams();
  const { setLevel, selectedSubject } = useAppStore();
  
  const subjectData = getSubject(subject || '');
  const isOpen = Boolean(subject && subjectData);

  useEffect(() => {
    if (subject && !subjectData) {
      navigate('/');
    }
  }, [subject, subjectData, navigate]);

  const handleLevelSelect = (level: Level) => {
    setLevel(level);
    navigate(`/${subject}/${level}`);
  };

  const handleClose = () => {
    navigate('/');
  };

  if (!subjectData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">{subjectData.name}</DialogTitle>
          <DialogDescription className="sr-only">Choose level for {subjectData.name}</DialogDescription>
        </DialogHeader>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
        >
          <X className="h-3 w-3 text-gray-600 dark:text-gray-400" />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2 filter drop-shadow-lg">
              {subjectData.icon}
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
              {subjectData.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose your vibe to get started ✨
            </p>
          </div>

          {/* Level cards */}
          <div className="space-y-3">
            {(Object.keys(levelData) as Level[]).map((level) => {
              const data = levelData[level];
              const LevelIcon = data.icon;
              
              return (
                <div
                  key={level}
                  onClick={() => handleLevelSelect(level)}
                  className={`group cursor-pointer p-4 rounded-xl border-2 ${data.borderColor} ${data.hoverBg} hover:border-opacity-60 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-white/50 dark:bg-gray-800/50`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="relative">
                      <div className={`p-3 rounded-xl ${data.iconBg} group-hover:scale-105 transition-transform duration-300`}>
                        <LevelIcon className={`h-5 w-5 ${data.iconColor}`} />
                      </div>
                      <div className="absolute -top-1 -right-1 text-sm">
                        {data.emoji}
                      </div>
                    </div>

                    <div className="flex-1">
                      {/* Level title and badge */}
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white capitalize">
                          {level}
                        </h3>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-white ${data.badgeColor}`}>
                          {data.badge}
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {data.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300">
                      <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center mt-4">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Sparkles className="h-3 w-3" />
              <span>Switch levels anytime while learning!</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
