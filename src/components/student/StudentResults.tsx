
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Exam, Submission } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, PieChart, Clock, Award, Target } from 'lucide-react';
import { ChartContainer } from '../ui/chart';
import { PieChart as RechartsPlot, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface StudentResultsProps {
  exam: Exam;
  submission: Submission;
}

export default function StudentResults({ exam, submission }: StudentResultsProps) {
  const navigate = useNavigate();
  
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
  
  const getPerformanceText = () => {
    if (submission.score >= 80) return 'Excellent! You have mastered this subject.';
    if (submission.score >= 60) return 'Good job! You have a solid understanding of the material.';
    if (submission.score >= 40) return 'Fair. Some concepts need more review.';
    return 'Needs improvement. Consider studying the material again.';
  };
  
  const correctAnswers = submission.answers.filter(
    (answer, index) => answer === exam.questions[index].correctAnswer
  ).length;
  
  const incorrectAnswers = exam.questions.length - correctAnswers;
  
  // Categorized questions data
  const [timePerQuestion, setTimePerQuestion] = useState<number>(0);
  
  useEffect(() => {
    // Calculate average time per question based on exam duration
    const totalTimeInSeconds = exam.duration * 60;
    const avgTimePerQuestion = totalTimeInSeconds / exam.questions.length;
    setTimePerQuestion(avgTimePerQuestion);
  }, [exam]);
  
  // Chart data
  const scoreData = [
    { name: 'Correct', value: correctAnswers, color: '#4ade80' },
    { name: 'Incorrect', value: incorrectAnswers, color: '#f87171' },
  ];
  
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
              <p className="mt-3 font-medium">{getPerformanceText()}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Award className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <h3 className="font-medium">Score</h3>
                    <p className={`text-2xl font-bold ${getScoreColor()}`}>{submission.score.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <h3 className="font-medium">Accuracy</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {((correctAnswers / exam.questions.length) * 100).toFixed(1)}%
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <h3 className="font-medium">Avg. Time per Question</h3>
                    <p className="text-2xl font-bold text-orange-600">{timePerQuestion.toFixed(0)}s</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Score Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPlot>
                      <Pie
                        data={scoreData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {scoreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPlot>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Correct Answers</span>
                      <span className="text-sm font-medium text-green-600">{correctAnswers} / {exam.questions.length}</span>
                    </div>
                    <Progress value={(correctAnswers / exam.questions.length) * 100} className="h-2 bg-gray-100" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Incorrect Answers</span>
                      <span className="text-sm font-medium text-red-600">{incorrectAnswers} / {exam.questions.length}</span>
                    </div>
                    <Progress value={(incorrectAnswers / exam.questions.length) * 100} className="h-2 bg-gray-100" />
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="font-medium mb-2">Improvement Areas:</h4>
                    <ul className="space-y-1 text-sm">
                      {incorrectAnswers > 0 ? (
                        <li className="flex items-start">
                          <AlertCircle className="h-4 w-4 mr-1 text-yellow-500 mt-0.5" />
                          <span>Review the incorrect answers below to strengthen your understanding.</span>
                        </li>
                      ) : (
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 mr-1 text-green-500 mt-0.5" />
                          <span>Perfect score! No improvement needed.</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
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
