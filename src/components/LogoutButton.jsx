import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';

export const LogoutButton = () => {
  const { logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // This clears the user state and removes the token from localStorage.
    toast.info("You have been logged out.");
    
    // Dr. X's Note: We use { replace: true } to clear the navigation history.
    // This prevents the user from using the browser's back button to return to a protected page.
    navigate('/login', { replace: true });
  };

  useEffect(()=>{
    logout(); // This clears the user state and removes the token from localStorage.
    toast.info("You have been logged out.");
    
    // Dr. X's Note: We use { replace: true } to clear the navigation history.
    // This prevents the user from using the browser's back button to return to a protected page.
    navigate('/login', { replace: true });
  }, [])

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-muted-foreground hover:text-foreground"
      onClick={handleLogout}
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Logout</span>
    </Button>
  );
};