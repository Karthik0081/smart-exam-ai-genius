
import { useState } from 'react';
import { Question, QuestionType } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface QuestionEditorProps {
  question: Question;
  index: number;
  onChange: (updatedQuestion: Question) => void;
}

export default function QuestionEditor({ question, index, onChange }: QuestionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Handle question text change
  const handleQuestionTextChange = (text: string) => {
    onChange({
      ...question,
      text
    });
  };
  
  // Handle question type change
  const handleQuestionTypeChange = (type: QuestionType) => {
    onChange({
      ...question,
      type
    });
  };
  
  // Handle option text change
  const handleOptionTextChange = (optionIndex: number, text: string) => {
    const newOptions = [...question.options];
    newOptions[optionIndex] = text;
    onChange({
      ...question,
      options: newOptions
    });
  };
  
  // Handle correct answer change
  const handleCorrectAnswerChange = (answerIndex: number) => {
    onChange({
      ...question,
      correctAnswer: answerIndex
    });
  };
  
  return (
    <Card className="border-2 border-gray-200">
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Question {index + 1}</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`question-text-${index}`}>Question</Label>
            <Textarea
              id={`question-text-${index}`}
              value={question.text}
              onChange={(e) => handleQuestionTextChange(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`question-type-${index}`}>Question Type</Label>
            <Select 
              value={question.type} 
              onValueChange={(value: QuestionType) => handleQuestionTypeChange(value)}
            >
              <SelectTrigger id={`question-type-${index}`}>
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">Multiple Choice Question</SelectItem>
                <SelectItem value="fill-in-the-blank">Fill in the Blank</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isExpanded && (
            <>
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="space-y-3">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <RadioGroup
                        value={question.correctAnswer.toString()}
                        onValueChange={(value) => handleCorrectAnswerChange(parseInt(value))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={optIndex.toString()} id={`option-${index}-${optIndex}`} />
                        </div>
                      </RadioGroup>
                      <Label htmlFor={`option-${index}-${optIndex}`} className="w-8">
                        {String.fromCharCode(65 + optIndex)}:
                      </Label>
                      <Input
                        value={option}
                        onChange={(e) => handleOptionTextChange(optIndex, e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  <p>* Select the radio button next to the correct answer</p>
                  {question.type === 'fill-in-the-blank' && (
                    <p>* For fill-in-the-blank questions, use underscores (_____) to indicate the blank in the question text</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
