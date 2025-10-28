import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ROLES } from '@/config/rolesConfig';
import { mockEngineers } from '@/data/mockEngineers';

// Mock team leads data
const mockTeamLeads = [
  { id: 'TL-001', name: 'Sarah Johnson' },
  { id: 'TL-002', name: 'Michael Chen' },
  { id: 'TL-003', name: 'Emily Rodriguez' },
];

const AddUser = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: '',
    teamLead: '',
  });

  // Engineering roles that can be assigned
  const engineeringRoles = [
    ROLES.L1_ENGINEER,
    ROLES.NOC_ENGINEER,
    ROLES.FIELD_ENGINEER,
    ROLES.TRIAGE_OFFICER,
    ROLES.TEAM_LEAD,
    ROLES.AGENT,
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username || !formData.password || !formData.fullName || !formData.role) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // Password validation
    if (formData.password.length < 8) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      });
      return;
    }

    // Mock user creation
    console.log('Creating user:', formData);
    
    toast({
      title: 'User Created Successfully',
      description: `User ${formData.fullName} (${formData.username}) has been added as ${formData.role}.`,
    });

    // Reset form
    setFormData({
      username: '',
      password: '',
      fullName: '',
      role: '',
      teamLead: '',
    });
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
              <Label htmlFor="fullName">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                placeholder="john.doe"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange('role', value)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {engineeringRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Team Lead (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="teamLead">Team Lead (Optional)</Label>
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

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Create User
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData({
                    username: '',
                    password: '',
                    fullName: '',
                    role: '',
                    teamLead: '',
                  })
                }
              >
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddUser;
