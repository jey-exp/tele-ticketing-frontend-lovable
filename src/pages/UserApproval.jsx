import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/services/api';
import { format } from 'date-fns';

// This list must match the backend 'case' statements for role creation
const assignableRoles = [
  'agent', 'triage_officer', 'field_engineer', 
  'noc_engineer', 'l1_engineer', 'team_lead', 'manager'
];

const UserApproval = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [finalRole, setFinalRole] = useState('');

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/admin/signup-requests');
      setRequests(response.data);
    } catch (err) {
      setError("Failed to load approval requests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openApproveModal = (request) => {
    setSelectedRequest(request);
    // Dr. X's Note: This is where we pre-populate the dropdown
    // with the user's originally requested role.
    setFinalRole(request.preferredRole);
  };

  const handleApprove = async () => {
    if (!finalRole) {
      toast.error("Please select a final role for the user.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Dr. X's Note: We send the 'finalRole' state, which may
      // have been changed by the admin in the dropdown.
      await apiClient.post(`/admin/signup-requests/${selectedRequest.id}/approve`, { finalRole });
      toast.success(`User ${selectedRequest.username} approved and created.`);
      setSelectedRequest(null);
      fetchRequests(); // Refresh the list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve request.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReject = async (requestId) => {
    if (!window.confirm("Are you sure you want to reject this request? This action is permanent.")) {
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.delete(`/admin/signup-requests/${requestId}/reject`);
      toast.info("Signup request has been rejected.");
      fetchRequests(); // Refresh the list
    } catch (err) {
      toast.error("Failed to reject request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">User Approval Queue</h1>
      <p className="text-muted-foreground">Approve or reject new internal user signup requests.</p>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Preferred Role</TableHead>
                <TableHead>Requested On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">No pending requests.</TableCell></TableRow>
              ) : (
                requests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.username}</TableCell>
                    <TableCell>{req.fullName}</TableCell>
                    <TableCell className="capitalize">{req.preferredRole.replace(/_/g, ' ')}</TableCell>
                    <TableCell>{format(new Date(req.createdAt), 'PP')}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="destructive" onClick={() => handleReject(req.id)} disabled={isSubmitting}>
                        <X className="h-4 w-4 mr-2" />Reject
                      </Button>
                      <Button size="sm" onClick={() => openApproveModal(req)} disabled={isSubmitting}>
                        <Check className="h-4 w-4 mr-2" />Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Approval Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve User: {selectedRequest?.username}</DialogTitle>
            <p>User requested role: <span className="font-semibold capitalize">{selectedRequest?.preferredRole.replace(/_/g, ' ')}</span></p>
          </DialogHeader>
          <div className="py-4 space-y-2">
            {/* Dr. X's Note: This is the dropdown that allows the admin to change the role. */}
            <Label htmlFor="finalRole">Set Final Role</Label>
            <Select value={finalRole} onValueChange={setFinalRole}>
              <SelectTrigger id="finalRole"><SelectValue /></SelectTrigger>
              <SelectContent>
                {assignableRoles.map(role => (
                  <SelectItem key={role} value={role} className="capitalize">{role.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Approve & Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserApproval;