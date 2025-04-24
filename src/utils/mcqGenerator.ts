
import { Question, QuestionType } from '@/contexts/DataContext';
import { toast } from '@/components/ui/sonner';

export const extractKeyTopics = async (text: string, numTopics: number = 5) => {
  const response = await fetch("/api/extract-topics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, numTopics }),
  });
  return response.json();
};

export const generateMCQ = async (topic: any) => {
  const response = await fetch("/api/generate-mcq", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  return response.json();
};

export const generateQuestionsFromText = async (text: string, numQuestions: number): Promise<Question[]> => {
  try {
    const topics = await extractKeyTopics(text, numQuestions);
    const questions = await Promise.all(topics.map(generateMCQ));

    return questions.map((mcq, idx) => ({
      id: `text-q-${Date.now()}-${idx}`,
      text: mcq.question || 'Auto-generated question',
      type: 'mcq' as QuestionType,
      options: Array.isArray(mcq.options) ? mcq.options : [],
      correctAnswer: typeof mcq.correctAnswer === "number" ? mcq.correctAnswer : 0,
    }));
  } catch (error) {
    console.error('Error generating questions:', error);
    toast.error('Failed to generate questions');
    return [];
  }
};
