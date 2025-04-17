
import { useState } from 'react';
import { useData, Question } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Clock, Settings, Save } from 'lucide-react';
import QuestionEditor from './QuestionEditor';

export default function ExamCreator() {
  const { user } = useAuth();
  const { createExam, generateQuestionsFromPdf } = useData();
  
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Check if file is a PDF
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setFile(file);
      } else {
        toast.error('Please upload a PDF file');
        e.target.value = '';
      }
    }
  };
  
  const handleGenerateQuestions = async () => {
    if (!file) {
      toast.error('Please upload a PDF file first');
      return;
    }
    
    try {
      setIsGenerating(true);
      const generatedQuestions = await generateQuestionsFromPdf(file, numQuestions);
      setQuestions(generatedQuestions);
      toast.success(`Generated ${generatedQuestions.length} questions`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate questions');
    } finally {
      setIsGenerating(false);
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
          <CardDescription>Upload a PDF and generate questions or create them manually</CardDescription>
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
            {file && <p className="text-sm text-gray-500">Selected: {file.name}</p>}
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

