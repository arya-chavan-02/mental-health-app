import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Brain, Loader2 } from 'lucide-react';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export const RegisterPage = ({ onNavigateToLogin }: RegisterPageProps) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      setError('Registration failed. Please try again.');
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
            <CardTitle className="text-teal-900">Create Account</CardTitle>
            <CardDescription className="text-teal-600">
              Start your journey to better mental health
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-teal-900">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-teal-200 focus:border-teal-400"
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-teal-900">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-teal-200 focus:border-teal-400"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-teal-600">
              Already have an account?{' '}
              <button
                onClick={onNavigateToLogin}
                className="text-teal-700 hover:text-teal-900 underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
