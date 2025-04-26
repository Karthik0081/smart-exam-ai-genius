
import { Question } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface GeneratedQuestionsProps {
  questions: Question[];
  onUpdateQuestion: (index: number, updatedQuestion: Question) => void;
}

export function GeneratedQuestions({ questions, onUpdateQuestion }: GeneratedQuestionsProps) {
  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <Card key={question.id}>
          <CardContent className="pt-4">
            <div className="mb-2">
              <Label>Question {index + 1}</Label>
              <Textarea
                value={question.text}
                onChange={(e) => onUpdateQuestion(index, { ...question, text: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="space-y-2">
              <Label>Options</Label>
              <RadioGroup value={question.correctAnswer.toString()}>
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2">
                    <RadioGroupItem value={optIndex.toString()} id={`q-${index}-opt-${optIndex}`} />
                    <Label htmlFor={`q-${index}-opt-${optIndex}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
