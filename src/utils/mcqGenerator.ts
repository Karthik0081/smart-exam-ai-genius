
import { Question, QuestionType } from '@/contexts/DataContext';
import { toast } from '@/components/ui/sonner';
import { getApiKey, hasApiKey } from './apiConfig';
import { extractKeyTopics, generateQuestionsFromTopics } from './pdfAnalyzer';

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

// Simple validation utility for the PDF text
export const validatePdfText = (text: string): boolean => {
  return text !== undefined && text !== null && text.trim().length >= 100;
};

export const generateQuestionsFromText = async (
  text: string, 
  numQuestions: number,
  questionTypes: QuestionType[] = ['mcq', 'fill-in-the-blank']
): Promise<Question[]> => {
  try {
    // Validate text input
    if (!validatePdfText(text)) {
      toast.error('The extracted text is too short or invalid');
      return [];
    }
    
    // First try to use the API-based approach if configured
    const provider = getAvailableProvider();
    
    if (provider) {
      try {
        // Try to use the API-based question generation
        toast.info(`Using ${provider.name} for question generation`);
        
        // Make API request to extract topics
        const response = await fetch(provider.extractTopicsEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, numTopics: numQuestions }),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        
        const topics = await response.json();
        
        // Generate MCQs for each topic
        const mcqPromises = topics.map((topic: any) => 
          fetch(provider.generateMcqEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic }),
          }).then(res => res.json())
        );
        
        const generatedQuestions = await Promise.all(mcqPromises);
        
        // Map the API responses to our Question format
        return generatedQuestions.map((mcq, idx) => ({
          id: `api-q-${Date.now()}-${idx}`,
          text: mcq.question || 'API-generated question',
          type: 'mcq' as QuestionType,
          options: Array.isArray(mcq.options) ? mcq.options : [],
          correctAnswer: typeof mcq.correctAnswer === "number" ? mcq.correctAnswer : 0,
        }));
      } catch (apiError) {
        console.error('API-based generation failed, falling back to local generation:', apiError);
        // If API-based generation fails, fall back to local generation
        toast.warning('API-based generation failed, using fallback method');
      }
    }
    
    // Fallback to local topic extraction and question generation
    const topics = await extractKeyTopics(text, numQuestions);
    
    if (topics.length === 0) {
      throw new Error('Failed to extract topics from the document');
    }
    
    const questions = await generateQuestionsFromTopics(
      topics, 
      questionTypes, 
      numQuestions
    );
    
    return questions.map((q, index) => ({
      ...q,
      id: `local-q-${Date.now()}-${index}`
    }));
  } catch (error) {
    console.error('Error generating questions:', error);
    toast.error('Failed to generate questions: ' + (error instanceof Error ? error.message : 'Unknown error'));
    return [];
  }
};

// Helper function to create a blank question template
export const createBlankQuestion = (): Question => ({
  id: `custom-${Date.now()}`,
  text: '',
  type: 'mcq',
  options: ['', '', '', ''],
  correctAnswer: 0
});
