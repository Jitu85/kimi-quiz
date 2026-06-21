import React, { createContext, useContext, useReducer } from 'react';

export type Page = 'landing' | 'profile' | 'dashboard' | 'quiz' | 'results';

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  subject: string;
  classLevel: number;
  difficulty: 'Easy' | 'Hard';
  explanation: string;
  topicTag: string;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  classLevel: number;
  phone: string;
  email: string;
  isVerified: boolean;
}

export interface ExamResult {
  subject: string;
  classLevel: number;
  difficulty: 'Easy' | 'Hard';
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  isFirstAttempt: boolean;
  date: string;
}

export interface UnlockedExam {
  subject: string;
  classLevel: number;
}

export interface QuizState {
  currentPage: Page;
  userProfile: UserProfile | null;
  unlockedExams: UnlockedExam[];
  examResults: ExamResult[];
  selectedSubject: string | null;
  selectedClassLevel: number | null;
  selectedDifficulty: 'Easy' | 'Hard' | null;
  activeQuestions: Question[];
  answers: Record<number, number>;
  skippedQuestions: number[];
  score: number;
  timer: number;
  isQuizActive: boolean;
  isFirstAttempt: boolean;
}

type Action =
  | { type: 'NAVIGATE'; page: Page }
  | { type: 'SET_PROFILE'; profile: UserProfile }
  | { type: 'UNLOCK_EXAM'; subject: string; classLevel: number }
  | { type: 'SELECT_EXAM'; subject: string; classLevel: number; difficulty: 'Easy' | 'Hard' }
  | { type: 'START_QUIZ'; questions: Question[]; isFirstAttempt: boolean }
  | { type: 'ANSWER_QUESTION'; questionId: number; answerIndex: number }
  | { type: 'SKIP_QUESTION'; questionId: number }
  | { type: 'UPDATE_TIMER'; timer: number }
  | { type: 'FINISH_QUIZ'; score: number; correctAnswers: number; timeTaken: number }
  | { type: 'RESET_QUIZ' }
  | { type: 'GO_HOME' };

const initialState: QuizState = {
  currentPage: 'landing',
  userProfile: null,
  unlockedExams: [],
  examResults: [],
  selectedSubject: null,
  selectedClassLevel: null,
  selectedDifficulty: null,
  activeQuestions: [],
  answers: {},
  skippedQuestions: [],
  score: 0,
  timer: 9000, // 150 minutes in seconds
  isQuizActive: false,
  isFirstAttempt: true,
};

function quizReducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, currentPage: action.page };
    case 'SET_PROFILE':
      return { ...state, userProfile: action.profile, currentPage: 'dashboard' };
    case 'UNLOCK_EXAM':
      return {
        ...state,
        unlockedExams: [
          ...state.unlockedExams,
          { subject: action.subject, classLevel: action.classLevel },
        ],
      };
    case 'SELECT_EXAM':
      return {
        ...state,
        selectedSubject: action.subject,
        selectedClassLevel: action.classLevel,
        selectedDifficulty: action.difficulty,
      };
    case 'START_QUIZ':
      return {
        ...state,
        isQuizActive: true,
        isFirstAttempt: action.isFirstAttempt,
        activeQuestions: action.questions,
        answers: {},
        skippedQuestions: [],
        score: 0,
        timer: 9000,
        currentPage: 'quiz',
      };
    case 'ANSWER_QUESTION': {
      const newAnswers = { ...state.answers, [action.questionId]: action.answerIndex };
      const newSkipped = state.skippedQuestions.filter(id => id !== action.questionId);
      return { ...state, answers: newAnswers, skippedQuestions: newSkipped };
    }
    case 'SKIP_QUESTION':
      if (state.skippedQuestions.includes(action.questionId)) return state;
      return {
        ...state,
        skippedQuestions: [...state.skippedQuestions, action.questionId],
      };
    case 'UPDATE_TIMER':
      return { ...state, timer: action.timer };
    case 'FINISH_QUIZ': {
      const result: ExamResult = {
        subject: state.selectedSubject!,
        classLevel: state.selectedClassLevel!,
        difficulty: state.selectedDifficulty || 'Easy',
        score: action.score,
        totalQuestions: state.activeQuestions.length || 30,
        correctAnswers: action.correctAnswers,
        timeTaken: action.timeTaken,
        isFirstAttempt: state.isFirstAttempt,
        date: new Date().toISOString(),
      };
      return {
        ...state,
        score: action.score,
        isQuizActive: false,
        examResults: [...state.examResults, result],
        currentPage: 'results',
      };
    }
    case 'RESET_QUIZ':
      return {
        ...state,
        answers: {},
        skippedQuestions: [],
        score: 0,
        timer: 9000,
      };
    case 'GO_HOME':
      return {
        ...state,
        currentPage: 'dashboard',
        selectedSubject: null,
        selectedClassLevel: null,
        answers: {},
        skippedQuestions: [],
        score: 0,
        timer: 9000,
        isQuizActive: false,
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: QuizState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
