
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

    const geminiKey = getApiKey('gemini');
    
    if (!geminiKey) {
      return res.status(400).json({ error: 'Gemini API key not found' });
    }

    try {
      // Prepare the context from the topic
      const keyTerms = topic.keywords || [];
      const context = topic.context || '';
      const title = topic.title || keyTerms[0] || 'the topic';

      // Call Gemini API to generate MCQ
      const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiKey
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Create a challenging but fair multiple-choice question about "${title}".
                  Topic context: "${context}"
                  Key terms: ${keyTerms.join(', ')}
                  
                  Return it as a valid JSON object with these fields:
                  {
                    "question": "the question text",
                    "options": ["option 1", "option 2", "option 3", "option 4"],
                    "correctAnswer": 0  // index of the correct answer (0-3)
                  }`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2
          }
        })
      });

      if (!geminiResponse.ok) {
        const errorData = await geminiResponse.json();
        console.error('Gemini API error:', errorData);
        return res.status(geminiResponse.status).json({ error: errorData.error?.message || 'Gemini API error' });
      }

      const data = await geminiResponse.json();
      
      // Parse the response to extract the JSON content
      const textContent = data.candidates[0].content.parts[0].text;
      let mcq;
      
      // Extract JSON from the response text (Gemini might wrap it in ```json or markdown)
      const jsonMatch = textContent.match(/```(?:json)?([\s\S]*?)```/) || [null, textContent];
      let jsonContent = jsonMatch[1].trim();
      
      try {
        // Try to parse the JSON content
        mcq = JSON.parse(jsonContent);
      } catch (jsonError) {
        console.error('Error parsing JSON from Gemini response:', jsonError);
        throw new Error('Failed to parse response from Gemini');
      }
      
      res.status(200).json(mcq);
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError);
      
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
