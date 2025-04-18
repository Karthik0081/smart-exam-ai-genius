
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
  extractTextFromPdf: (file: File) => Promise<string>;
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

  // Extract text from PDF (mock implementation)
  const extractTextFromPdf = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      // In a real implementation, we would use a PDF parsing library
      // For demo purposes, we'll simulate extracting text after a delay
      setTimeout(() => {
        // Mock text content from PDF
        const mockPdfContent = `
          Learning Document: Advanced Concepts
          
          Section 1: Introduction to Machine Learning
          Machine learning is a method of data analysis that automates analytical model building. 
          The process of learning begins with observations or data, such as examples, direct experience, 
          or instruction, in order to look for patterns in data and make better decisions in the future.
          
          Section 2: Types of Machine Learning Algorithms
          There are three main types of machine learning algorithms: supervised learning, unsupervised learning, 
          and reinforcement learning. Supervised learning uses labeled data, while unsupervised learning 
          finds patterns in unlabeled data.
          
          Section 3: Neural Networks
          Neural networks are computing systems inspired by the biological neural networks that constitute 
          animal brains. The connections between neurons carry signals in the form of mathematical functions.
          
          Section 4: Data Preprocessing
          Data preprocessing is a crucial step in machine learning that involves transforming raw data into 
          a clean dataset. The process includes cleaning, normalization, transformation, feature extraction, 
          and selection.
          
          Section 5: Model Evaluation
          Model evaluation is the process of using different metrics to understand how well your model 
          is performing. Common metrics include accuracy, precision, recall, and F1-score.
        `;
        
        resolve(mockPdfContent);
      }, 1500);
    });
  };

  // Generate questions from PDF
  const generateQuestionsFromPdf = async (
    file: File,
    numQuestions: number,
    questionTypes: QuestionType[]
  ): Promise<Question[]> => {
    try {
      // First extract text from PDF
      const pdfText = await extractTextFromPdf(file);
      
      // Now generate questions based on the extracted text
      return new Promise((resolve) => {
        setTimeout(() => {
          const questions: Question[] = [];
          
          // Extract sections from the PDF text
          const sections = pdfText.split(/Section \d+:/g).filter(Boolean);
          
          // Generate questions based on selected types
          for (let i = 0; i < numQuestions; i++) {
            const type = questionTypes[i % questionTypes.length];
            const questionId = `gen-${Date.now()}-${i}`;
            const sectionIndex = i % sections.length;
            const section = sections[sectionIndex].trim();
            const sectionTitle = section.split('\n')[0].trim();
            
            if (type === 'mcq') {
              // Extract keywords for options
              const words = section
                .split(/\s+/)
                .filter(word => word.length > 5)
                .filter((_, idx) => idx % 7 === 0)
                .slice(0, 4);
              
              // If we don't have enough words, add some generic options
              while (words.length < 4) {
                words.push(`Option ${words.length + 1}`);
              }
              
              questions.push({
                id: questionId,
                text: `Based on the content about ${sectionTitle}, which concept is most important?`,
                type: 'mcq',
                options: words,
                correctAnswer: Math.floor(Math.random() * 4),
              });
            } else {
              // Find a suitable word to blank out
              const sentences = section.split(/[.!?]+/).filter(s => s.trim().length > 10);
              let sentence = sentences[Math.floor(Math.random() * sentences.length)] || section;
              
              // Extract keywords for the blank
              const words = sentence
                .split(/\s+/)
                .filter(word => word.length > 5)
                .slice(0, 4);
              
              // If we don't have enough words, add some generic options
              while (words.length < 4) {
                words.push(`Term ${words.length + 1}`);
              }
              
              // Select a word to blank out
              const blankWord = words[0];
              const blankSentence = sentence.replace(blankWord, '__________');
              
              questions.push({
                id: questionId,
                text: blankSentence,
                type: 'fill-in-the-blank',
                options: words,
                correctAnswer: 0, // First option is correct (the blanked word)
              });
            }
          }
          
          toast.success(`Generated ${questions.length} questions from ${file.name}`);
          resolve(questions);
        }, 1500); // Simulate API delay
      });
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
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
