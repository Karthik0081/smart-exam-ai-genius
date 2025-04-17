
import { useAuth } from '@/contexts/AuthContext';
import MainHeader from '@/components/MainHeader';
import StudentResultsComponent from '@/components/student/StudentResults';

export default function StudentResults() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainHeader />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <StudentResultsComponent />
      </div>
      
      <footer className="bg-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} SmartEx. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
