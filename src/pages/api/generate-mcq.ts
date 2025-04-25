
// This file is for API simulation in a frontend environment

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

    // In a real implementation, we would call OpenAI API here
    // For demo purposes, we'll generate mock MCQs based on the topic

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
  } catch (error) {
    console.error('Error generating MCQ:', error);
    res.status(500).json({ error: 'Failed to generate MCQ' });
  }
}
