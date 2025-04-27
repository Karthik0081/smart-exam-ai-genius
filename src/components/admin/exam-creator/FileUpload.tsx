
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Progress } from '@/components/ui/progress';
import { extractTextFromPdf } from '@/utils/pdfAnalyzer';
import { FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onTextExtracted: (text: string) => void;
  isProcessing: boolean;
  progress: number;
}

export function FileUpload({ 
  file, 
  onFileChange, 
  onTextExtracted,
  isProcessing,
  progress 
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  
  const processFile = async (selectedFile: File) => {
    try {
      const extractedText = await extractTextFromPdf(selectedFile);
      
      if (extractedText.length < 100) {
        throw new Error("Extracted text is too short. Please try a different PDF file.");
      }
      
      onTextExtracted(extractedText);
      setError(null);
      return true;
    } catch (error) {
      console.error('Error processing PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error processing PDF';
      toast.error(errorMessage);
      setError(errorMessage);
      return false;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
        onFileChange(selectedFile);
        toast.success(`File "${selectedFile.name}" selected`);
        
        try {
          await processFile(selectedFile);
        } catch (error) {
          onFileChange(null);
          e.target.value = '';
        }
      } else {
        toast.error('Please upload a PDF file');
        e.target.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="file" className="flex items-center gap-2">
        <FileText size={16} />
        Upload Study Material (PDF)
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">
                <AlertCircle size={16} className="text-muted-foreground" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Upload a PDF document containing the study material. The AI will analyze this content to generate questions.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Label>
      
      <div className="flex space-x-2">
        <Input
          id="file"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="flex-1"
          disabled={isProcessing}
        />
      </div>
      
      {isProcessing && (
        <div className="mt-2 space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 text-center">
            {progress < 30 && "Reading PDF content..."}
            {progress >= 30 && progress < 70 && "Extracting text..."}
            {progress >= 70 && "Processing complete..."}
          </p>
        </div>
      )}
      
      {error && !isProcessing && (
        <div className="mt-2 text-sm text-red-500 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      
      {file && !isProcessing && !error && (
        <div className="flex items-center">
          <div className="text-sm text-green-600 flex items-center gap-2 flex-1">
            <CheckCircle2 size={16} />
            PDF processed successfully: {file.name}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              onFileChange(null);
              toast.info("File selection cleared");
            }}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
