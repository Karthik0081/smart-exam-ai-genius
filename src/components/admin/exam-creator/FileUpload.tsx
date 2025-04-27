
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Progress } from '@/components/ui/progress';
import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

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
  const extractTextFromPDF = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let extractedText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ');
        extractedText += pageText + '\n';
      }
      
      onTextExtracted(extractedText);
      return extractedText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      toast.error('Failed to extract text from PDF');
      throw error;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
        onFileChange(selectedFile);
        toast.success(`File "${selectedFile.name}" selected`);
        try {
          await extractTextFromPDF(selectedFile);
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
      <Label htmlFor="file">Upload Study Material (PDF)</Label>
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
            Processing PDF...
          </p>
        </div>
      )}
      
      {file && !isProcessing && (
        <div className="flex items-center">
          <div className="text-sm text-gray-500 flex-1">Selected: {file.name}</div>
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
