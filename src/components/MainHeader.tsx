
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export default function MainHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <header className="bg-gradient-to-r from-teal-600 to-orange-500 text-white py-4 shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img 
            src="/lovable-uploads/98b874c2-2ad6-42b6-9a71-dac71dbfe746.png" 
            alt="KMIT Logo" 
            className="h-12 mr-3" 
          />
          <h1 className="text-2xl font-bold">SmartEx AI</h1>
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
              className="text-white hover:bg-white/20" 
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
