
import type { NextApiRequest, NextApiResponse } from 'next';

// This file is meant to be used in a server environment like Next.js API routes
// For the frontend implementation, we'll simulate its behavior

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // Here we would call OpenAI API to generate an MCQ
    // For demo purposes, we'll create a mock MCQ based on the topic

    // Create a mock question based on the topic
    const questionTypes = [
      "What is the main concept of",
      "Which best describes",
      "How would you define",
      "What is a key characteristic of"
    ];
    
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const question = `${questionType} ${topic.title || 'the topic'}?`;
    
    // Mock options and correct answer
    const correctOption = topic.keywords ? topic.keywords[0] : "Correct option";
    const options = [
      correctOption,
      "Alternative option 1",
      "Alternative option 2",
      "Alternative option 3"
    ];
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    // Find the new index of the correct answer
    const correctAnswer = options.findIndex(option => option === correctOption);

    res.status(200).json({
      question,
      options,
      correctAnswer: correctAnswer >= 0 ? correctAnswer : 0
    });
  } catch (error) {
    console.error('Error in generate-mcq:', error);
    res.status(500).json({ error: 'Failed to generate MCQ' });
  }
}
