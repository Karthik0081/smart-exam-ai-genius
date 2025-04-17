
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData, Question } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';
import { ArrowLeft, ArrowRight, Save, Clock, Volume2, VolumeX } from 'lucide-react';

export default function ExamPlayer() {
  const { examId } = useParams<{ examId: string }>();
  const { getExamById, submitExam } = useData();
  const { user } = useAuth();
  const { speak, stopSpeaking, isSpeaking } = useAudio();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(examId ? getExamById(examId) : undefined);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(exam ? exam.duration * 60 : 0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize selected answers array
  useEffect(() => {
    if (exam) {
      setSelectedAnswers(new Array(exam.questions.length).fill(-1));
      setTimeRemaining(exam.duration * 60);
    }
  }, [exam]);
  
  // Timer countdown
  useEffect(() => {
    if (!timeRemaining) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time is up
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining]);
  
  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
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
  
  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / exam.questions.length) * 100;
  
  const handleAnswerSelect = (value: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = parseInt(value);
    setSelectedAnswers(newAnswers);
  };
  
  const handleNext = () => {
    stopSpeaking();
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    stopSpeaking();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleSubmitExam = () => {
    if (selectedAnswers.includes(-1)) {
      const unansweredCount = selectedAnswers.filter(a => a === -1).length;
      toast.warning(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`);
      return;
    }
    
    setIsSubmitting(true);
    stopSpeaking();
    
    // Submit exam
    submitExam(exam.id, user.id, selectedAnswers);
    
    // Redirect to results page
    navigate(`/student/results/${exam.id}`);
  };
  
  const handleReadQuestion = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const textToRead = `Question ${currentQuestionIndex + 1}: ${currentQuestion.text}. Options: A: ${currentQuestion.options[0]}. B: ${currentQuestion.options[1]}. C: ${currentQuestion.options[2]}. D: ${currentQuestion.options[3]}`;
      speak(textToRead);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <p className="text-gray-500">
            {exam.questions.length} questions | {exam.duration} minutes
          </p>
        </div>
        
        <div className="flex items-center px-4 py-2 bg-yellow-100 rounded-md">
          <Clock className="mr-2 text-yellow-600" />
          <span className="font-medium text-yellow-600">Time Remaining: {formatTime(timeRemaining)}</span>
        </div>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Question {currentQuestionIndex + 1} of {exam.questions.length}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={handleReadQuestion}>
              {isSpeaking ? <VolumeX /> : <Volume2 />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-lg font-medium">{currentQuestion.text}</p>
            
            <RadioGroup 
              value={selectedAnswers[currentQuestionIndex].toString()} 
              onValueChange={handleAnswerSelect}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                  <RadioGroupItem value={optIndex.toString()} id={`option-${optIndex}`} />
                  <Label htmlFor={`option-${optIndex}`} className="flex-1 cursor-pointer">
                    <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span> {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft size={16} className="mr-1" /> Previous
          </Button>
          
          <div className="flex space-x-2">
            {currentQuestionIndex === exam.questions.length - 1 ? (
              <Button 
                onClick={handleSubmitExam} 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : (
                  <>
                    <Save size={16} className="mr-1" /> Submit Exam
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next <ArrowRight size={16} className="ml-1" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      <div className="flex justify-center">
        <div className="flex flex-wrap justify-center gap-2 max-w-xl">
          {exam.questions.map((_, index) => (
            <Button
              key={index}
              variant={currentQuestionIndex === index ? "default" : selectedAnswers[index] >= 0 ? "outline" : "ghost"}
              className={`w-10 h-10 p-0 ${
                selectedAnswers[index] >= 0 ? "border-green-500 text-green-700" : ""
              }`}
              onClick={() => {
                stopSpeaking();
                setCurrentQuestionIndex(index);
              }}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
