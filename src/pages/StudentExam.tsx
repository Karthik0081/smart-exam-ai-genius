
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData, Exam } from '@/contexts/DataContext';
import MainHeader from '@/components/MainHeader';
import ExamPlayer from '@/components/student/ExamPlayer';

export default function StudentExam() {
  const { examId } = useParams<{ examId: string }>();
  const { user } = useAuth();
  const { getExamById, getStudentSubmissionForExam } = useData();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  
  useEffect(() => {
    if (examId && user) {
      const foundExam = getExamById(examId);
      if (foundExam) {
        setExam(foundExam);
        
        // Check if student has already submitted this exam
        const submission = getStudentSubmissionForExam(user.id, examId);
        if (submission) {
          setAlreadySubmitted(true);
          // Redirect to results page if already submitted
          navigate(`/student/results/${examId}`);
        }
      }
    }
  }, [examId, user, getExamById, getStudentSubmissionForExam, navigate]);
  
  if (!user) return null;
  
  if (alreadySubmitted) {
    return null; // Prevent flash of content before redirect
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainHeader />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        {exam && <ExamPlayer exam={exam} />}
        {!exam && (
          <div className="text-center py-12">
            <p>Exam not found. Please return to the dashboard.</p>
            <button 
              onClick={() => navigate('/student/dashboard')}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Go to Dashboard
            </button>
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
