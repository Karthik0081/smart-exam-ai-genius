
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData, Exam, Submission } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { CheckCircle, XCircle, Clock, Award, AlertTriangle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StudentResultsProps {
  exam: Exam;
  submission: Submission;
}

export default function StudentResults({ exam, submission }: StudentResultsProps) {
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [timePerQuestion, setTimePerQuestion] = useState(0);
  const [pieChartData, setPieChartData] = useState<{ name: string; value: number }[]>([]);
  const [questionTypeData, setQuestionTypeData] = useState<{ name: string; correct: number; incorrect: number }[]>([]);
  
  const COLORS = ['#4ade80', '#f87171'];
  
  useEffect(() => {
    // Calculate correct and incorrect answers
    let correct = 0;
    let incorrect = 0;
    
    const mcqCorrect = { correct: 0, incorrect: 0 };
    const fillBlankCorrect = { correct: 0, incorrect: 0 };
    
    exam.questions.forEach((question, index) => {
      if (submission.answers[index] === question.correctAnswer) {
        correct++;
        if (question.type === 'mcq') {
          mcqCorrect.correct++;
        } else {
          fillBlankCorrect.correct++;
        }
      } else {
        incorrect++;
        if (question.type === 'mcq') {
          mcqCorrect.incorrect++;
        } else {
          fillBlankCorrect.incorrect++;
        }
      }
    });
    
    setCorrectAnswers(correct);
    setIncorrectAnswers(incorrect);
    
    // Set chart data
    setPieChartData([
      { name: 'Correct', value: correct },
      { name: 'Incorrect', value: incorrect }
    ]);
    
    // Set question type data
    const typeData = [];
    if (mcqCorrect.correct > 0 || mcqCorrect.incorrect > 0) {
      typeData.push({
        name: 'Multiple Choice',
        correct: mcqCorrect.correct,
        incorrect: mcqCorrect.incorrect
      });
    }
    
    if (fillBlankCorrect.correct > 0 || fillBlankCorrect.incorrect > 0) {
      typeData.push({
        name: 'Fill in the Blank',
        correct: fillBlankCorrect.correct,
        incorrect: fillBlankCorrect.incorrect
      });
    }
    
    setQuestionTypeData(typeData);
    
    // Calculate average time per question based on exam duration
    const totalTimeInSeconds = exam.duration * 60;
    const avgTimePerQuestion = totalTimeInSeconds / exam.questions.length;
    setTimePerQuestion(avgTimePerQuestion);
  }, [exam, submission]);
  
  // Chart data
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Determine performance level
  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { text: 'Excellent', color: 'bg-green-500' };
    if (score >= 75) return { text: 'Good', color: 'bg-blue-500' };
    if (score >= 60) return { text: 'Satisfactory', color: 'bg-yellow-500' };
    if (score >= 40) return { text: 'Needs Improvement', color: 'bg-orange-500' };
    return { text: 'Unsatisfactory', color: 'bg-red-500' };
  };
  
  const performanceLevel = getPerformanceLevel(submission.score);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Exam Results: {exam.title}</CardTitle>
              <CardDescription>
                Submitted on {formatDate(submission.submittedAt)}
              </CardDescription>
            </div>
            <Badge className={`${performanceLevel.color} px-3 py-1 text-white`}>
              <Award className="mr-1 h-4 w-4" />
              {performanceLevel.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col justify-center items-center text-center">
              <div className="text-5xl font-bold mb-2">{Math.round(submission.score)}%</div>
              <p className="text-gray-500">Your Score</p>
              <div className="w-full mt-4">
                <Progress value={submission.score} className="h-3" />
              </div>
              <div className="mt-4 flex flex-col gap-2 text-sm w-full">
                <div className="flex justify-between">
                  <span className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Correct Answers:
                  </span>
                  <span className="font-medium">{correctAnswers} of {exam.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center">
                    <XCircle className="h-4 w-4 text-red-500 mr-1" /> Incorrect Answers:
                  </span>
                  <span className="font-medium">{incorrectAnswers} of {exam.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 text-blue-500 mr-1" /> Time Per Question:
                  </span>
                  <span className="font-medium">{formatTime(timePerQuestion)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center">
                    <FileText className="h-4 w-4 text-purple-500 mr-1" /> Total Questions:
                  </span>
                  <span className="font-medium">{exam.questions.length}</span>
                </div>
              </div>
            </div>
            
            <div className="h-64">
              <p className="text-center font-medium mb-2">Performance Summary</p>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {questionTypeData.length > 1 && (
            <div className="mt-8">
              <p className="text-center font-medium mb-4">Performance by Question Type</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={questionTypeData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar name="Correct" dataKey="correct" fill="#4ade80" />
                    <Bar name="Incorrect" dataKey="incorrect" fill="#f87171" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Question Analysis</CardTitle>
          <CardDescription>Detailed breakdown of your answers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exam.questions.map((question, qIndex) => {
              const isCorrect = submission.answers[qIndex] === question.correctAnswer;
              const selectedAnswer = submission.answers[qIndex];
              
              return (
                <div
                  key={qIndex}
                  className={`p-4 rounded-md ${
                    isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Question {qIndex + 1}:</span>
                        <Badge variant="outline">
                          {question.type === 'mcq' ? 'Multiple Choice' : 'Fill in the Blank'}
                        </Badge>
                      </div>
                      <p className="mt-1">{question.text}</p>
                      
                      <div className="mt-3 space-y-1">
                        {question.options.map((option, oIndex) => (
                          <div
                            key={oIndex}
                            className={`px-3 py-2 rounded ${
                              oIndex === question.correctAnswer
                                ? 'bg-green-100 border-l-4 border-green-500'
                                : oIndex === selectedAnswer && !isCorrect
                                ? 'bg-red-100 border-l-4 border-red-500'
                                : 'bg-gray-50'
                            }`}
                          >
                            <span className="inline-block w-6 font-medium">
                              {String.fromCharCode(65 + oIndex)}:
                            </span>
                            {option}
                            {oIndex === question.correctAnswer && (
                              <Badge className="ml-2 bg-green-500">Correct Answer</Badge>
                            )}
                            {oIndex === selectedAnswer && !isCorrect && (
                              <Badge className="ml-2 bg-red-500">Your Answer</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {!isCorrect && (
                        <div className="mt-3 p-2 bg-yellow-50 rounded-md flex items-center">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                          <p className="text-sm text-yellow-700">
                            You selected "{String.fromCharCode(65 + selectedAnswer)}" but the correct answer was "{String.fromCharCode(65 + question.correctAnswer)}".
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
