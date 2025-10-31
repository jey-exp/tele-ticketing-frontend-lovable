import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner'; // Using sonner for toasts as per your previous component
import { Loader2 } from 'lucide-react';
import { ROLES } from '@/config/rolesConfig';
import apiClient from '../services/api'; // Dr. X's Note: Always use our centralized API client.

// Dr. X's Note: This data must eventually be fetched from the backend.
// For now, mocking is acceptable for focused development.
const mockTeamLeads = [
  { id: 'TL-001', name: 'Sarah Johnson' },
  { id: 'TL-002', name: 'Michael Chen' },
  { id: 'TL-003', name: 'Emily Rodriguez' },
];

// This map correctly translates frontend display values to the simple string format our backend expects.
const roleMap = {
  'Customer': 'customer',
  'Agent': 'agent',
  'Triage Officer': 'triage_officer',
  'Field Engineer': 'field_engineer',
  'NOC Engineer': 'noc_engineer',
  'L1 Engineer': 'l1_engineer',
  'Team Lead': 'team_lead',
  'Manager': 'manager',
  'CXO': 'cxo',
  'NOC Admin': 'noc_admin',
};

const AddUser = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: '',
    teamLead: '',
  });
  
  // Dr. X's Note: Add isLoading state for proper user feedback on the button.
  const [isLoading, setIsLoading] = useState(false);

  // This list defines which roles are available in the dropdown.
  const availableRoles = [
    ROLES.CUSTOMER,
    ROLES.AGENT,
    ROLES.TRIAGE_OFFICER,
    ROLES.FIELD_ENGINEER,
    ROLES.NOC_ENGINEER,
    ROLES.L1_ENGINEER,
    ROLES.TEAM_LEAD,
    ROLES.MANAGER,
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password || !formData.fullName || !formData.role) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      // Dr. X's Note: The payload construction is now simplified and directly matches the SignupRequestDto.
      // The role is mapped and sent as an array containing a single string.
      const payload = {
        username: formData.username,
        fullname: formData.fullName,
        role: [roleMap[formData.role]], // e.g., ['customer']
        password: formData.password,
      };

      // Dr. X's Note: Replaced direct axios call with our apiClient for architectural consistency.
      const response = await apiClient.post('/auth/signup', payload);

      toast.success(response.data.message || 'User registered successfully!');

      // Reset form on success
      setFormData({
        username: '', password: '', fullName: '', role: '', teamLead: '',
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
        <p className="text-muted-foreground mt-2">
          Create a new user account and assign their role
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            Enter the information for the new user account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
              />
            </div>

            {/* Username and Password side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username <span className="text-destructive">*</span></Label>
                <Input
                  id="username"
                  placeholder="john.doe"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Role and Team Lead side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="role">Role <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamLead">Assign to Team (Optional)</Label>
                <Select
                  value={formData.teamLead}
                  onValueChange={(value) => handleInputChange('teamLead', value)}
                >
                  <SelectTrigger id="teamLead">
                    <SelectValue placeholder="Select a team lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTeamLeads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({
                  username: '', password: '', fullName: '', role: '', teamLead: '',
                })}
              >
                Clear Form
              </Button>
              <Button type="submit" disabled={isLoading}>
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