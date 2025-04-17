
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AvailableExams() {
  const { user } = useAuth();
  const { exams, getStudentSubmissionForExam } = useData();
  const navigate = useNavigate();
  
  if (!user) return null;
  
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
        <CardTitle>Available Exams</CardTitle>
        <CardDescription>Complete these exams to test your knowledge</CardDescription>
      </CardHeader>
      <CardContent>
        {exams.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No exams available at the moment.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Title</TableHead>
                <TableHead>Created On</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => {
                const submission = getStudentSubmissionForExam(user.id, exam.id);
                const isCompleted = !!submission;
                
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
                      {isCompleted ? (
                        <Badge className="bg-green-500">
                          <Check size={14} className="mr-1" /> Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <AlertCircle size={14} className="mr-1" /> Not Attempted
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isCompleted ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/student/results/${exam.id}`)}
                        >
                          <FileText size={16} className="mr-1" /> View Results
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => navigate(`/student/exam/${exam.id}`)}
                        >
                          Start Exam
                        </Button>
                      )}
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
