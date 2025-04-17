
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData, Exam, Submission } from '@/contexts/DataContext';
import MainHeader from '@/components/MainHeader';
import StudentResultsComponent from '@/components/student/StudentResults';

export default function StudentResults() {
  const { examId } = useParams<{ examId: string }>();
  const { user } = useAuth();
  const { getExamById, getStudentSubmissionForExam } = useData();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  
  useEffect(() => {
    if (examId && user) {
      const foundExam = getExamById(examId);
      if (foundExam) {
        setExam(foundExam);
        const foundSubmission = getStudentSubmissionForExam(user.id, examId);
        if (foundSubmission) {
          setSubmission(foundSubmission);
        }
      }
    }
  }, [examId, user, getExamById, getStudentSubmissionForExam]);
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainHeader />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        {exam && submission ? (
          <StudentResultsComponent exam={exam} submission={submission} />
        ) : !exam ? (
          <div className="text-center py-12">
            <p>Exam not found. Please return to the dashboard.</p>
            <button 
              onClick={() => navigate('/student/dashboard')}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <p>You haven't completed this exam yet.</p>
            <button 
              onClick={() => navigate(`/student/exam/${examId}`)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Take Exam Now
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
