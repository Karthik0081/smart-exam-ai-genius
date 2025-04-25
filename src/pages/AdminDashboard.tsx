
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MainHeader from '@/components/MainHeader';
import ExamList from '@/components/admin/ExamList';
import TopStudents from '@/components/admin/TopStudents';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, ListChecks, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("exams");
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainHeader />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">
              Create and manage your exams
            </p>
          </div>
          <Button onClick={() => navigate('/admin/create-exam')}>
            <PlusCircle size={18} className="mr-2" /> Create New Exam
          </Button>
        </div>
        
        <div className="space-y-6">
          <Tabs defaultValue="exams" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="exams" className="flex items-center">
                <ListChecks size={16} className="mr-2" />
                Exams
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center">
                <Trophy size={16} className="mr-2" />
                Top Students
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="exams">
              <ExamList />
            </TabsContent>
            
            <TabsContent value="students">
              <TopStudents />
            </TabsContent>
          </Tabs>
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
