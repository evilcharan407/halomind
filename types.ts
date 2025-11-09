export interface Course {
  id: string;
  title: string;
  sourceFile: string;
  sourceContent: string; // Full text content from the source document
  sections: Section[];
}

export interface Section {
  id: string;
  title: string;
  notes: string;
  quiz: Quiz | null;
  flashcards: Flashcard[];
  simpleExplainer: SimpleExplainer | null;
  deepExplainerScript: string | null;
  rephrasedScript?: string;
  deepExplainerVideoUrl?: string;
  videoGenerationOperation?: any;
  quizPerformance?: {
    incorrectQuestionPrompts: string[];
  };
}

export interface Quiz {
  id: string;
  questions: Question[];
}

export interface Question {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface SimpleExplainer {
  title: string;
  points: string[];
  diagramPrompt: string;
  diagramUrl?: string;
  groundingSources?: { title: string; uri: string }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface StudyPlanItem {
  id: string; // combination of courseId-sectionId
  courseId: string;
  courseTitle: string;
  sectionId: string;
  sectionTitle: string;
  scheduledDate: string; // YYYY-MM-DD
  completed: boolean;
}