
import type { NextApiRequest, NextApiResponse } from 'next';

// This file is meant to be used in a server environment like Next.js API routes
// For the frontend implementation, we'll simulate its behavior

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, numTopics = 5 } = req.body;
    
    if (!text || text.trim().length < 100) {
      return res.status(400).json({ error: 'Text is too short for analysis' });
    }

    // Here we would call OpenAI API to extract topics
    // For demo purposes, we'll extract simple topics from the text

    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Mock topics generation
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
  } catch (error) {
    console.error('Error in extract-topics:', error);
    res.status(500).json({ error: 'Failed to extract topics' });
  }
}
