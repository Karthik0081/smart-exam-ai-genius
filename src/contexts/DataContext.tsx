
import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';

// Define types
export type QuestionType = 'mcq' | 'fill-in-the-blank';

export type Question = {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswer: number; // Index of the correct answer or correct text for fill-in-the-blank
};

export type Exam = {
  id: string;
  title: string;
  duration: number; // in minutes
  questions: Question[];
  createdBy: string;
  createdAt: Date;
};

export type Submission = {
  id: string;
  examId: string;
  studentId: string;
  answers: number[]; // Index of the selected answer for each question
  score: number;
  submittedAt: Date;
};

type DataContextType = {
  exams: Exam[];
  submissions: Submission[];
  createExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => void;
  generateQuestionsFromPdf: (file: File, numQuestions: number, questionTypes: QuestionType[]) => Promise<Question[]>;
  submitExam: (examId: string, studentId: string, answers: number[]) => void;
  getExamById: (id: string) => Exam | undefined;
  getSubmissionsByStudent: (studentId: string) => Submission[];
  getSubmissionsByExam: (examId: string) => Submission[];
  getStudentSubmissionForExam: (studentId: string, examId: string) => Submission | undefined;
};

// Create context
const DataContext = createContext<DataContextType | null>(null);

// Custom hook for using data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Sample exam data
const sampleQuestions: Question[] = [
  {
    id: '1',
    text: 'What is the capital of France?',
    type: 'mcq',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    correctAnswer: 2 // Paris
  },
  {
    id: '2',
    text: 'Which planet is closest to the sun?',
    type: 'mcq',
    options: ['Venus', 'Earth', 'Mars', 'Mercury'],
    correctAnswer: 3 // Mercury
  },
  {
    id: '3',
    text: 'Who wrote "Romeo and Juliet"?',
    type: 'mcq',
    options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
    correctAnswer: 1 // William Shakespeare
  },
  {
    id: '4',
    text: 'What is 2 + 2?',
    type: 'mcq',
    options: ['3', '4', '5', '6'],
    correctAnswer: 1 // 4
  },
  {
    id: '5',
    text: 'The chemical symbol "O" represents __________.',
    type: 'fill-in-the-blank',
    options: ['Osmium', 'Oxygen', 'Oganesson', 'Olivine'],
    correctAnswer: 1 // Oxygen
  }
];

// Sample exams
const initialExams: Exam[] = [
  {
    id: '1',
    title: 'General Knowledge Quiz',
    duration: 10,
    questions: sampleQuestions,
    createdBy: '1', // admin
    createdAt: new Date('2023-01-01')
  }
];

// Sample submissions
const initialSubmissions: Submission[] = [
  {
    id: '1',
    examId: '1',
    studentId: '2',
    answers: [2, 3, 1, 1, 1], // All correct
    score: 100,
    submittedAt: new Date('2023-01-02')
  }
];

// Data Provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);

  // Create a new exam
  const createExam = (exam: Omit<Exam, 'id' | 'createdAt'>) => {
    const newExam: Exam = {
      ...exam,
      id: String(exams.length + 1),
      createdAt: new Date()
    };
    
    setExams([...exams, newExam]);
    toast.success('Exam created successfully');
  };

  // Generate questions from PDF (mock implementation)
  const generateQuestionsFromPdf = async (
    file: File, 
    numQuestions: number, 
    questionTypes: QuestionType[] = ['mcq', 'fill-in-the-blank']
  ): Promise<Question[]> => {
    // This would be an API call to OpenAI in a real implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock generating questions with mixed types
        const newQuestions = Array.from({ length: numQuestions }).map((_, index) => {
          // Decide question type - alternate between MCQ and fill-in-the-blank if both types requested
          const type = questionTypes.length > 1 
            ? (index % 2 === 0 ? 'mcq' : 'fill-in-the-blank') 
            : questionTypes[0];
          
          let questionText = '';
          
          if (type === 'mcq') {
            questionText = `Generated MCQ ${index + 1} from ${file.name}?`;
          } else {
            // For fill-in-the-blank, include a blank in the question
            questionText = `Generated sentence ${index + 1} from ${file.name} with a __________.`;
          }
          
          return {
            id: `new-${index + 1}`,
            text: questionText,
            type,
            options: [
              `Option A for question ${index + 1}`,
              `Option B for question ${index + 1}`,
              `Option C for question ${index + 1}`,
              `Option D for question ${index + 1}`,
            ],
            correctAnswer: Math.floor(Math.random() * 4), // Random correct answer
          };
        });
        
        toast.success(`Generated ${numQuestions} questions (${newQuestions.filter(q => q.type === 'mcq').length} MCQs, ${newQuestions.filter(q => q.type === 'fill-in-the-blank').length} fill-in-the-blank)`);
        resolve(newQuestions);
      }, 2000);
    });
  };

  // Submit exam
  const submitExam = (examId: string, studentId: string, answers: number[]) => {
    const exam = exams.find(e => e.id === examId);
    
    if (!exam) {
      toast.error('Exam not found');
      return;
    }
    
    // Calculate score
    let correctAnswers = 0;
    answers.forEach((answer, index) => {
      if (answer === exam.questions[index].correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = (correctAnswers / exam.questions.length) * 100;
    
    const newSubmission: Submission = {
      id: String(submissions.length + 1),
      examId,
      studentId,
      answers,
      score,
      submittedAt: new Date()
    };
    
    setSubmissions([...submissions, newSubmission]);
    toast.success('Exam submitted successfully');
  };

  // Get exam by ID
  const getExamById = (id: string) => exams.find(e => e.id === id);

  // Get submissions by student
  const getSubmissionsByStudent = (studentId: string) => 
    submissions.filter(s => s.studentId === studentId);

  // Get submissions by exam
  const getSubmissionsByExam = (examId: string) => 
    submissions.filter(s => s.examId === examId);
    
  // Get a specific student's submission for an exam
  const getStudentSubmissionForExam = (studentId: string, examId: string) => 
    submissions.find(s => s.studentId === studentId && s.examId === examId);

  const value = {
    exams,
    submissions,
    createExam,
    generateQuestionsFromPdf,
    submitExam,
    getExamById,
    getSubmissionsByStudent,
    getSubmissionsByExam,
    getStudentSubmissionForExam,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
