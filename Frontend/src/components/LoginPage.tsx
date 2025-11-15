import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Brain, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onNavigateToRegister: () => void;
}

export const LoginPage = ({ onNavigateToRegister }: LoginPageProps) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
      // Backend-mapped error messages
      const msg = error.message || "Login failed";

      if (msg.includes("Incorrect username or password")) {
        setError("Incorrect email or password.");
      }
      else if (msg.includes("blocked") || msg.includes("inactive")) {
        setError("Your account is blocked or inactive. Please contact support.");
      }
      else if (msg.includes("Login record not found")) {
        setError("Your login data is invalid. Contact support.");
      }
      else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 p-4">
      <Card className="w-full max-w-md border-teal-100 shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-teal-900">Welcome Back</CardTitle>
            <CardDescription className="text-teal-600">
              Sign in to your MindCare account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-teal-900">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-teal-200 focus:border-teal-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-teal-900">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-teal-200 focus:border-teal-400"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
          {error && (
              <p className="text-sm text-red-600 text-center">
                {error}
              </p>
            )}
            <p className="mt-3 text-sm text-teal-600">
              Don't have an account?{' '}
              <button
                onClick={onNavigateToRegister}
                className="text-teal-700 hover:text-teal-900 underline">
                Sign up
              </button>
            </p>
            
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
