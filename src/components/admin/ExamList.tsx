
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ExamList() {
  const { exams, getSubmissionsByExam } = useData();
  const navigate = useNavigate();
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Exams</CardTitle>
        <CardDescription>Manage and review your created exams</CardDescription>
      </CardHeader>
      <CardContent>
        {exams.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No exams created yet.</p>
            <Button className="mt-4" onClick={() => navigate('/admin/create-exam')}>
              Create Your First Exam
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Title</TableHead>
                <TableHead>Created On</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => {
                const submissions = getSubmissionsByExam(exam.id);
                
                return (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell>{formatDate(exam.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        {exam.duration} min
                      </div>
                    </TableCell>
                    <TableCell>{exam.questions.length}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users size={16} className="mr-1" />
                        {submissions.length}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/admin/results/${exam.id}`)}
                      >
                        <Eye size={16} className="mr-1" /> View Results
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
