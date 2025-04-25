
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
    const { text, numTopics = 5 } = req.body;
    
    if (!text || text.trim().length < 100) {
      return res.status(400).json({ error: 'Text is too short for analysis' });
    }

    const openaiKey = getApiKey('openai');
    
    if (!openaiKey) {
      return res.status(400).json({ error: 'OpenAI API key not found' });
    }

    try {
      // Call OpenAI API to extract topics
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
              content: `You are an expert in extracting key topics from educational text. Extract ${numTopics} main topics from the given text and return them in JSON format. Each topic should include a title, context, and 3-5 keywords.`
            },
            {
              role: "user",
              content: `Extract ${numTopics} key topics from this text:\n\n${text}`
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
      const topics = JSON.parse(data.choices[0].message.content).topics;
      
      res.status(200).json(topics);
    } catch (apiError) {
      console.error('Error calling OpenAI API:', apiError);
      
      // Fallback to our simple extraction if OpenAI fails
      console.log('Falling back to simple topic extraction');
      const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      
      // Mock topics generation as fallback
      const mockTopics = paragraphs.slice(0, numTopics).map((p, i) => {
        const keyTerms = p.split(' ')
          .filter(word => word.length > 4)
          .slice(0, 3);
        
        return {
          id: `topic-${i}`,
          title: keyTerms.join(' '),
          context: p.substring(0, 200),
          keywords: keyTerms
        };
      });

      res.status(200).json(mockTopics.slice(0, numTopics));
    }
  } catch (error) {
    console.error('Error in extract-topics:', error);
    res.status(500).json({ error: 'Failed to extract topics' });
  }
}
