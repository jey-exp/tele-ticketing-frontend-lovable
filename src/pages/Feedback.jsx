import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Star, Loader2, AlertTriangle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import apiClient from '@/services/api';

const Feedback = () => {
  const { toast } = useToast();
  const { user, isLoading: isUserLoading } = useUser();

  // Dr. X's Note: State for fetching and displaying the list of tickets.
  const [pendingTickets, setPendingTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the feedback submission modal.
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to fetch tickets that need feedback.
  const fetchPendingTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/customer/tickets/feedback-pending');
      setPendingTickets(response.data);
    } catch (err) {
      console.error("Failed to fetch pending tickets:", err);
      setError("Could not load tickets. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Dr. X's Note: Use useEffect to fetch data when the component mounts and the user is available.
  useEffect(() => {
    if (user) {
      fetchPendingTickets();
    }
  }, [user]); // Re-run this effect if the user object changes.

  const handleCardClick = (ticket) => {
    setSelectedTicket(ticket);
    setRating(0);
    setHoveredRating(0);
    setFeedbackText('');
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a star rating before submitting.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    
    // The payload must match the backend's FeedbackRequestDto.
    const payload = {
      rating: rating,
      comment: feedbackText,
    };

    try {
      await apiClient.post(`/customer/tickets/${selectedTicket.id}/feedback`, payload);
      toast({
        title: 'Feedback Submitted',
        description: `Thank you for your feedback on ticket ${selectedTicket.ticketUid}!`,
      });
      setSelectedTicket(null); // Close the modal
      // Dr. X's Note: Refresh the list to remove the ticket that was just reviewed.
      // This keeps the UI perfectly in sync with the backend state.
      fetchPendingTickets(); 
    } catch (err) {
      toast({
        title: 'Submission Failed',
        description: err.response?.data?.message || 'An error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle user loading state
  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback Center</h1>
        <p className="text-muted-foreground mt-1">
          Rate your experience and help us improve our service
        </p>
      </div>

      {/* Tickets Needing Feedback */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Pending Feedback</h2>
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading tickets...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : pendingTickets.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No tickets requiring feedback at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="cursor-pointer transition-all hover:shadow-lg"
                onClick={() => handleCardClick(ticket)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      {/* Use the correct field names from our TicketSummaryDto */}
                      <CardTitle className="text-base">{ticket.ticketUid}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {ticket.title}
                      </CardDescription>
                    </div>
                    <Badge variant="destructive">Feedback Required</Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Feedback History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Feedback History</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>
              Rate your experience with ticket {selectedTicket?.ticketUid}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Ticket Details</h4>
                <p className="text-sm text-muted-foreground">{selectedTicket.title}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Rating *</h4>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-8 w-8 cursor-pointer transition-all ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Additional Comments (Optional)</h4>
                <Textarea
                  placeholder="Share your experience with our service..."
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitFeedback} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feedback;