
import { toast } from '@/components/ui/sonner';

// Define types for topics and clusters
export type Topic = {
  title: string;
  keywords: string[];
  context: string;
  sentences: string[];
};

export async function extractTextFromPdf(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        if (!event.target?.result) {
          reject(new Error("Failed to read file"));
          return;
        }
        
        // In a real implementation, we would use pdf.js to extract text
        // For now, we'll simulate text extraction with a delayed response
        // to mimic the behavior of the Python implementation
        
        setTimeout(() => {
          // Mock extracted text
          const mockPdfContent = `
            Learning Document: Advanced Machine Learning Concepts
            
            Section 1: Introduction to Neural Networks
            Neural networks are computing systems inspired by the biological neural networks of animal brains. 
            The neural network itself consists of connected units or nodes called artificial neurons, 
            which loosely model the neurons in a biological brain. Each connection, like the synapses in a 
            biological brain, can transmit a signal to other neurons.
            
            Section 2: Clustering Algorithms
            Clustering is the task of dividing data points into groups, called clusters, based on their similarity.
            K-means clustering is one of the simplest and most popular unsupervised machine learning algorithms.
            The objective is to find groups in the data, with the number of groups represented by the variable K.
            
            Section 3: Natural Language Processing
            Natural Language Processing (NLP) is a field of artificial intelligence that gives computers the ability 
            to understand text and spoken words in much the same way humans can. NLP combines computational 
            linguistics—rule-based modeling of human language—with statistical, machine learning, 
            and deep learning models.
            
            Section 4: Computer Vision
            Computer vision is a field of artificial intelligence that enables computers to derive meaningful 
            information from digital images, videos and other visual inputs. If artificial intelligence enables 
            computers to think, computer vision enables them to see, observe and understand.
            
            Section 5: Reinforcement Learning
            Reinforcement learning is an area of machine learning concerned with how intelligent agents ought to 
            take actions in an environment in order to maximize the notion of cumulative reward. 
            Reinforcement learning is one of three basic machine learning paradigms, alongside supervised 
            learning and unsupervised learning.
          `;
          
          resolve(mockPdfContent);
        }, 1500);
      } catch (error) {
        console.error("Error extracting text from PDF:", error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Advanced text processing utilities
function preprocessText(text: string): string[] {
  return text
    .replace(/\n+/g, ' ')
    .replace(/[^\w\s.?!]/g, ' ')
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);
}

function extractSections(text: string): { title: string, content: string }[] {
  // Match section headers and content
  const sectionPattern = /Section \d+:([^\n]+)\n([\s\S]*?)(?=Section \d+:|$)/g;
  const sections: { title: string, content: string }[] = [];
  
  let match;
  while ((match = sectionPattern.exec(text)) !== null) {
    sections.push({
      title: match[1].trim(),
      content: match[2].trim()
    });
  }
  
  return sections;
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - use nouns and technical terms
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const stopWords = new Set(['this', 'that', 'then', 'than', 'with', 'from', 'there', 'these', 'those', 'have', 'been']);
  
  const frequencyMap: Record<string, number> = {};
  words.forEach(word => {
    if (!stopWords.has(word)) {
      frequencyMap[word] = (frequencyMap[word] || 0) + 1;
    }
  });
  
  // Sort by frequency and return top terms
  return Object.entries(frequencyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(entry => entry[0]);
}

// Extract key topics from text
export async function extractKeyTopics(text: string, numTopics = 5): Promise<Topic[]> {
  try {
    // Extract sections from the document
    const sections = extractSections(text);
    const topics: Topic[] = [];
    
    // Process each section to create topics
    for (const section of sections.slice(0, numTopics)) {
      const sentences = preprocessText(section.content);
      const keywords = extractKeywords(section.content);
      
      topics.push({
        title: section.title,
        keywords: keywords.slice(0, 5),
        context: section.content.substring(0, 200) + '...',
        sentences: sentences.slice(0, 3)
      });
    }
    
    return topics;
  } catch (error) {
    console.error("Error extracting topics:", error);
    return [];
  }
}

// Generate MCQ questions from topics
export async function generateQuestionsFromTopics(
  topics: Topic[], 
  questionTypes: string[],
  numQuestions: number
): Promise<any[]> {
  try {
    // In a real implementation, this would use OpenAI API or another AI service
    // Here we'll create more sophisticated questions based on the topics
    const questions: any[] = [];
    
    for (let i = 0; i < numQuestions; i++) {
      const topicIndex = i % topics.length;
      const topic = topics[topicIndex];
      const type = questionTypes[i % questionTypes.length];
      const id = `gen-${Date.now()}-${i}`;
      
      if (type === 'mcq') {
        // Create MCQs based on topic information
        const question = {
          id,
          text: `Which concept is most closely related to ${topic.title}?`,
          type: 'mcq',
          options: [
            topic.keywords[0] || 'Primary concept',
            topic.keywords[1] || 'Related concept',
            topic.keywords[2] || 'Unrelated concept',
            topic.keywords[3] || 'Incorrect concept'
          ],
          correctAnswer: 0 // First option is correct
        };
        
        questions.push(question);
      } else {
        // Create fill-in-the-blank questions
        if (topic.sentences.length > 0) {
          const sentence = topic.sentences[0];
          const keyTerm = topic.keywords[0];
          
          // Check if key term exists in the sentence
          if (sentence.toLowerCase().includes(keyTerm)) {
            const blankSentence = sentence.replace(new RegExp(keyTerm, 'i'), '__________');
            
            const question = {
              id,
              text: blankSentence,
              type: 'fill-in-the-blank',
              options: [
                keyTerm,
                topic.keywords[1] || 'Incorrect term 1',
                topic.keywords[2] || 'Incorrect term 2',
                topic.keywords[3] || 'Incorrect term 3'
              ],
              correctAnswer: 0 // First option is correct
            };
            
            questions.push(question);
          } else {
            // Fallback if key term not found in sentence
            const words = sentence.split(/\s+/);
            const significantWords = words.filter(word => word.length > 5);
            const wordToBlank = significantWords[0] || words[Math.floor(words.length / 2)];
            
            const blankSentence = sentence.replace(wordToBlank, '__________');
            
            const question = {
              id,
              text: blankSentence,
              type: 'fill-in-the-blank',
              options: [
                wordToBlank,
                topic.keywords[0] || 'Incorrect term 1',
                topic.keywords[1] || 'Incorrect term 2',
                topic.keywords[2] || 'Incorrect term 3'
              ],
              correctAnswer: 0 // First option is correct
            };
            
            questions.push(question);
          }
        }
      }
    }
    
    return questions;
  } catch (error) {
    console.error("Error generating questions:", error);
    return [];
  }
}
