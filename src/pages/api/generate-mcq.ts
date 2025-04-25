
// This file is for API simulation in a frontend environment
import { getApiKey } from '@/utils/apiConfig';

// Define our own request and response types to replace Next.js types
interface Request {
  method: string;
  body: any;
}

interface Response {
  status: (code: number) => Response;
  json: (data: any) => any;
}

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const openaiKey = getApiKey('openai');
    
    if (!openaiKey) {
      return res.status(400).json({ error: 'OpenAI API key not found' });
    }

    try {
      // Prepare the context from the topic
      const keyTerms = topic.keywords || [];
      const context = topic.context || '';
      const title = topic.title || keyTerms[0] || 'the topic';

      // Call OpenAI API to generate MCQ
      const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an expert at creating educational multiple-choice questions. 
              Create a challenging but fair multiple-choice question based on the given topic.
              Return it as a JSON object with these fields:
              - question: the question text
              - options: array of 4 possible answers
              - correctAnswer: index of the correct answer (0-3)`
            },
            {
              role: "user",
              content: `Create a multiple-choice question about "${title}". 
              Topic context: "${context}" 
              Key terms: ${keyTerms.join(', ')}`
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!openAiResponse.ok) {
        const errorData = await openAiResponse.json();
        console.error('OpenAI API error:', errorData);
        return res.status(openAiResponse.status).json({ error: errorData.error?.message || 'OpenAI API error' });
      }

      const data = await openAiResponse.json();
      const mcq = JSON.parse(data.choices[0].message.content);
      
      res.status(200).json(mcq);
    } catch (apiError) {
      console.error('Error calling OpenAI API:', apiError);
      
      // Fallback to simple MCQ generation
      console.log('Falling back to simple MCQ generation');
      const keyTerms = topic.keywords || [];
      const context = topic.context || '';

      // Extract potential answers from the context
      const words = context.split(' ')
        .filter(word => word.length > 3)
        .map(word => word.replace(/[^\w\s]/g, ''));
      
      const uniqueWords = [...new Set(words)];
      
      // Generate a question based on the context
      const question = `What is the main concept related to ${topic.title || keyTerms[0] || 'the topic'}?`;
      
      // Create options with the first one being correct
      const correctAnswer = keyTerms[0] || uniqueWords[0] || 'Correct answer';
      const otherOptions = [
        keyTerms[1] || uniqueWords[Math.floor(uniqueWords.length * 0.3)] || 'Option 2',
        keyTerms[2] || uniqueWords[Math.floor(uniqueWords.length * 0.6)] || 'Option 3',
        uniqueWords[Math.floor(uniqueWords.length * 0.9)] || 'Option 4'
      ];
      
      // Randomize options order
      const options = [correctAnswer, ...otherOptions];
      const correctIndex = 0; // First option is correct
      
      const mcq = {
        question,
        options,
        correctAnswer: correctIndex
      };

      res.status(200).json(mcq);
    }
  } catch (error) {
    console.error('Error generating MCQ:', error);
    res.status(500).json({ error: 'Failed to generate MCQ' });
  }
}
