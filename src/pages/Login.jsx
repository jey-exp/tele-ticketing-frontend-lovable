import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';
import { sidebarLinks } from '../config/rolesConfig';
import apiClient from '../services/api'; // Dr. X's Note: Import our centralized API client.

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Dr. X's Note: We now get the 'login' function directly from our context.
  const { login } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    setIsLoading(true);

    try {
      // Dr. X's Note: Replaced the entire 'fetch' block with a single, clean apiClient call.
      // Headers, method, and base URL are all handled automatically.
      
      const response = await apiClient.post('/auth/signin', { username, password });

      const token = response.data.accessToken;

      // Dr. X's Note: This is the most important change.
      // We call the single 'login' function from our context.
      // It handles setting the token in localStorage and updating the global user state.
      // This is clean, reusable, and the single source of truth.
      login(token);

      toast.success('Login successful!');
      
      // Dr. X's Note: For immediate navigation, we can decode the token here
      // to determine the user's role and find their default page.
      const decodedToken = jwtDecode(token);
      // Our backend puts roles in an 'authorities' claim. We take the first one.
      const userRole = decodedToken.authorities ? decodedToken.authorities[0] : null;

      const roleLinks = sidebarLinks[userRole] || [];
      const firstLink = roleLinks[0]?.path || '/dashboard';
      navigate(firstLink);

    } catch (error) {
      // Dr. X's Note: Error handling is now more specific to our apiClient setup.
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;