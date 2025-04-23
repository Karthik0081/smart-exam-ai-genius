
import { useState } from 'react';
import { useData, Question, QuestionType } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Clock, Save } from 'lucide-react';
import QuestionEditor from './QuestionEditor';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

export default function ExamCreator() {
  const { user } = useAuth();
  const { createExam, generateQuestionsFromPdf } = useData();
  
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(['mcq', 'fill-in-the-blank']);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Check if file is a PDF
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setFile(file);
        toast.success(`File "${file.name}" selected`);
      } else {
        toast.error('Please upload a PDF file');
        e.target.value = '';
      }
    }
  };
  
  const handleToggleQuestionType = (type: QuestionType) => {
    setQuestionTypes(current => {
      if (current.includes(type)) {
        // Don't allow removing the last question type
        if (current.length === 1) {
          return current;
        }
        return current.filter(t => t !== type);
      } else {
        return [...current, type];
      }
    });
  };
  
  const handleGenerateQuestions = async () => {
    if (!file) {
      toast.error('Please upload a PDF file first');
      return;
    }
    
    try {
      setIsGenerating(true);
      setGenerationProgress(10);
      
      // Simulate a phased process for better UX feedback
      setTimeout(() => setGenerationProgress(30), 500);
      setTimeout(() => setGenerationProgress(50), 1000);
      
      const generatedQuestions = await generateQuestionsFromPdf(file, numQuestions, questionTypes);
      
      setGenerationProgress(90);
      setTimeout(() => {
        setQuestions(generatedQuestions);
        setGenerationProgress(100);
        toast.success(`Generated ${generatedQuestions.length} questions`);
        setIsGenerating(false);
      }, 500);
      
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate questions');
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
          <CardDescription>Upload a PDF and generate AI-powered questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          
          <div className="space-y-2">
            <Label htmlFor="file">Upload Study Material (PDF)</Label>
            <div className="flex space-x-2">
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="flex-1"
              />
            </div>
            {file && (
              <div className="flex items-center">
                <div className="text-sm text-gray-500 flex-1">Selected: {file.name}</div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    toast.info("File selection cleared");
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Question Types</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mcq-type" 
                  checked={questionTypes.includes('mcq')}
                  onCheckedChange={() => handleToggleQuestionType('mcq')}
                />
                <Label htmlFor="mcq-type">Multiple Choice Questions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="fitb-type" 
                  checked={questionTypes.includes('fill-in-the-blank')}
                  onCheckedChange={() => handleToggleQuestionType('fill-in-the-blank')}
                />
                <Label htmlFor="fitb-type">Fill in the Blanks</Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="numQuestions">Number of Questions to Generate</Label>
            <div className="flex space-x-2">
              <Input
                id="numQuestions"
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                min="1"
                max="20"
                className="flex-1"
              />
              <Button 
                onClick={handleGenerateQuestions} 
                disabled={!file || isGenerating}
                className="flex items-center"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
                  {generationProgress < 30 && "Analyzing PDF content..."}
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
          <CardContent className="space-y-6">
            {questions.map((question, index) => (
              <QuestionEditor
                key={question.id}
                question={question}
                index={index}
                onChange={(updatedQuestion) => handleUpdateQuestion(index, updatedQuestion)}
              />
            ))}
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
