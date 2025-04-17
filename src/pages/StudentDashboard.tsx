
import { useAuth } from '@/contexts/AuthContext';
import MainHeader from '@/components/MainHeader';
import AvailableExams from '@/components/student/AvailableExams';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainHeader />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-gray-600">
            View and take available exams
          </p>
        </div>
        
        <div className="space-y-6">
          <AvailableExams />
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
