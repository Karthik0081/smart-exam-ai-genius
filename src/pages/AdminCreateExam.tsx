import { useAuth } from '@/contexts/AuthContext';
import MainHeader from '@/components/MainHeader';
import ExamCreator from '@/components/admin/exam-creator/ExamCreator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminCreateExam() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainHeader />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/admin/dashboard')} className="mb-6">
          <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create New Exam</h1>
          <p className="text-gray-600">
            Upload study material and generate AI-powered exam questions
          </p>
        </div>
        
        <div className="space-y-6">
          <ExamCreator />
        </div>
      </div>
      
      <footer className="bg-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} SmartEx. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
