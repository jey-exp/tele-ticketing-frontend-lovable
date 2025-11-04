import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import apiClient from '../services/api';

// This list contains the user-friendly display names for the roles.
const availableRoles = [
  'Customer', 'Agent', 'Triage Officer', 'Field Engineer',
  'NOC Engineer', 'L1 Engineer', 'Team Lead', 'Manager'
];

const AddUser = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: '',
    city: '',
    state: '',
    postalCode: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // A helper boolean to determine if the location fields should be shown.
  const isCustomerRole = formData.role === 'Customer';

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform validation for all required fields.
    if (!formData.username || !formData.password || !formData.fullName || !formData.role) {
      toast.error('Please fill in all required user fields.');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (isCustomerRole && (!formData.city || !formData.state || !formData.postalCode)) {
        toast.error('City, State, and Postal Code are required for customers.');
        return;
    }

    setIsLoading(true);

    try {
      // Convert the user-friendly role name to the format the backend expects.
      // e.g., "Triage Officer" becomes "triage_officer"
      const backendRole = formData.role.toLowerCase().replace(/ /g, '_');

      const payload = {
        username: formData.username,
        fullname: formData.fullName,
        role: [backendRole], // The backend expects an array of strings.
        password: formData.password,
        // Conditionally add location fields to the payload only if creating a customer.
        ...(isCustomerRole && {
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
        }),
      };

      const response = await apiClient.post('/auth/signup', payload);
      toast.success(response.data.message || 'User registered successfully!');

      // Reset form on success.
      setFormData({
        username: '', password: '', fullName: '', role: '',
        city: '', state: '', postalCode: '',
      });

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Something went wrong while creating the user.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add User</h1>
        <p className="text-muted-foreground mt-2">Create a new user account and assign their role.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Enter the information for the new user account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
              <Input id="fullName" placeholder="John Doe" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} required />
            </div>

            {/* Username and Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username <span className="text-destructive">*</span></Label>
                <Input id="username" placeholder="john.doe" value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                <Input id="password" type="password" placeholder="Minimum 6 characters" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role <span className="text-destructive">*</span></Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger id="role"><SelectValue placeholder="Select a role" /></SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Conditionally rendered location fields for customers. */}
            {isCustomerRole && (
                <div className="space-y-4 border-t pt-6 mt-6">
                    <h3 className="text-sm font-medium text-muted-foreground">Customer Location (Required for Heatmap Analytics)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                            <Input id="city" placeholder="e.g., Chennai" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} required={isCustomerRole} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State <span className="text-destructive">*</span></Label>
                            <Input id="state" placeholder="e.g., Tamil Nadu" value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} required={isCustomerRole} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code <span className="text-destructive">*</span></Label>
                        <Input id="postalCode" placeholder="e.g., 600001" value={formData.postalCode} onChange={(e) => handleInputChange('postalCode', e.target.value)} required={isCustomerRole} />
                    </div>
                </div>
            )}
            
            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setFormData({
                  username: '', password: '', fullName: '', role: '',
                  city: '', state: '', postalCode: '',
              })}>
                Clear Form
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddUser;