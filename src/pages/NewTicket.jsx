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
    <div className="container mx-auto max-w-4xl p-6">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Raise a Ticket
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome <span className="font-semibold text-foreground">{user.username}</span>, 
            let's get your issue resolved quickly
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/50">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl">Create Support Ticket</CardTitle>
            <CardDescription className="text-base">
              Provide detailed information about your network issue for faster resolution
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title Section */}
              <div className="form-section">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-base font-semibold">
                    Issue Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Internet connection is frequently dropping"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="text-base h-12 focus-enhanced"
                  />
                  <p className="text-sm text-muted-foreground">
                    Provide a clear, descriptive title for your issue
                  </p>
                </div>
              </div>

              {/* Category Section */}
              <div className="form-section">
                <div className="space-y-3">
                  <Label htmlFor="category" className="text-base font-semibold">
                    Category *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger id="category" className="h-12 text-base focus-enhanced">
                      <SelectValue placeholder="Select the type of issue you're experiencing" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="text-base py-3">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Choose the category that best describes your issue
                  </p>
                </div>
              </div>

              {/* Description Section */}
              <div className="form-section">
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-base font-semibold">
                    Detailed Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide as much detail as possible about the issue you're experiencing..."
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="text-base resize-none focus-enhanced"
                  />
                  <p className="text-sm text-muted-foreground">
                    Include error messages, when the issue occurs, and steps you've already tried
                  </p>
                </div>
              </div>
              
              {/* Attachments Section */}
              <div className="form-section">
                <div className="space-y-3">
                  <Label htmlFor="attachments" className="text-base font-semibold">
                    Attachments (Optional)
                  </Label>
                  <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center hover:border-primary/50 transition-colors duration-200">
                    <Input
                      id="attachments"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="attachments" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-base font-medium">Click to upload files</p>
                      <p className="text-sm text-muted-foreground">
                        Screenshots, logs, or other relevant files
                      </p>
                    </label>
                  </div>
                  {formData.attachments.length > 0 && (
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        ✓ {formData.attachments.length} file(s) selected
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message Display */}
              {error && (
                <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-900">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-6 border-t border-border/50">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                  size="lg"
                  className="px-8"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  size="lg"
                  className="btn-gradient px-8 min-w-[140px]"
                >
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
      </div>

      {/* Enhanced Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-semibold">
                Ticket Created Successfully!
              </DialogTitle>
              <DialogDescription className="text-base">
                Your support ticket has been submitted and our team will respond soon.
              </DialogDescription>
            </div>
          </DialogHeader>
          
          {submittedTicket && (
            <div className="space-y-4 py-6">
              <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Ticket ID:</span>
                  <span className="font-semibold text-primary">{submittedTicket.ticketUid}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-muted-foreground">Title:</span>
                  <span className="text-sm text-right flex-1 ml-2">{submittedTicket.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Status:</span>
                  <span className="text-sm font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                    {submittedTicket.status}
                  </span>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                📧 You'll receive email updates at your registered email address
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
            <Button 
              variant="outline" 
              onClick={() => setShowSuccessModal(false)}
              className="flex-1"
            >
              Create Another
            </Button>
            <Button 
              onClick={handleCloseModal}
              className="btn-gradient flex-1"
            >
              View My Tickets
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewTicket;