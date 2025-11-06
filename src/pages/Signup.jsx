import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/services/api';

// All available roles for signup
const availableRoles = [
  'Customer', 'Agent', 'Triage Officer', 'Field Engineer',
  'NOC Engineer', 'L1 Engineer', 'Team Lead', 'Manager'
];

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    role: '',
    city: '',
    state: '',
    postalCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Helper to check if the selected role is 'Customer'
  const isCustomerRole = formData.role === 'Customer';

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role) {
      toast.error('Please select a role.');
      return;
    }
    
    setIsLoading(true);

    try {
      const backendRole = formData.role.toLowerCase().replace(/ /g, '_');
      let payload;
      let endpoint;
      let successMessage;

      if (isCustomerRole) {
        // This is a Customer signup, using the /auth/signup endpoint
        endpoint = '/auth/signup';
        payload = {
          username: formData.username,
          fullname: formData.fullName,
          password: formData.password,
          role: [backendRole], // The customer endpoint expects an array
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
        };
        successMessage = "Signup successful! Please log in.";
      } else {
        // This is an Internal employee signup, using the approval queue
        endpoint = '/auth/internal-signup';
        payload = {
          username: formData.username,
          fullname: formData.fullName,
          password: formData.password,
          preferredRole: backendRole, // The internal endpoint expects this key
        };
        successMessage = "Request submitted! Pending admin approval.";
      }

      await apiClient.post(endpoint, payload);
      toast.success(successMessage);
      navigate('/login');

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Something went wrong.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Fill out the form below to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection (First) */}
            <div className="space-y-2">
              <Label htmlFor="role">What is your role? <span className="text-destructive">*</span></Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger id="role"><SelectValue placeholder="Select a role" /></SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Always-required fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                <Input id="fullName" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username <span className="text-destructive">*</span></Label>
                <Input id="username" value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
              <Input id="password" type="password" placeholder="Minimum 6 characters" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required />
            </div>

            {/* Conditionally rendered location fields for customers */}
            {isCustomerRole && (
              <div className="space-y-4 border-t pt-6 mt-6">
                <h3 className="text-sm font-medium text-muted-foreground">Customer Location (Required)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                    <Input id="city" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} required={isCustomerRole} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State <span className="text-destructive">*</span></Label>
                    <Input id="state" value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} required={isCustomerRole} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code <span className="text-destructive">*</span></Label>
                  <Input id="postalCode" value={formData.postalCode} onChange={(e) => handleInputChange('postalCode', e.target.value)} required={isCustomerRole} />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/login')}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : (isCustomerRole ? 'Create Account' : 'Request Approval')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;