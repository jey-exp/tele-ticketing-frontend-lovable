import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Star, Loader2, AlertTriangle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { ROLES } from '@/config/rolesConfig';
import apiClient from '@/services/api';

const Feedback = () => {
  const { toast } = useToast();
  const { user, isLoading: isUserLoading } = useUser();

  const [pendingTickets, setPendingTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPendingTickets = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    const endpoint =
      user.role === ROLES.CUSTOMER
        ? '/customer/tickets/feedback-pending'
        : user.role === ROLES.AGENT
        ? '/agent/tickets/feedback-pending'
        : null;

    if (!endpoint) {
      setError('Feedback is not available for your role.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get(endpoint);
      setPendingTickets(response.data);
    } catch (err) {
      console.error('Failed to fetch pending tickets:', err);
      setError('Could not load tickets. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTickets();
  }, [user]);

  const handleCardClick = (ticket) => {
    setSelectedTicket(ticket);
    setRating(0);
    setHoveredRating(0);
    setFeedbackText('');
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast({
        title: 'Missing Rating',
        description: 'Please select a star rating before submitting.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);

    const payload = { rating, comment: feedbackText };

    const endpoint =
      user.role === ROLES.CUSTOMER
        ? `/customer/tickets/${selectedTicket.id}/feedback`
        : user.role === ROLES.AGENT
        ? `/agent/tickets/${selectedTicket.id}/feedback`
        : null;

    try {
      await apiClient.post(endpoint, payload);
      toast({
        title: 'Feedback Submitted',
        description: `Feedback for ticket ${selectedTicket.ticketUid} has been recorded.`,
      });
      setSelectedTicket(null);
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

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="text-left space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Feedback Center</h1>
        <p className="text-muted-foreground text-lg">
          {user?.role === ROLES.CUSTOMER
            ? 'Rate your experience and help us improve our service.'
            : 'Submit feedback on behalf of your customers.'}
        </p>
      </div>

      {/* Pending Feedback */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold">Pending Feedback</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading tickets...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : pendingTickets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              No tickets requiring feedback at the moment.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pendingTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="cursor-pointer transition-all border hover:border-primary hover:shadow-lg rounded-2xl"
                onClick={() => handleCardClick(ticket)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold">
                        {ticket.ticketUid}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2 text-muted-foreground">
                        {ticket.title}
                      </CardDescription>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      Feedback Required
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Feedback History */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Feedback History</h2>
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground">
            Coming soon...
          </CardContent>
        </Card>
      </section>

      {/* Feedback Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Provide Feedback
            </DialogTitle>
            <DialogDescription>
              Rate your experience for ticket{' '}
              <span className="font-medium">{selectedTicket?.ticketUid}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6 py-4">
              <div>
                <h4 className="text-sm font-semibold mb-1">Ticket Details</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedTicket.title}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Rating *</h4>
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

              <div>
                <h4 className="text-sm font-semibold mb-2">
                  Additional Comments (Optional)
                </h4>
                <Textarea
                  placeholder="Share your experience..."
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
