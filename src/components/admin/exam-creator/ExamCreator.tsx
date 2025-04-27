import { useState, useEffect } from 'react';
import { useData, Question, QuestionType } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Loader2, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAvailableProvider, generateQuestionsFromText, validatePdfText } from '@/utils/mcqGenerator';
import { hasApiKey } from '@/utils/apiConfig';
import { FileUpload } from './FileUpload';
import { QuestionTypeSelector } from './QuestionTypeSelector';
import { GeneratedQuestions } from './GeneratedQuestions';

export default function ExamCreator() {
  const { user } = useAuth();
  const { createExam, extractTextFromPdf } = useData();
  
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(['mcq', 'fill-in-the-blank']);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [pdfText, setPdfText] = useState('');
  const [aiProvider, setAiProvider] = useState<string>('auto');
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);

  // Check available AI providers
  useEffect(() => {
    const providers = [];
    if (hasApiKey('openai')) providers.push('openai');
    if (hasApiKey('gemini')) providers.push('gemini');
    setAvailableProviders(providers);
    
    // Set default provider if available
    if (providers.length > 0 && aiProvider === 'auto') {
      setAiProvider(providers[0]);
    }
  }, []);

  const [pdfText, setPdfText] = useState('');
  const [processingPdf, setProcessingPdf] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleGenerateQuestions = async () => {
    if (!pdfText) {
      toast.error('Please upload and process a PDF file first');
      return;
    }
    
    if (numQuestions < 1 || numQuestions > 20) {
      toast.error('Please select between 1 and 20 questions');
      return;
    }
    
    // Check if any AI provider is available
    const provider = getAvailableProvider();
    if (!provider) {
      toast.error('No AI provider is configured. Please set up either OpenAI or Gemini API key in the admin settings.');
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(10);

    try {
      setGenerationProgress(50);

      // Generate questions from the extracted text
      const generatedQuestions = await generateQuestionsFromText(pdfText, numQuestions);
      
      setGenerationProgress(100);
      
      // Check if we have valid questions
      if (generatedQuestions.length === 0) {
        throw new Error('No questions were generated');
      }
      
      setTimeout(() => {
        setQuestions(generatedQuestions);
        toast.success(`Generated ${generatedQuestions.length} questions`);
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 500);
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error(`Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };
  
  const handleCreateExam = () => {
    if (!title.trim()) {
      toast.error('Please enter an exam title');
      return;
    }
    
    if (duration < 5) {
      toast.error('Exam duration must be at least 5 minutes');
      return;
    }
    
    if (questions.length === 0) {
      toast.error('Please generate or add questions');
      return;
    }
    
    if (!user) {
      toast.error('You must be logged in to create an exam');
      return;
    }
    
    createExam({
      title,
      duration,
      questions,
      createdBy: user.id,
    });
    
    toast.success('Exam created successfully');
    
    // Reset form
    setTitle('');
    setDuration(30);
    setQuestions([]);
    setFile(null);
  };
  
  const handleUpdateQuestion = (index: number, updatedQuestion: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Exam</CardTitle>
          <CardDescription>Upload study material and generate AI-powered questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-100 border border-blue-400 rounded mb-4 text-blue-800">
            <strong>How it works:</strong> Upload a PDF document and specify the number of questions to generate. The AI will analyze the content and create multiple-choice questions based on the key topics.
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Exam Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter exam title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              min="5"
              max="180"
            />
          </div>
          
          <FileUpload 
            file={file} 
            onFileChange={setFile}
            onTextExtracted={(text) => {
              setPdfText(text);
              setProcessingPdf(false);
              toast.success('PDF processed successfully');
            }}
            isProcessing={processingPdf}
            progress={processingProgress}
          />
          
          {availableProviders.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="aiProvider">AI Provider</Label>
              <Select value={aiProvider} onValueChange={setAiProvider}>
                <SelectTrigger id="aiProvider" className="w-full md:w-[240px]">
                  <SelectValue placeholder="Select AI Provider" />
                </SelectTrigger>
                <SelectContent>
                  {hasApiKey('openai') && (
                    <SelectItem value="openai">OpenAI</SelectItem>
                  )}
                  {hasApiKey('gemini') && (
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {aiProvider === 'openai' 
                  ? 'Using OpenAI to generate questions' 
                  : aiProvider === 'gemini' 
                    ? 'Using Google Gemini to generate questions'
                    : 'Select an AI provider'}
              </p>
            </div>
          )}
          
          <QuestionTypeSelector 
            questionTypes={questionTypes}
            onToggleType={(type) => {
              setQuestionTypes(current => {
                if (current.includes(type)) {
                  if (current.length === 1) return current;
                  return current.filter(t => t !== type);
                }
                return [...current, type];
              });
            }}
          />
          
          <div className="space-y-2">
            <Label htmlFor="numQuestions">Number of Questions to Generate</Label>
            <div className="flex space-x-2">
              <Input
                id="numQuestions"
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Math.min(Math.max(1, parseInt(e.target.value) || 1), 20))}
                min="1"
                max="20"
                className="flex-1"
              />
              <Button 
                onClick={handleGenerateQuestions} 
                disabled={!pdfText || isGenerating || availableProviders.length === 0}
                className="flex items-center"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Upload size={18} className="mr-2" />
                    Generate Questions
                  </>
                )}
              </Button>
            </div>
            
            {isGenerating && (
              <div className="mt-2 space-y-1">
                <Progress value={generationProgress} className="h-2" />
                <p className="text-xs text-gray-500 text-center">
                  {generationProgress < 30 && "Analyzing content..."}
                  {generationProgress >= 30 && generationProgress < 60 && "Extracting key topics..."}
                  {generationProgress >= 60 && generationProgress < 90 && "Generating questions..."}
                  {generationProgress >= 90 && "Finalizing..."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions ({questions.length})</CardTitle>
            <CardDescription>Review and edit generated questions</CardDescription>
          </CardHeader>
          <CardContent>
            <GeneratedQuestions 
              questions={questions}
              onUpdateQuestion={handleUpdateQuestion}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateExam} className="w-full">
              <Save size={18} className="mr-2" /> Save Exam
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
