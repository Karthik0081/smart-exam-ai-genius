
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { QuestionType } from '@/contexts/DataContext';

interface QuestionTypeSelectorProps {
  questionTypes: QuestionType[];
  onToggleType: (type: QuestionType) => void;
}

export function QuestionTypeSelector({ questionTypes, onToggleType }: QuestionTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Question Types</Label>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="mcq-type" 
            checked={questionTypes.includes('mcq')}
            onCheckedChange={() => onToggleType('mcq')}
          />
          <Label htmlFor="mcq-type">Multiple Choice Questions</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="fitb-type" 
            checked={questionTypes.includes('fill-in-the-blank')}
            onCheckedChange={() => onToggleType('fill-in-the-blank')}
          />
          <Label htmlFor="fitb-type">Fill in the Blanks</Label>
        </div>
      </div>
    </div>
  );
}
