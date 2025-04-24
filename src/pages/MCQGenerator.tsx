
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import MainHeader from "@/components/MainHeader";
import { generateQuestionsFromText } from "@/utils/mcqGenerator";

export default function MCQGenerator() {
  const [documentText, setDocumentText] = useState("");
  const [mcqs, setMcqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);

  const handleGenerate = async () => {
    if (documentText.trim().length < 100) {
      toast.error("Please provide more text for better question generation");
      return;
    }

    setLoading(true);
    
    try {
      const questions = await generateQuestionsFromText(documentText, numQuestions);
      setMcqs(questions);
      toast.success(`Generated ${questions.length} questions`);
    } catch (error) {
      console.error('Error generating MCQs:', error);
      toast.error('Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainHeader />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>MCQ Generator from Text</CardTitle>
            <CardDescription>
              Paste document text and generate AI-powered multiple choice questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numQuestions">Number of Questions</Label>
              <Input 
                id="numQuestions"
                type="number"
                min="1"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Math.min(Math.max(1, parseInt(e.target.value) || 1), 20))}
                className="max-w-xs"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documentText">Document Text</Label>
              <Textarea
                id="documentText"
                placeholder="Paste your document text here..."
                rows={10}
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                className="font-mono"
              />
            </div>
            
            <Button 
              onClick={handleGenerate} 
              disabled={loading || documentText.trim().length < 100}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} /> 
                  Generating...
                </>
              ) : (
                "Generate MCQs"
              )}
            </Button>
          </CardContent>
        </Card>

        {mcqs.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Generated Questions ({mcqs.length})</h2>
            
            {mcqs.map((mcq, idx) => (
              <Card key={idx} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Question {idx + 1}</h3>
                    <p className="text-gray-800">{mcq.text}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-600">Options:</h4>
                    {mcq.options.map((option: string, optIdx: number) => (
                      <div 
                        key={optIdx}
                        className={`p-3 rounded-md ${mcq.correctAnswer === optIdx ? 'bg-green-100 border border-green-300' : 'bg-gray-50 border border-gray-200'}`}
                      >
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm font-medium ${mcq.correctAnswer === optIdx ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <div>{option}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <footer className="bg-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} SmartEx. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
