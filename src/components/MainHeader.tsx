
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen, LogOut, User } from 'lucide-react';

export default function MainHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <header className="bg-smartex-blue text-white py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <BookOpen size={32} className="mr-2" />
          <h1 className="text-2xl font-bold">SmartEx</h1>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <User size={20} className="mr-2" />
              <span>
                {user.username} <span className="text-sm opacity-80">({user.role})</span>
              </span>
            </div>
            <Button 
              variant="ghost" 
              className="text-white hover:bg-blue-700" 
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-1" /> Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
