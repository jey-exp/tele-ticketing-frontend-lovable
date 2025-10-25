import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, User, Building } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@/contexts/UserContext';
import { ROLES } from '@/config/rolesConfig';

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

export const TicketCard = ({ ticket, onClick }) => {
  const { user } = useUser();
  
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg"
      onClick={() => onClick && onClick(ticket)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">{ticket.id}</CardTitle>
              <Badge variant={getPriorityColor(ticket.priority)}>
                {ticket.priority}
              </Badge>
              <Badge className={getStatusColor(ticket.status)}>
                {ticket.status}
              </Badge>
            </div>
            <CardDescription className="line-clamp-1">
              {ticket.title}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {ticket.description}
        </p>
        
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
          </div>
          
          {ticket.slaRemaining && (
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>SLA: {ticket.slaRemaining}</span>
            </div>
          )}
          
          {ticket.assignedTo && ticket.assignedTo.length > 0 && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{ticket.assignedTo[0].name}</span>
            </div>
          )}
          
          {/* Show customer info for Agent role */}
          {user.role === ROLES.AGENT && ticket.customer && (
            <div className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              <span>{ticket.customer.name}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            {ticket.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {ticket.subCategory}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
