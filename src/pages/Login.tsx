
import LoginForm from '@/components/LoginForm';
import { BookOpen } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-smartex-blue text-white py-6">
        <div className="container mx-auto px-4 flex items-center">
          <BookOpen size={32} className="mr-2" />
          <h1 className="text-2xl font-bold">SmartEx</h1>
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">AI-Powered Exam Platform</h1>
            <p className="mt-2 text-gray-600">
              Create and take intelligent exams with our cutting-edge platform
            </p>
          </div>
          <LoginForm />
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
