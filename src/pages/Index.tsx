import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-smartex-blue text-white">
        <div className="container mx-auto px-4 py-8 flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="/lovable-uploads/34537cd1-9844-4503-970c-e68b3fd548b6.png"
              alt="SmartEx Logo"
              className="h-12 mr-3 bg-white rounded shadow"
              style={{ objectFit: 'contain' }}
            />
            <h1 className="text-2xl font-bold">SmartEx</h1>
          </div>
          <Button 
            variant="outline" 
            className="text-white border-white hover:bg-white hover:text-smartex-blue"
            onClick={() => navigate('/login')}
          >
            Login / Register
          </Button>
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              AI-Powered Exam Platform for Modern Education
            </h1>
            <p className="mt-6 text-xl">
              SmartEx uses artificial intelligence to automatically generate and grade exams from your study materials, saving time and enhancing learning outcomes.
            </p>
            <div className="mt-8">
              <Button 
                size="lg" 
                className="bg-white text-smartex-blue hover:bg-gray-100"
                onClick={() => navigate('/login')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg shadow-sm text-center">
              <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                <FileText size={24} className="text-smartex-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">PDF Upload</h3>
              <p className="text-gray-600">
                Upload study materials in PDF format and let our AI analyze the content.
              </p>
            </div>
            
            <div className="p-6 border rounded-lg shadow-sm text-center">
              <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                <Brain size={24} className="text-smartex-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Question Generation</h3>
              <p className="text-gray-600">
                Automatically create relevant multiple-choice questions based on your content.
              </p>
            </div>
            
            <div className="p-6 border rounded-lg shadow-sm text-center">
              <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                <CheckCircle size={24} className="text-smartex-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Grading</h3>
              <p className="text-gray-600">
                Get immediate scoring and detailed feedback after exam completion.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0 bg-smartex-blue text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Upload Study Material</h3>
                <p className="text-gray-600">
                  Admins upload PDFs or lecture notes containing the course content they want to test.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0 bg-smartex-blue text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">AI Generates Questions</h3>
                <p className="text-gray-600">
                  Our advanced AI analyzes the content and generates relevant multiple-choice questions, complete with correct answers.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0 bg-smartex-blue text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Students Complete Exams</h3>
                <p className="text-gray-600">
                  Students log in, take the timed exam, and receive instant feedback and scores upon completion.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0 bg-smartex-blue text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Review Performance</h3>
                <p className="text-gray-600">
                  Admins can view detailed analytics on student performance, while students can review their answers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-smartex-darkblue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Testing Experience?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Join educators and students worldwide who are saving time and improving results with SmartEx.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-smartex-blue hover:bg-gray-100"
            onClick={() => navigate('/login')}
          >
            Get Started Now
          </Button>
        </div>
      </section>
      
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <BookOpen size={32} className="mr-2" />
              <h2 className="text-2xl font-bold">SmartEx</h2>
            </div>
            <div className="text-center md:text-right">
              <p>&copy; {new Date().getFullYear()} SmartEx. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
