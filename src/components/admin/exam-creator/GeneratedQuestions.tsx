
import { Question } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';

interface GeneratedQuestionsProps {
  questions: Question[];
  onUpdateQuestion: (index: number, updatedQuestion: Question) => void;
  onDeleteQuestion?: (index: number) => void;
  onAddQuestion?: () => void;
}

export function GeneratedQuestions({ 
  questions, 
  onUpdateQuestion,
  onDeleteQuestion,
  onAddQuestion
}: GeneratedQuestionsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const handleEditToggle = (index: number) => {
    setEditingIndex(editingIndex === index ? null : index);
  };
  
  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const question = questions[questionIndex];
    const updatedOptions = [...question.options];
    updatedOptions[optionIndex] = value;
    
    onUpdateQuestion(questionIndex, {
      ...question,
      options: updatedOptions
    });
  };
  
  const handleCorrectAnswerChange = (questionIndex: number, value: string) => {
    const correctAnswerIndex = parseInt(value);
    if (isNaN(correctAnswerIndex)) return;
    
    onUpdateQuestion(questionIndex, {
      ...questions[questionIndex],
      correctAnswer: correctAnswerIndex
    });
  };
  
  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <Card key={question.id} className={editingIndex === index ? "border-primary" : ""}>
          <CardContent className="pt-4 space-y-4">
            <div className="flex justify-between items-start">
              <Label className="text-lg font-semibold">Question {index + 1}</Label>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEditToggle(index)}
                >
                  <Pencil size={16} className="mr-1" />
                  {editingIndex === index ? "Done" : "Edit"}
                </Button>
                {onDeleteQuestion && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this question?")) {
                        onDeleteQuestion(index);
                        toast.success("Question deleted");
                      }
                    }}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Question Text */}
            {editingIndex === index ? (
              <Textarea
                value={question.text}
                onChange={(e) => onUpdateQuestion(index, { ...question, text: e.target.value })}
                className="mt-1 min-h-24"
                placeholder="Enter question text..."
              />
            ) : (
              <p className="text-gray-800">{question.text}</p>
            )}
            
            {/* Options */}
            <div className="space-y-2">
              <Label>Options</Label>
              <RadioGroup 
                value={question.correctAnswer.toString()}
                onValueChange={(value) => handleCorrectAnswerChange(index, value)}
                className="space-y-2"
              >
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <RadioGroupItem value={optIndex.toString()} id={`q-${index}-opt-${optIndex}`} />
                    {editingIndex === index ? (
                      <Input 
                        value={option}
                        onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                        className="flex-1"
                      />
                    ) : (
                      <Label 
                        htmlFor={`q-${index}-opt-${optIndex}`}
                        className={question.correctAnswer === optIndex ? "font-bold" : ""}
                      >
                        {option}
                        {question.correctAnswer === optIndex && !editingIndex && (
                          <span className="ml-2 text-green-500 text-sm">(Correct Answer)</span>
                        )}
                      </Label>
                    )}
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {questions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No questions generated yet. Click "Generate Questions" to create questions based on the uploaded PDF.</p>
        </div>
      )}
      
      {onAddQuestion && (
        <Button 
          variant="outline" 
          className="w-full mt-4" 
          onClick={onAddQuestion}
        >
          <Plus size={16} className="mr-2" />
          Add Custom Question
        </Button>
      )}
    </div>
  );
}
