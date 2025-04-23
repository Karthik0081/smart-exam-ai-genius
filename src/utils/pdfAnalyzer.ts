
import { toast } from '@/components/ui/sonner';

// Define types for topics and clusters
type Topic = {
  terms: string[];
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

// Simple TF-IDF implementation to extract important terms
function calculateTermFrequency(
  terms: string[], 
  allDocuments: string[][]
): {term: string, score: number}[] {
  // Calculate document frequency (how many documents contain each term)
  const documentFrequency: Record<string, number> = {};
  terms.forEach(term => {
    documentFrequency[term] = allDocuments.filter(doc => 
      doc.some(word => word.toLowerCase() === term.toLowerCase())
    ).length;
  });
  
  // Calculate TF-IDF scores
  return terms.map(term => {
    const termFrequency = terms.filter(t => t === term).length / terms.length;
    const inverseDocumentFrequency = Math.log(
      allDocuments.length / (1 + (documentFrequency[term] || 0))
    );
    return { 
      term, 
      score: termFrequency * inverseDocumentFrequency 
    };
  });
}

// Extract key topics from text
export async function extractKeyTopics(text: string, numTopics = 5): Promise<Topic[]> {
  try {
    // Split into sections and then sentences
    const sections = text.split(/Section \d+:/g).filter(Boolean);
    const allSentences: string[] = [];
    
    sections.forEach(section => {
      const sectionSentences = section
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);
      
      allSentences.push(...sectionSentences);
    });
    
    // Create document representation
    const documents = sections.map(section => {
      return section
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3);
    });
    
    // Extract all terms
    const allTerms = documents
      .flat()
      .filter(term => term.length > 3 && !["this", "that", "then", "than", "with", "from"].includes(term));
    
    // Calculate TF-IDF scores
    const scoredTerms = calculateTermFrequency(allTerms, documents);
    
    // Sort by score and group into clusters
    const sortedTerms = [...scoredTerms].sort((a, b) => b.score - a.score);
    const uniqueTerms = [...new Set(sortedTerms.map(item => item.term))];
    
    // Extract top terms for each topic
    const topics: Topic[] = [];
    for (let i = 0; i < Math.min(numTopics, sections.length); i++) {
      // Get section-specific terms
      const sectionTerms = documents[i].filter(term => 
        term.length > 3 && !["this", "that", "then", "than", "with", "from"].includes(term)
      );
      
      // Get unique terms for this section
      const uniqueSectionTerms = [...new Set(sectionTerms)];
      
      // Get top 5 terms
      const topTerms = uniqueSectionTerms.slice(0, 5);
      
      // Get relevant sentences that contain these terms
      const relevantSentences = allSentences.filter(sentence => 
        topTerms.some(term => sentence.toLowerCase().includes(term))
      );
      
      topics.push({
        terms: topTerms,
        sentences: relevantSentences.slice(0, 3) // Get up to 3 relevant sentences
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
    // In a real implementation, this would use OpenAI API
    // Here we'll simulate the question generation with better questions
    const questions: any[] = [];
    
    for (let i = 0; i < numQuestions; i++) {
      const topicIndex = i % topics.length;
      const topic = topics[topicIndex];
      const type = questionTypes[i % questionTypes.length];
      const id = `gen-${Date.now()}-${i}`;
      
      if (type === 'mcq') {
        // Create more sophisticated MCQs based on topic terms and sentences
        const keyTerm = topic.terms[0];
        const otherTerms = topic.terms.slice(1);
        
        const question = {
          id,
          text: `Which concept is most closely related to ${keyTerm}?`,
          type: 'mcq',
          options: [
            keyTerm,
            otherTerms[0] || 'Alternative concept',
            otherTerms[1] || 'Unrelated concept',
            otherTerms[2] || 'Incorrect concept'
          ],
          correctAnswer: 0 // First option is correct
        };
        
        questions.push(question);
      } else {
        // Create fill-in-the-blank questions
        if (topic.sentences.length > 0) {
          const sentence = topic.sentences[0];
          const keyTerm = topic.terms[0];
          
          // Check if key term exists in the sentence
          if (sentence.toLowerCase().includes(keyTerm.toLowerCase())) {
            const blankSentence = sentence.replace(new RegExp(keyTerm, 'i'), '__________');
            
            const question = {
              id,
              text: blankSentence,
              type: 'fill-in-the-blank',
              options: [
                keyTerm,
                topic.terms[1] || 'Incorrect term 1',
                topic.terms[2] || 'Incorrect term 2',
                topic.terms[3] || 'Incorrect term 3'
              ],
              correctAnswer: 0 // First option is correct
            };
            
            questions.push(question);
          } else {
            // Fallback if key term not found in sentence
            const words = sentence.split(/\s+/);
            const wordToBlank = words.find(word => word.length > 5) || words[Math.floor(words.length / 2)];
            
            const blankSentence = sentence.replace(wordToBlank, '__________');
            
            const question = {
              id,
              text: blankSentence,
              type: 'fill-in-the-blank',
              options: [
                wordToBlank,
                topic.terms[0] || 'Incorrect term 1',
                topic.terms[1] || 'Incorrect term 2',
                topic.terms[2] || 'Incorrect term 3'
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
