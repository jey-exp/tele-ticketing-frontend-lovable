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
    <div className="container mx-auto py-6 space-y-8">
      {/* Enhanced Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Add User
        </h1>
        <p className="text-lg text-muted-foreground">
          Create a new user account and assign their role in the network ticketing system.
        </p>
      </div>

      <Card className="max-w-3xl border-0 shadow-xl bg-gradient-to-br from-card to-card/50">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl">User Registration</CardTitle>
          <CardDescription className="text-base">
            Enter the information for the new user account. Location details are required for customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="form-section">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                👤 Basic Information
              </h3>
              
              {/* Full Name */}
              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-base font-medium">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="fullName" 
                  placeholder="Enter full name (e.g., John Doe)" 
                  value={formData.fullName} 
                  onChange={(e) => handleInputChange('fullName', e.target.value)} 
                  required 
                  className="h-12 text-base focus-enhanced"
                />
              </div>

              {/* Username and Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-3">
                  <Label htmlFor="username" className="text-base font-medium">
                    Username <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="username" 
                    placeholder="Enter username (e.g., john.doe)" 
                    value={formData.username} 
                    onChange={(e) => handleInputChange('username', e.target.value)} 
                    required 
                    className="h-12 text-base focus-enhanced"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-base font-medium">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Minimum 6 characters" 
                    value={formData.password} 
                    onChange={(e) => handleInputChange('password', e.target.value)} 
                    required 
                    className="h-12 text-base focus-enhanced"
                  />
                </div>
              </div>
            </div>

            {/* Role Selection Section */}
            <div className="form-section">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                🔑 Role Assignment
              </h3>
              
              <div className="space-y-3">
                <Label htmlFor="role" className="text-base font-medium">
                  User Role <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger id="role" className="h-12 text-base focus-enhanced">
                    <SelectValue placeholder="Select the user's role in the system" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role} className="text-base py-3">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Role determines the user's permissions and access level in the system
                </p>
              </div>
            </div>

            {/* Conditionally rendered location fields for customers */}
            {isCustomerRole && (
              <div className="form-section bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-800/50">
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  📍 Customer Location
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Location information is required for customers to enable heatmap analytics and location-based services.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="city" className="text-base font-medium">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      id="city" 
                      placeholder="e.g., Chennai" 
                      value={formData.city} 
                      onChange={(e) => handleInputChange('city', e.target.value)} 
                      required={isCustomerRole} 
                      className="h-12 text-base focus-enhanced"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="state" className="text-base font-medium">
                      State <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      id="state" 
                      placeholder="e.g., Tamil Nadu" 
                      value={formData.state} 
                      onChange={(e) => handleInputChange('state', e.target.value)} 
                      required={isCustomerRole} 
                      className="h-12 text-base focus-enhanced"
                    />
                  </div>
                </div>
                <div className="space-y-3 mt-6">
                  <Label htmlFor="postalCode" className="text-base font-medium">
                    Postal Code <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="postalCode" 
                    placeholder="e.g., 600001" 
                    value={formData.postalCode} 
                    onChange={(e) => handleInputChange('postalCode', e.target.value)} 
                    required={isCustomerRole} 
                    className="h-12 text-base focus-enhanced"
                  />
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-border/50">
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                onClick={() => setFormData({
                  username: '', password: '', fullName: '', role: '',
                  city: '', state: '', postalCode: '',
                })}
                className="px-8 order-2 sm:order-1"
              >
                Clear Form
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                size="lg"
                className="btn-gradient px-8 min-w-[160px] order-1 sm:order-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddUser;