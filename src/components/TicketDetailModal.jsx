import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, User, AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High':
      return 'destructive';
    case 'Medium':
      return 'default';
    case 'Low':
      return 'secondary';
    default:
      return 'default';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Resolved':
      return 'bg-green-500/10 text-green-700 dark:text-green-400';
    case 'In Progress':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    case 'Pending':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    case 'Needs Feedback':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
  }
};

export const TicketDetailModal = ({ ticket, open, onOpenChange }) => {
  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl h-auto max-h-[85vh] overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1 -mx-6 px-6">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <DialogTitle className="text-xl">{ticket.id}</DialogTitle>
              <DialogDescription className="text-base">
                {ticket.title}
              </DialogDescription>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <Badge variant={getPriorityColor(ticket.priority)}>
                {ticket.priority}
              </Badge>
              <Badge className={getStatusColor(ticket.status)}>
                {ticket.status}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{ticket.description}</p>
          </div>

          <Separator />

          {/* Ticket Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Created:</span>
                <span className="text-muted-foreground">
                  {format(new Date(ticket.createdAt), 'PPp')}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">SLA Duration:</span>
                <span className="text-muted-foreground">{ticket.slaDuration}</span>
              </div>

              {ticket.slaRemaining && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">SLA Remaining:</span>
                  <span className="text-muted-foreground">{ticket.slaRemaining}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <span className="font-medium">Category:</span>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline">{ticket.category}</Badge>
                  <Badge variant="outline">{ticket.subCategory}</Badge>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <span className="font-medium">Severity:</span>
                <Badge variant="outline">{ticket.severity}</Badge>
              </div>

              {ticket.assignedTo && ticket.assignedTo.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Assigned to:</span>
                  <span className="text-muted-foreground">
                    {ticket.assignedTo[0].name}
                  </span>
                </div>
              )}

              {ticket.resolvedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Resolved:</span>
                  <span className="text-muted-foreground">
                    {format(new Date(ticket.resolvedAt), 'PPp')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Activity Log */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Activity Timeline</h4>
            <div className="space-y-3">
              {ticket.logs.map((log, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    {index !== ticket.logs.length - 1 && (
                      <div className="w-px h-full bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-sm">{log.update}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
