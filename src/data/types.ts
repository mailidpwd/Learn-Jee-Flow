export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Subject = 'mathematics' | 'physics' | 'chemistry';

export interface LevelDescriptions {
  beginner: string;
  intermediate: string;
  advanced: string;
}

export interface DifficultyLabels {
  beginner: string;
  intermediate: string;
  advanced: string;
}

export interface SubjectData {
  id: Subject;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Chapter {
  id: string;
  subjectId: Subject; 
  index: number;
  title: string;
  description: string;
  totalSubtopics: number;
  levelDescriptions: LevelDescriptions;
  difficulty: DifficultyLabels;
}

export interface Subtopic {
  id: string;
  chapterId: string;
  index: number;
  title: string;
}

export interface MCQ {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
  aiHelp?: string;
  points: number;
}

export interface Example {
  prompt: string;
  solution: string;
}

export interface Content {
  subtopicId: string;
  level: Level;
  theory: string;
  examples: Example[];
  mcqs: MCQ[];
}