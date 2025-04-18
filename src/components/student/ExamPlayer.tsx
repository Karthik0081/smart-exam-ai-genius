
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, Exam, Question } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';
import { ArrowLeft, ArrowRight, Save, Clock, Volume2, VolumeX, AlertTriangle, Mic, MicOff } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface ExamPlayerProps {
  exam: Exam;
}

export default function ExamPlayer({ exam }: ExamPlayerProps) {
  const { submitExam } = useData();
  const { user } = useAuth();
  const { speak, stopSpeaking, isSpeaking } = useAudio();
  const navigate = useNavigate();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(exam ? exam.duration * 60 : 0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Initialize Web Speech API
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  
  // Initialize selected answers and flagged questions arrays
  useEffect(() => {
    if (exam) {
      setSelectedAnswers(new Array(exam.questions.length).fill(-1));
      setFlaggedQuestions(new Array(exam.questions.length).fill(false));
      setTimeRemaining(exam.duration * 60);
    }
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setTranscript(transcript);
        processVoiceCommand(transcript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognition);
    }
  }, [exam]);
  
  // Process voice commands
  const processVoiceCommand = (command: string) => {
    if (!currentQuestion) return;
    
    // Check if the command is to select an option
    if (/select option [a-d]/.test(command) || /choose [a-d]/.test(command)) {
      const optionMatch = command.match(/[a-d]$/);
      if (optionMatch) {
        const optionChar = optionMatch[0];
        const optionIndex = optionChar.charCodeAt(0) - 'a'.charCodeAt(0);
        if (optionIndex >= 0 && optionIndex < currentQuestion.options.length) {
          handleAnswerSelect(optionIndex.toString());
          speak(`Selected option ${optionChar.toUpperCase()}`);
        }
      }
    }
    // Navigation commands
    else if (command.includes('next question')) {
      handleNext();
    }
    else if (command.includes('previous question')) {
      handlePrevious();
    }
    else if (command.includes('submit exam')) {
      handleSubmitExam();
    }
    // Help command
    else if (command.includes('help') || command.includes('what can i say')) {
      const helpText = "You can say: 'select option A', 'next question', 'previous question', 'read question', or 'submit exam'";
      speak(helpText);
    }
    // Read question command
    else if (command.includes('read question') || command.includes('read the question')) {
      handleReadQuestion();
    }
    else {
      speak("Sorry, I didn't understand that command. Try saying help for available commands.");
    }
  };
  
  // Toggle speech recognition
  const toggleListening = () => {
    if (!recognition) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      setTranscript('');
      recognition.start();
      setIsListening(true);
    }
  };
  
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
  
  // Safety check to ensure currentQuestion is defined before accessing it
  const currentQuestion = exam?.questions?.[currentQuestionIndex];
  const progress = exam?.questions ? (currentQuestionIndex / exam.questions.length) * 100 : 0;
  
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
    if (!user) {
      toast.error("User authentication error");
      return;
    }
    
    if (selectedAnswers.includes(-1)) {
      const unansweredCount = selectedAnswers.filter(a => a === -1).length;
      
      if (timeRemaining > 0) {
        // Only warn if time hasn't expired
        toast.warning(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`, {
          action: {
            label: "Submit Anyway",
            onClick: () => submitExamConfirmed()
          }
        });
        return;
      }
    }
    
    submitExamConfirmed();
  };
  
  const submitExamConfirmed = () => {
    if (!user) return;
    
    setIsSubmitting(true);
    stopSpeaking();
    
    // Submit exam
    submitExam(exam.id, user.id, selectedAnswers);
    
    // Redirect to results page
    navigate(`/student/results/${exam.id}`);
  };
  
  const handleReadQuestion = () => {
    if (!currentQuestion) return;
    
    if (isSpeaking) {
      stopSpeaking();
    } else {
      let textToRead = `Question ${currentQuestionIndex + 1}: ${currentQuestion.text}`;
      
      if (currentQuestion.type === 'mcq') {
        textToRead += `. Options: A: ${currentQuestion.options[0]}. B: ${currentQuestion.options[1]}. C: ${currentQuestion.options[2]}. D: ${currentQuestion.options[3]}`;
      } else if (currentQuestion.type === 'fill-in-the-blank') {
        textToRead += `. Fill in the blank with one of the following: A: ${currentQuestion.options[0]}. B: ${currentQuestion.options[1]}. C: ${currentQuestion.options[2]}. D: ${currentQuestion.options[3]}`;
      }
      
      speak(textToRead);
    }
  };
  
  const handleFlagQuestion = () => {
    const newFlagged = [...flaggedQuestions];
    newFlagged[currentQuestionIndex] = !newFlagged[currentQuestionIndex];
    setFlaggedQuestions(newFlagged);
  };
  
  // Safety check - if currentQuestion is undefined, show a loading or error state
  if (!currentQuestion) {
    return (
      <div className="space-y-6 text-center py-12">
        <p>Loading exam question...</p>
        <Button variant="outline" onClick={() => navigate('/student/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }
  
  // Format the question text for fill-in-the-blank type
  const formatQuestionText = (question: Question) => {
    if (question.type !== 'fill-in-the-blank') {
      return question.text;
    }
    
    const parts = question.text.split('__________');
    return (
      <>
        {parts[0]}
        <span className="px-2 py-1 mx-1 border-b-2 border-dashed border-gray-500 inline-block min-w-16 text-center">
          {selectedAnswers[currentQuestionIndex] >= 0 ? 
            question.options[selectedAnswers[currentQuestionIndex]] : 
            '________'}
        </span>
        {parts[1]}
      </>
    );
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
          <span className={`font-medium ${timeRemaining < 60 ? "text-red-600" : "text-yellow-600"}`}>
            Time Remaining: {formatTime(timeRemaining)}
          </span>
        </div>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <span>
                Question {currentQuestionIndex + 1} of {exam.questions.length}
                {currentQuestion.type === 'mcq' ? ' (Multiple Choice)' : ' (Fill in the Blank)'}
              </span>
              {flaggedQuestions[currentQuestionIndex] && (
                <AlertTriangle size={18} className="ml-2 text-yellow-500" />
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={flaggedQuestions[currentQuestionIndex] ? "default" : "outline"} 
                size="sm"
                onClick={handleFlagQuestion}
              >
                {flaggedQuestions[currentQuestionIndex] ? "Unflag" : "Flag for Review"}
              </Button>
              <Button variant="outline" size="icon" onClick={handleReadQuestion}>
                {isSpeaking ? <VolumeX /> : <Volume2 />}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleListening}
                className={isListening ? "bg-red-100" : ""}
              >
                {isListening ? <MicOff /> : <Mic />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-lg font-medium">
              {formatQuestionText(currentQuestion)}
            </p>
            
            {isListening && (
              <div className="p-2 bg-blue-50 rounded-md text-sm text-blue-800 animate-pulse">
                Listening... Say "help" for available commands
              </div>
            )}
            
            {transcript && (
              <div className="p-2 bg-gray-50 rounded-md text-sm text-gray-600">
                You said: "{transcript}"
              </div>
            )}
            
            <RadioGroup 
              value={selectedAnswers[currentQuestionIndex] !== undefined && selectedAnswers[currentQuestionIndex] >= 0 ? 
                selectedAnswers[currentQuestionIndex].toString() : undefined} 
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
          {exam.questions.map((_, index) => {
            let buttonVariant = "ghost";
            let buttonClass = "w-10 h-10 p-0";
            
            if (currentQuestionIndex === index) {
              buttonVariant = "default";
            } else if (flaggedQuestions[index]) {
              buttonVariant = "outline";
              buttonClass += " border-yellow-500 text-yellow-700";
            } else if (selectedAnswers[index] >= 0) {
              buttonVariant = "outline";
              buttonClass += " border-green-500 text-green-700";
            }
            
            return (
              <Button
                key={index}
                variant={buttonVariant as any}
                className={buttonClass}
                onClick={() => {
                  stopSpeaking();
                  setCurrentQuestionIndex(index);
                }}
              >
                {index + 1}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
