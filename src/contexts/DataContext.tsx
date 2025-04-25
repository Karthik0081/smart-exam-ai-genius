import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';
import { extractTextFromPdf, extractKeyTopics, generateQuestionsFromTopics } from '@/utils/pdfAnalyzer';

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
  studentName?: string; // Added for displaying student names in rankings
  answers: number[]; // Index of the selected answer for each question
  score: number;
  submittedAt: Date;
};

export type Student = {
  id: string;
  name: string;
  totalScore: number;
  examsTaken: number;
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
  extractTextFromPdf: (file: File) => Promise<string>;
  getTopStudents: (limit?: number) => Student[];
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

  // Generate questions from PDF using our improved analyzer
  const generateQuestionsFromPdf = async (
    file: File,
    numQuestions: number,
    questionTypes: QuestionType[]
  ): Promise<Question[]> => {
    try {
      toast.info("Analyzing PDF content...");
      
      // First extract text from PDF
      const pdfText = await extractTextFromPdf(file);
      
      // Extract key topics from the text
      toast.info("Extracting key topics...");
      const topics = await extractKeyTopics(pdfText, Math.min(5, numQuestions));
      
      // Generate questions based on topics
      toast.info("Generating questions...");
      const questions = await generateQuestionsFromTopics(
        topics, 
        questionTypes, 
        numQuestions
      );
      
      toast.success(`Generated ${questions.length} questions from ${file.name}`);
      return questions;
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Failed to generate questions from PDF');
      return [];
    }
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

  // Get top performing students
  const getTopStudents = (limit: number = 10): Student[] => {
    // Create a map to track student scores across all exams
    const studentScores: Record<string, { totalScore: number; examsTaken: number; name: string }> = {};
    
    // Process all submissions to calculate student scores
    submissions.forEach(submission => {
      if (!studentScores[submission.studentId]) {
        studentScores[submission.studentId] = { 
          totalScore: 0, 
          examsTaken: 0,
          name: submission.studentName || `Student ${submission.studentId}`
        };
      }
      
      studentScores[submission.studentId].totalScore += submission.score;
      studentScores[submission.studentId].examsTaken += 1;
    });
    
    // Convert to array and sort by average score
    const students = Object.entries(studentScores).map(([id, data]) => ({
      id,
      name: data.name,
      totalScore: data.totalScore,
      examsTaken: data.examsTaken,
      averageScore: data.examsTaken > 0 ? data.totalScore / data.examsTaken : 0
    }));
    
    // Sort by average score
    students.sort((a, b) => b.averageScore - a.averageScore);
    
    // Return top N students
    return students.slice(0, limit).map(s => ({
      id: s.id,
      name: s.name,
      totalScore: s.totalScore,
      examsTaken: s.examsTaken
    }));
  };

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
    extractTextFromPdf,
    getTopStudents,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
