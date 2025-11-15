import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { ChatbotPage } from './components/ChatbotPage';
import { UserProfile } from './components/UserProfile';
import { AdminProfile } from './components/AdminProfile';
import { Navigation } from './components/Navigation';

type AuthPage = 'login' | 'register';
type AppPage = 'chat' | 'profile';

function AppContent() {
  const { user } = useAuth();
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  const [currentPage, setCurrentPage] = useState<AppPage>('chat');

  // Show auth pages if user is not logged in
  if (!user) {
    if (authPage === 'login') {
      return <LoginPage onNavigateToRegister={() => setAuthPage('register')} />;
    }
    return <RegisterPage onNavigateToLogin={() => setAuthPage('login')} />;
  }

  // Redirect admin users to profile if they somehow land on chat page
  const isAdmin = user.role === 'admin';
  const effectivePage = isAdmin && currentPage === 'chat' ? 'profile' : currentPage;

  // Show main app with navigation
  return (
    <div className="min-h-screen">
      <Navigation currentPage={effectivePage} onNavigate={setCurrentPage} />
      {effectivePage === 'chat' && !isAdmin ? (
        <ChatbotPage />
      ) : (
        user.role === 'admin' ? <AdminProfile /> : <UserProfile />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
