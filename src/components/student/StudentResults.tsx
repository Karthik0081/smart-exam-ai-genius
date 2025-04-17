
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData, Exam, Submission } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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
  
  if (!exam || !user) {
    return (
      <div className="text-center py-12">
        <p>Exam not found or user not authenticated.</p>
        <Button className="mt-4" onClick={() => navigate('/student/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  if (!submission) {
    return (
      <div className="text-center py-12">
        <p>You haven't completed this exam yet.</p>
        <Button className="mt-4" onClick={() => navigate(`/student/exam/${examId}`)}>
          Take Exam Now
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
  
  const getScoreColor = () => {
    if (submission.score >= 80) return 'text-green-600';
    if (submission.score >= 60) return 'text-yellow-600';
    if (submission.score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const getScoreBgColor = () => {
    if (submission.score >= 80) return 'bg-green-100';
    if (submission.score >= 60) return 'bg-yellow-100';
    if (submission.score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };
  
  const correctAnswers = submission.answers.filter(
    (answer, index) => answer === exam.questions[index].correctAnswer
  ).length;
  
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/student/dashboard')}>
        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>{exam.title} - Your Results</CardTitle>
            <CardDescription>
              Completed on {formatDate(submission.submittedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`p-6 rounded-lg ${getScoreBgColor()} text-center mb-6`}>
              <h2 className="text-2xl font-bold mb-2">Your Score</h2>
              <p className={`text-4xl font-bold ${getScoreColor()}`}>
                {submission.score.toFixed(1)}%
              </p>
              <p className="mt-2">
                {correctAnswers} out of {exam.questions.length} questions correct
              </p>
            </div>
            
            <h3 className="text-xl font-semibold mb-4">Question Review</h3>
            
            <div className="space-y-4">
              {exam.questions.map((question, index) => {
                const selectedAnswer = submission.answers[index];
                const isCorrect = selectedAnswer === question.correctAnswer;
                
                return (
                  <Card key={index} className={`border-l-4 ${
                    isCorrect ? 'border-l-green-500' : 'border-l-red-500'
                  }`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">Question {index + 1}</h4>
                          <p>{question.text}</p>
                        </div>
                        {isCorrect ? (
                          <CheckCircle className="text-green-500 h-6 w-6 flex-shrink-0" />
                        ) : (
                          <XCircle className="text-red-500 h-6 w-6 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        {question.options.map((option, optIndex) => {
                          const isSelected = optIndex === selectedAnswer;
                          const isCorrectOption = optIndex === question.correctAnswer;
                          
                          return (
                            <div 
                              key={optIndex} 
                              className={`p-3 rounded-md flex items-center ${
                                isSelected && isCorrect ? 'bg-green-100' :
                                isSelected && !isCorrect ? 'bg-red-100' :
                                isCorrectOption ? 'bg-green-50' : ''
                              }`}
                            >
                              <div className="mr-2">
                                {isCorrectOption && <CheckCircle className="text-green-500 h-4 w-4" />}
                                {isSelected && !isCorrect && <XCircle className="text-red-500 h-4 w-4" />}
                              </div>
                              <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span> 
                              <span>{option}</span>
                              {isSelected && (
                                <Badge className="ml-2" variant="outline">Your answer</Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
