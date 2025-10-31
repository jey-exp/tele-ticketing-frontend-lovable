import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { useUser } from '../contexts/UserContext'; // Import the UserContext hook
import apiClient from '../services/api'; // Import our centralized API client

// This list perfectly matches the TicketCategory enum in the Spring Boot backend.
const categories = [
  { value: 'NETWORK_CONNECTIVITY', label: 'Network Connectivity' },
  { value: 'PERFORMANCE_ISSUE', label: 'Performance Issue' },
  { value: 'HARDWARE_FAILURE', label: 'Hardware Failure' },
  { value: 'INFRASTRUCTURE_PROBLEM', label: 'Infrastructure Problem' },
  { value: 'CONFIGURATION_REQUEST', label: 'Configuration Request' },
  { value: 'SECURITY_CONCERN', label: 'Security Concern' },
  { value: 'SERVICE_OUTAGE', label: 'Service Outage' },
  { value: 'OTHER', label: 'Other' },
];

const NewTicket = () => {
  const navigate = useNavigate();
  const { user, isLoading: isUserLoading } = useUser(); // Get user state from context

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    attachments: [],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, attachments: files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // The payload must strictly match the backend's CreateTicketRequestDto.
    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      attachments: formData.attachments.map(file => file.name), // Sending filenames as strings
    };

    console.log("payload : ", payload);
    

    try {
      const summa = await apiClient.get("greeti");
      const response = await apiClient.post('/customer/tickets', payload);
      console.log(summa);
      
      setSubmittedTicket(response.data); // Use real data from the server
      setShowSuccessModal(true);
      setFormData({ title: '', category: '', description: '', attachments: [] }); // Reset form
    } catch (err) {
      console.error("Ticket creation failed:", err);
      setError(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/my-tickets');
  };

  // Handle the state where the context is still verifying the user's login status.
  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Handle the state where the user is not logged in.
  if (!user) {
    return (
      <div className="container mx-auto max-w-3xl p-6 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You must be logged in to create a ticket.</p>
            <Button onClick={() => navigate('/login')} className="mt-4">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the full form only if the user is loaded and authenticated.
  return (
    <div className="container mx-auto max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Raise a Ticket, {user.username}</CardTitle>
          <CardDescription>Create a new support ticket for your network issue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Internet connection is frequently dropping"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Please provide as much detail as possible..."
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            
            {/* Attachments */}
            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments</Label>
              <div className="flex items-center gap-2">
                 <Input
                   id="attachments"
                   type="file"
                   multiple
                   onChange={handleFileChange}
                   className="cursor-pointer"
                 />
                 <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              {formData.attachments.length > 0 && (
                 <p className="text-sm text-muted-foreground">
                   {formData.attachments.length} file(s) selected
                 </p>
              )}
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                 <AlertTriangle className="h-4 w-4" />
                 <span>{error}</span>
              </div>
            )}
            
            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Ticket'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <DialogTitle>Ticket Created Successfully</DialogTitle>
                <DialogDescription>Your ticket is now in our system.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {submittedTicket && (
            <div className="space-y-3 py-4 text-sm">
               <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Ticket ID:</span>
                  <span>{submittedTicket.ticketUid}</span>
               </div>
               <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Title:</span>
                  <span>{submittedTicket.title}</span>
               </div>
               <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Status:</span>
                  <span className="font-semibold">{submittedTicket.status}</span>
               </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3">
             <Button variant="outline" onClick={() => setShowSuccessModal(false)}>
               Create Another
             </Button>
             <Button onClick={handleCloseModal}>View My Tickets</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewTicket;