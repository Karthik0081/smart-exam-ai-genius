
import { Question, QuestionType } from '@/contexts/DataContext';
import { toast } from '@/components/ui/sonner';
import { getApiKey, hasApiKey } from './apiConfig';

export const extractKeyTopics = async (text: string, numTopics: number = 5) => {
  try {
    if (!hasApiKey('openai')) {
      toast.error('OpenAI API key is not configured. Please set it up in the admin settings.');
      throw new Error('OpenAI API key not found');
    }
    
    const response = await fetch("/api/extract-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, numTopics }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to extract topics: ${errorData.error || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error extracting topics:', error);
    throw error;
  }
};

export const generateMCQ = async (topic: any) => {
  try {
    if (!hasApiKey('openai')) {
      toast.error('OpenAI API key is not configured. Please set it up in the admin settings.');
      throw new Error('OpenAI API key not found');
    }
    
    const response = await fetch("/api/generate-mcq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to generate MCQ: ${errorData.error || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating MCQ:', error);
    throw error;
  }
};

export const generateQuestionsFromText = async (text: string, numQuestions: number): Promise<Question[]> => {
  try {
    // Validate the number of questions
    const validatedNumQuestions = Math.min(Math.max(1, numQuestions), 20);
    
    // Check for API key
    if (!hasApiKey('openai')) {
      toast.error('OpenAI API key is not configured. Please set it up in the admin settings.');
      throw new Error('OpenAI API key not found');
    }
    
    // Extract topics based on the requested number of questions
    const topics = await extractKeyTopics(text, validatedNumQuestions);
    
    if (!Array.isArray(topics) || topics.length === 0) {
      throw new Error('No valid topics were extracted from the document');
    }
    
    // Generate MCQs for each topic
    const mcqPromises = topics.slice(0, validatedNumQuestions).map(generateMCQ);
    const questions = await Promise.all(mcqPromises);
    
    // Map the API responses to our Question format
    return questions.map((mcq, idx) => ({
      id: `text-q-${Date.now()}-${idx}`,
      text: mcq.question || 'Auto-generated question',
      type: 'mcq' as QuestionType,
      options: Array.isArray(mcq.options) ? mcq.options : [],
      correctAnswer: typeof mcq.correctAnswer === "number" ? mcq.correctAnswer : 0,
    }));
  } catch (error) {
    console.error('Error generating questions:', error);
    toast.error('Failed to generate questions: ' + (error instanceof Error ? error.message : 'Unknown error'));
    return [];
  }
};

// Simple validation utility for the PDF text
export const validatePdfText = (text: string): boolean => {
  return text !== undefined && text !== null && text.trim().length >= 100;
};
