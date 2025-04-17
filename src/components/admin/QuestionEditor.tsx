
import { useState } from 'react';
import { Question } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';

type QuestionEditorProps = {
  question: Question;
  index: number;
  onChange: (question: Question) => void;
};

export default function QuestionEditor({ question, index, onChange }: QuestionEditorProps) {
  const [questionText, setQuestionText] = useState(question.text);
  const [options, setOptions] = useState(question.options);
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer);
  
  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestionText(e.target.value);
    onChange({
      ...question,
      text: e.target.value,
    });
  };
  
  const handleOptionChange = (optionIndex: number, value: string) => {
    const newOptions = [...options];
    newOptions[optionIndex] = value;
    setOptions(newOptions);
    onChange({
      ...question,
      options: newOptions,
    });
  };
  
  const handleCorrectAnswerChange = (value: string) => {
    const index = parseInt(value);
    setCorrectAnswer(index);
    onChange({
      ...question,
      correctAnswer: index,
    });
  };
  
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`question-${index}`}>Question {index + 1}</Label>
          <Input
            id={`question-${index}`}
            value={questionText}
            onChange={handleQuestionTextChange}
            placeholder="Enter question"
          />
        </div>
        
        <div className="space-y-4">
          <Label>Options</Label>
          {options.map((option, optIndex) => (
            <div key={optIndex} className="flex items-center space-x-2">
              <Label className="w-20">Option {String.fromCharCode(65 + optIndex)}</Label>
              <Input
                value={option}
                onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
              />
            </div>
          ))}
        </div>
        
        <div className="space-y-2">
          <Label>Correct Answer</Label>
          <RadioGroup 
            value={correctAnswer.toString()} 
            onValueChange={handleCorrectAnswerChange}
            className="grid grid-cols-2 gap-2"
          >
            {options.map((_, optIndex) => (
              <div key={optIndex} className="flex items-center space-x-2">
                <RadioGroupItem value={optIndex.toString()} id={`option-${index}-${optIndex}`} />
                <Label htmlFor={`option-${index}-${optIndex}`}>Option {String.fromCharCode(65 + optIndex)}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
