import { useState } from 'react';
import { useData, Question, QuestionType } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Clock, Save, Loader2 } from 'lucide-react';
import QuestionEditor from './QuestionEditor';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import React from 'react';

export default function ExamCreator() {
  const { user } = useAuth();
  const { createExam, generateQuestionsFromPdf, extractTextFromPdf } = useData();
  
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(['mcq', 'fill-in-the-blank']);
  const [generationProgress, setGenerationProgress] = useState(0);

  const mcqPrompt = (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded mb-4 text-blue-800">
      <strong>How it works:</strong> When you upload a PDF and click "Generate Questions", the document will be analyzed by AI. Key topics will be extracted and a set of MCQs will be automatically generated. You can review and edit each question below before publishing. The generated questions will then be visible to students when this exam is created.
    </div>
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
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
    
    setIsGenerating(true);
    setGenerationProgress(10);

    try {
      setGenerationProgress(30);
      const pdfText = await extractTextFromPdf(file);

      setGenerationProgress(50);
      const topicsRes = await fetch("/api/extract-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pdfText, numTopics: numQuestions })
      });
      const topics = await topicsRes.json();

      setGenerationProgress(70);
      const questions = await Promise.all(topics.map((topic: any, i: number) =>
        fetch("/api/generate-mcq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic }),
        }).then(res => res.json())
      ));

      const generatedQuestions: Question[] = questions.map((mcq: any, idx: number) => ({
        id: `pdf-q-${Date.now()}-${idx}`,
        text: mcq.question || 'Auto-generated question',
        type: 'mcq' as QuestionType,
        options: Array.isArray(mcq.options) ? mcq.options : [],
        correctAnswer: (typeof mcq.correctAnswer === 'number') ? mcq.correctAnswer : 0,
      }));

      setGenerationProgress(100);
      setTimeout(() => {
        setQuestions(generatedQuestions);
        toast.success(`Generated ${generatedQuestions.length} questions`);
        setIsGenerating(false);
        setGenerationProgress(0);
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
          {mcqPrompt}

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
