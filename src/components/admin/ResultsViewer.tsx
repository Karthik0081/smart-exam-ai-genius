
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData, Exam, Submission } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ResultsViewer() {
  const { examId } = useParams<{ examId: string }>();
  const { getExamById, getSubmissionsByExam } = useData();
  const [exam, setExam] = useState<Exam | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (examId) {
      const foundExam = getExamById(examId);
      if (foundExam) {
        setExam(foundExam);
        setSubmissions(getSubmissionsByExam(examId));
      }
    }
  }, [examId, getExamById, getSubmissionsByExam]);
  
  if (!exam) {
    return (
      <div className="text-center py-12">
        <p>Exam not found.</p>
        <Button className="mt-4" onClick={() => navigate('/admin/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Prepare data for chart
  const scoreRanges = [
    { range: '0-25%', count: 0 },
    { range: '26-50%', count: 0 },
    { range: '51-75%', count: 0 },
    { range: '76-100%', count: 0 },
  ];
  
  submissions.forEach(sub => {
    if (sub.score <= 25) scoreRanges[0].count++;
    else if (sub.score <= 50) scoreRanges[1].count++;
    else if (sub.score <= 75) scoreRanges[2].count++;
    else scoreRanges[3].count++;
  });
  
  const averageScore = submissions.length > 0 
    ? submissions.reduce((sum, sub) => sum + sub.score, 0) / submissions.length 
    : 0;
  
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>{exam.title} - Results</CardTitle>
          <CardDescription>
            Created on {formatDate(exam.createdAt)} | {exam.duration} minutes | {exam.questions.length} questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-smartex-blue" />
                  <h3 className="text-lg font-medium">Total Submissions</h3>
                  <p className="text-3xl font-bold">{submissions.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-smartex-blue" />
                  <h3 className="text-lg font-medium">Average Score</h3>
                  <p className="text-3xl font-bold">{averageScore.toFixed(1)}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {submissions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Score Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreRanges}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          <h3 className="text-lg font-medium mb-3">Submission Details</h3>
          {submissions.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No submissions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>Student ID: {submission.studentId}</TableCell>
                    <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                    <TableCell>
                      <Badge className={getScoreColor(submission.score)}>
                        {submission.score.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
