import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/services/api';

const assignableRoles = [
  'agent', 'triage_officer', 'field_engineer', 
  'noc_engineer', 'l1_engineer', 'team_lead', 'manager',
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for the role change modal
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      setError("Failed to load user list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openRoleModal = (user) => {
    setEditingUser(user);
    // Convert from "ROLE_TEAM_LEAD" to "team_lead"
    const simpleRole = user.role.replace('ROLE_', '').toLowerCase();
    setNewRole(simpleRole);
  };

  const handleChangeRole = async () => {
    if (!newRole) {
      toast.error("Please select a new role.");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/admin/users/${editingUser.id}/role`, { newRole });
      toast.success(`Role for ${editingUser.username} has been updated.`);
      setEditingUser(null);
      fetchUsers(); // Refresh the list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
      <p className="text-muted-foreground">Modify roles for existing internal staff.</p>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">No internal users found.</TableCell></TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell className="capitalize">{user.role.replace('ROLE_', '').replace(/_/g, ' ')}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openRoleModal(user)} disabled={isSubmitting}>
                        <Edit className="h-4 w-4 mr-2" />Change Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Role Change Modal */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role for {editingUser?.username}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="newRole">New Role</Label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger id="newRole"><SelectValue /></SelectTrigger>
              <SelectContent>
                {assignableRoles.map(role => (
                  <SelectItem key={role} value={role} className="capitalize">{role.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={handleChangeRole} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;