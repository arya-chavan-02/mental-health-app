import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Brain, MessageSquare, User, LogOut } from 'lucide-react';

interface NavigationProps {
  currentPage: 'chat' | 'profile';
  onNavigate: (page: 'chat' | 'profile') => void;
}

export const Navigation = ({ currentPage, onNavigate }: NavigationProps) => {
  const { logout, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="bg-white border-b border-teal-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-teal-900">MindCare</span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {/* Only show Chat button for non-admin users */}
            {!isAdmin && (
              <Button
                variant={currentPage === 'chat' ? 'default' : 'ghost'}
                onClick={() => onNavigate('chat')}
                className={currentPage === 'chat' 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500' 
                  : 'text-teal-700 hover:bg-teal-50'
                }
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </Button>
            )}
            <Button
              variant={currentPage === 'profile' ? 'default' : 'ghost'}
              onClick={() => onNavigate('profile')}
              className={currentPage === 'profile' 
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500' 
                : 'text-teal-700 hover:bg-teal-50'
              }
            >
              <User className="w-4 h-4 mr-2" />
              {isAdmin ? 'Dashboard' : 'Profile'}
            </Button>
            <Button
              variant="ghost"
              onClick={logout}
              className="text-teal-700 hover:bg-teal-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
