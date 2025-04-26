
import { Question, QuestionType } from '@/contexts/DataContext';
import { toast } from '@/components/ui/sonner';
import { getApiKey, hasApiKey } from './apiConfig';

interface AIProvider {
  name: string;
  extractTopicsEndpoint: string;
  generateMcqEndpoint: string;
  apiKeyName: 'openai' | 'gemini';
}

const PROVIDERS: Record<string, AIProvider> = {
  openai: {
    name: 'OpenAI',
    extractTopicsEndpoint: '/api/extract-topics',
    generateMcqEndpoint: '/api/generate-mcq',
    apiKeyName: 'openai'
  },
  gemini: {
    name: 'Gemini',
    extractTopicsEndpoint: '/api/extract-topics-gemini',
    generateMcqEndpoint: '/api/generate-mcq-gemini',
    apiKeyName: 'gemini'
  }
};

// Get available AI provider based on API key availability
export const getAvailableProvider = (): AIProvider | null => {
  if (hasApiKey('openai')) {
    return PROVIDERS.openai;
  } else if (hasApiKey('gemini')) {
    return PROVIDERS.gemini;
  }
  return null;
};

export const extractKeyTopics = async (text: string, numTopics: number = 5, provider?: string) => {
  // Determine which provider to use
  const selectedProvider = provider && PROVIDERS[provider] 
    ? PROVIDERS[provider] 
    : getAvailableProvider();
  
  if (!selectedProvider) {
    toast.error('No AI provider is configured. Please set up either OpenAI or Gemini API key in the admin settings.');
    throw new Error('No API key found');
  }
  
  try {
    if (!hasApiKey(selectedProvider.apiKeyName)) {
      toast.error(`${selectedProvider.name} API key is not configured. Please set it up in the admin settings.`);
      throw new Error(`${selectedProvider.name} API key not found`);
    }
    
    const response = await fetch(selectedProvider.extractTopicsEndpoint, {
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

export const generateMCQ = async (topic: any, provider?: string) => {
  // Determine which provider to use
  const selectedProvider = provider && PROVIDERS[provider] 
    ? PROVIDERS[provider] 
    : getAvailableProvider();
  
  if (!selectedProvider) {
    toast.error('No AI provider is configured. Please set up either OpenAI or Gemini API key in the admin settings.');
    throw new Error('No API key found');
  }
  
  try {
    if (!hasApiKey(selectedProvider.apiKeyName)) {
      toast.error(`${selectedProvider.name} API key is not configured. Please set it up in the admin settings.`);
      throw new Error(`${selectedProvider.name} API key not found`);
    }
    
    const response = await fetch(selectedProvider.generateMcqEndpoint, {
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
    
    // Get the available AI provider
    const provider = getAvailableProvider();
    
    if (!provider) {
      toast.error('No AI provider is configured. Please set up either OpenAI or Gemini API key in the admin settings.');
      throw new Error('No API key found');
    }
    
    // Extract topics based on the requested number of questions
    const topics = await extractKeyTopics(text, validatedNumQuestions, provider.name.toLowerCase());
    
    if (!Array.isArray(topics) || topics.length === 0) {
      throw new Error('No valid topics were extracted from the document');
    }
    
    // Generate MCQs for each topic
    const mcqPromises = topics.slice(0, validatedNumQuestions).map(topic => 
      generateMCQ(topic, provider.name.toLowerCase())
    );
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
