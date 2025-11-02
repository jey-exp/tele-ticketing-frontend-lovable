import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, User, AlertTriangle, Calendar, CheckCircle2, Loader2, Tag } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import apiClient from '@/services/api';

// Dr. X's Note: These helpers are updated to use the backend's uppercase enum values.
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'HIGH': return 'destructive';
    case 'MEDIUM': return 'default';
    case 'LOW': return 'secondary';
    default: return 'outline';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'RESOLVED':
    case 'FIXED':
      return 'bg-green-500/10 text-green-700';
    case 'IN_PROGRESS':
      return 'bg-blue-500/10 text-blue-700';
    case 'ASSIGNED':
    case 'CREATED':
      return 'bg-yellow-500/10 text-yellow-700';
    case 'REOPENED':
      return 'bg-red-500/10 text-red-700';
    case 'NEEDS_TRIAGING':
      return 'bg-purple-500/10 text-purple-700';
    default:
      return 'bg-gray-500/10 text-gray-700';
  }
};

export const TicketDetailModal = ({ ticketId, open, onOpenChange }) => {
  // Dr. X's Note: The modal now manages its own data fetching state.
  const [ticketDetails, setTicketDetails] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch data if the modal is open and we have a ticketId.
    if (open && ticketId) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch ticket details and activity logs in parallel for better performance.
          const [detailsResponse, logsResponse] = await Promise.all([
            apiClient.get(`/tickets/${ticketId}`),
            apiClient.get(`/tickets/${ticketId}/logs`),
          ]);
          setTicketDetails(detailsResponse.data);
          setActivityLogs(logsResponse.data);
        } catch (err) {
          console.error("Failed to fetch ticket details:", err);
          setError("Could not load ticket details. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [ticketId, open]); // This effect re-runs whenever the ticketId or open state changes.

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (error) {
      return <div className="p-6 text-center text-red-500">{error}</div>;
    }
    
    if (!ticketDetails) return null;

    const assignedToNames = ticketDetails.assignedTo.map(user => user.fullName).join(', ') || 'Unassigned';

    return (
      <div className="overflow-y-auto flex-1 -mx-6 px-6">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <DialogTitle className="text-xl">{ticketDetails.ticketUid}</DialogTitle>
              <DialogDescription className="text-base">{ticketDetails.title}</DialogDescription>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <Badge variant={getPriorityColor(ticketDetails.priority)}>{ticketDetails.priority}</Badge>
              <Badge className={getStatusColor(ticketDetails.status)}>{ticketDetails.status}</Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{ticketDetails.description}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Created:</span><span className="text-muted-foreground">{format(new Date(ticketDetails.createdAt), 'PPp')}</span></div>
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Customer:</span><span className="text-muted-foreground">{ticketDetails.createdFor.fullName}</span></div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Category:</span><Badge variant="outline">{ticketDetails.category}</Badge></div>
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Assigned to:</span><span className="text-muted-foreground">{assignedToNames}</span></div>
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-semibold mb-3">Activity Timeline</h4>
            <div className="space-y-3">
              {activityLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activities logged yet.</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.activityId} className="flex gap-3">
                    <div className="flex flex-col items-center"><div className="h-2 w-2 rounded-full bg-primary mt-1.5" /><div className="w-px h-full bg-border" /></div>
                    <div className="flex-1 pb-3">
                      <p className="text-sm">{log.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        by {log.user.fullName} • {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl h-auto max-h-[85vh] overflow-hidden flex flex-col">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};