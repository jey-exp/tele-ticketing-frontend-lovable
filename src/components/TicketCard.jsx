import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, User, ArrowRight, Zap, Shield, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const getPriorityConfig = (priority) => {
  switch (priority?.toUpperCase()) {
    case 'CRITICAL':
      return {
        variant: 'destructive',
        className: 'priority-badge-critical animate-pulse',
        icon: AlertTriangle,
        color: 'text-red-600'
      };
    case 'HIGH':
      return {
        variant: 'destructive',
        className: 'priority-badge-high',
        icon: Zap,
        color: 'text-orange-600'
      };
    case 'MEDIUM':
      return {
        variant: 'default',
        className: 'priority-badge-medium',
        icon: Shield,
        color: 'text-blue-600'
      };
    case 'LOW':
      return {
        variant: 'secondary',
        className: 'priority-badge-low',
        icon: Clock,
        color: 'text-gray-600'
      };
    default:
      return {
        variant: 'default',
        className: 'priority-badge-medium',
        icon: Shield,
        color: 'text-blue-600'
      };
  }
};

const getStatusConfig = (status) => {
  switch (status?.toUpperCase()) {
    case 'RESOLVED':
    case 'CLOSED':
      return {
        className: 'status-badge-resolved border',
        textColor: 'text-green-700 dark:text-green-400'
      };
    case 'IN_PROGRESS':
    case 'ASSIGNED':
      return {
        className: 'status-badge-in-progress border',
        textColor: 'text-yellow-700 dark:text-yellow-400'
      };
    case 'CREATED':
    case 'PENDING':
    case 'OPEN':
      return {
        className: 'status-badge-open border',
        textColor: 'text-blue-700 dark:text-blue-400'
      };
    case 'NEEDS_FEEDBACK':
      return {
        className: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20',
        textColor: 'text-purple-700 dark:text-purple-400'
      };
    default:
      return {
        className: 'status-badge-closed border',
        textColor: 'text-gray-700 dark:text-gray-400'
      };
  }
};

export const TicketCard = ({ ticket, onClick }) => {
  const priorityConfig = getPriorityConfig(ticket.priority);
  const statusConfig = getStatusConfig(ticket.status);
  const PriorityIcon = priorityConfig.icon;

  return (
    <Card
      className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/30 group relative overflow-hidden"
      onClick={() => onClick && onClick(ticket)}
    >
      {/* Priority indicator bar */}
      <div className={`absolute top-0 left-0 w-full h-1 ${
        ticket.priority?.toUpperCase() === 'CRITICAL' ? 'bg-red-500' :
        ticket.priority?.toUpperCase() === 'HIGH' ? 'bg-orange-500' :
        ticket.priority?.toUpperCase() === 'MEDIUM' ? 'bg-blue-500' : 'bg-gray-400'
      }`} />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                {ticket.id || ticket.ticketUid}
              </CardTitle>
              <div className="flex items-center gap-1">
                <PriorityIcon className={`h-3 w-3 ${priorityConfig.color}`} />
                <Badge variant={priorityConfig.variant} className={`${priorityConfig.className} text-xs`}>
                  {ticket.priority}
                </Badge>
              </div>
            </div>
            
            <Badge className={`${statusConfig.className} text-xs font-medium`}>
              {ticket.status?.replace(/_/g, ' ')}
            </Badge>
            
            <CardDescription className="line-clamp-2 text-sm leading-relaxed">
              {ticket.title}
            </CardDescription>
          </div>
          
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0">
        {ticket.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {ticket.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
          </div>
          
          {ticket.slaRemaining && (
            <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-md">
              <AlertCircle className="h-3 w-3" />
              <span>SLA: {ticket.slaRemaining}</span>
            </div>
          )}
          
          {ticket.assignedTo && ticket.assignedTo.length > 0 && (
            <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-md">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{ticket.assignedTo[0].name}</span>
            </div>
          )}
        </div>
        
        {(ticket.category || ticket.subCategory) && (
          <div className="flex gap-2 pt-2 border-t border-border/50">
            {ticket.category && (
              <Badge variant="outline" className="text-xs bg-background hover:bg-muted/50 transition-colors">
                {ticket.category?.replace(/_/g, ' ')}
              </Badge>
            )}
            {ticket.subCategory && (
              <Badge variant="outline" className="text-xs bg-background hover:bg-muted/50 transition-colors">
                {ticket.subCategory}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
