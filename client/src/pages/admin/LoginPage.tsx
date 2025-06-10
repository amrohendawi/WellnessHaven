import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(username, password, from);
      if (result?.success && result.redirectTo) {
        navigate(result.redirectTo, { replace: true });
      }
    } catch {
      // Error is handled by the login function
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-beige-light p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold mb-2">
            <span className="text-gold">Dubai</span>
            <span className="text-pink-dark">Rose</span>
          </h1>
          <h2 className="text-xl text-gray-700">Admin Dashboard</h2>
          <div className="mt-2 h-1 w-16 bg-gold/50 mx-auto rounded-full"></div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 border border-gold/10">
          <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full"
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-pink-dark hover:text-pink-700"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full text-white"
              style={{ backgroundColor: '#D4A546', borderColor: '#D4A546' }}
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
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Don't have an account? Contact the administrator.</p>
          <Link to="/" className="mt-4 inline-block text-gold hover:text-gold/80">
            <Button variant="outline" className="mt-2 border-gold text-gold hover:bg-gold/10">
              ← Back to Website
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
