import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Subject = 'mathematics' | 'physics' | 'chemistry';

interface AppState {
  selectedLevel: Level | null;
  selectedSubject: Subject | null;
  openSubtopic: string | null;
  
  // Actions
  setLevel: (level: Level) => void;
  setSubject: (subject: Subject) => void;
  setOpenSubtopic: (subtopicId: string | null) => void;
  clearSelections: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      selectedLevel: null,
      selectedSubject: null,
      openSubtopic: null,
      
      setLevel: (level) => set({ selectedLevel: level }),
      setSubject: (subject) => set({ selectedSubject: subject }),
      setOpenSubtopic: (subtopicId) => set({ openSubtopic: subtopicId }),
      clearSelections: () => set({ 
        selectedLevel: null, 
        selectedSubject: null, 
        openSubtopic: null 
      }),
    }),
    {
      name: 'jee-app-store',
    }
  )
);