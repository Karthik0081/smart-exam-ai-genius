
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

    const geminiKey = getApiKey('gemini');
    
    if (!geminiKey) {
      return res.status(400).json({ error: 'Gemini API key not found' });
    }

    try {
      // Call Gemini API to extract topics
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
                  text: `Extract ${numTopics} main topics from this educational text and return them in JSON format. Each topic should include a title, context, and 3-5 keywords. Format the response as a valid JSON object with a "topics" array containing objects with the following structure:
                  {
                    "topics": [
                      {
                        "id": "topic-1",
                        "title": "Topic Title",
                        "context": "Brief context about the topic",
                        "keywords": ["keyword1", "keyword2", "keyword3"]
                      }
                    ]
                  }
                  
                  Here is the text to analyze:
                  ${text}`
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
      let topics;
      
      // Extract JSON from the response text (Gemini might wrap it in ```json or markdown)
      const jsonMatch = textContent.match(/```(?:json)?([\s\S]*?)```/) || [null, textContent];
      let jsonContent = jsonMatch[1].trim();
      
      try {
        // Try to parse the JSON content
        const parsedContent = JSON.parse(jsonContent);
        topics = parsedContent.topics;
      } catch (jsonError) {
        console.error('Error parsing JSON from Gemini response:', jsonError);
        
        // If there's an error parsing the JSON, try to extract it differently
        // Sometimes Gemini returns just the array without the wrapper object
        try {
          const alternativeMatch = textContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (alternativeMatch) {
            const alternativeJson = JSON.parse(alternativeMatch[0]);
            topics = alternativeJson;
          } else {
            throw new Error('Could not parse JSON from response');
          }
        } catch (alternativeError) {
          console.error('Alternative parsing failed:', alternativeError);
          throw new Error('Failed to parse response from Gemini');
        }
      }
      
      if (!Array.isArray(topics)) {
        throw new Error('Invalid response structure from Gemini');
      }
      
      res.status(200).json(topics);
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError);
      
      // Fallback to simple topic extraction if Gemini fails
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
    console.error('Error in extract-topics-gemini:', error);
    res.status(500).json({ error: 'Failed to extract topics' });
  }
}
