import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getTicketsNeedingFeedback, getTicketsWithFeedback, getAgentTicketsNeedingFeedback, getAgentTicketsWithFeedback } from '@/data/mockTickets';
import { Star, Building } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { ROLES } from '@/config/rolesConfig';

const Feedback = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Get tickets based on user role
  const ticketsNeedingFeedback = user.role === ROLES.AGENT 
    ? getAgentTicketsNeedingFeedback(user.id)
    : getTicketsNeedingFeedback();
    
  const ticketsWithFeedback = user.role === ROLES.AGENT
    ? getAgentTicketsWithFeedback(user.id)
    : getTicketsWithFeedback();

  const handleCardClick = (ticket) => {
    setSelectedTicket(ticket);
    setRating(0);
    setHoveredRating(0);
    setFeedbackText('');
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please provide a rating before submitting feedback.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Feedback Submitted',
      description: `Thank you for rating ticket ${selectedTicket.id}!`,
    });
    
    setShowFeedbackModal(false);
    setSelectedTicket(null);
  };

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
        {ticketsNeedingFeedback.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No tickets requiring feedback at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ticketsNeedingFeedback.map((ticket) => (
              <Card
                key={ticket.id}
                className="cursor-pointer transition-all hover:shadow-lg"
                onClick={() => handleCardClick(ticket)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{ticket.id}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {ticket.title}
                      </CardDescription>
                    </div>
                    <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400">
                      Feedback Required
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {ticket.category}
                      </Badge>
                      {/* Show customer name for Agent role */}
                      {user.role === ROLES.AGENT && ticket.customer && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {ticket.customer.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Feedback History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Feedback History</h2>
        <Card>
          <CardContent className="p-0">
            {ticketsWithFeedback.length === 0 ? (
              <div className="p-6">
                <p className="text-center text-muted-foreground">
                  No feedback history available.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Title</TableHead>
                    {user.role === ROLES.AGENT && <TableHead>Customer</TableHead>}
                    <TableHead>Rating</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead>Resolved On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ticketsWithFeedback.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.id}</TableCell>
                      <TableCell className="max-w-xs truncate">{ticket.title}</TableCell>
                      {user.role === ROLES.AGENT && (
                        <TableCell className="max-w-xs truncate">
                          {ticket.customer?.name || '-'}
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < ticket.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {ticket.feedbackText || 'No written feedback'}
                      </TableCell>
                      <TableCell>
                        {ticket.resolvedAt
                          ? format(new Date(ticket.resolvedAt), 'PP')
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feedback Modal */}
      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>
              Rate your experience with ticket {selectedTicket?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4 py-4">
              {/* Ticket Info */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Ticket Details</h4>
                <p className="text-sm text-muted-foreground">{selectedTicket.title}</p>
                {user.role === ROLES.AGENT && selectedTicket.customer && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Customer:</span> {selectedTicket.customer.name}
                  </p>
                )}
              </div>

              {/* Star Rating */}
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
                  {rating > 0 && (
                    <span className="text-sm text-muted-foreground ml-2">
                      {rating} star{rating !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Feedback Text */}
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
            <Button variant="outline" onClick={() => setShowFeedbackModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitFeedback}>Submit Feedback</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feedback;
