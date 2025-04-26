
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function FileUpload({ file, onFileChange }: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        onFileChange(file);
        toast.success(`File "${file.name}" selected`);
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
        />
      </div>
      {file && (
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
