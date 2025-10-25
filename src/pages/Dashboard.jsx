import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, CheckCircle2, MessageSquare, Plus, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockTickets, TICKET_STATUS, getAgentTickets } from '@/data/mockTickets';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@/contexts/UserContext';
import { ROLES } from '@/config/rolesConfig';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  // Get tickets based on user role
  const userTickets = user.role === ROLES.AGENT 
    ? getAgentTickets(user.id) 
    : mockTickets.filter(t => t.customer?.id === user.id);

  // Calculate stats based on user's tickets
  const activeTickets = userTickets.filter(
    (t) => t.status !== TICKET_STATUS.RESOLVED
  ).length;
  
  const resolvedTickets = userTickets.filter(
    (t) => t.status === TICKET_STATUS.RESOLVED
  ).length;
  
  const feedbackRequiredTickets = userTickets.filter(
    (t) => t.status === TICKET_STATUS.NEEDS_FEEDBACK
  ).length;

  // Get recent activities (last 5 ticket logs from user's tickets)
  const recentActivities = userTickets
    .flatMap((ticket) =>
      ticket.logs.map((log) => ({
        ...log,
        ticketId: ticket.id,
        ticketTitle: ticket.title,
      }))
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  const getButtonText = () => {
    return user.role === ROLES.AGENT ? 'Create a Ticket' : 'Raise a Ticket';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your tickets and system status
          </p>
        </div>
        <Button onClick={() => navigate('/new-ticket')} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          {getButtonText()}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Active Tickets"
          value={activeTickets}
          icon={Ticket}
          linkTo="/my-tickets"
        />
        <StatsCard
          title="Resolved Tickets"
          value={resolvedTickets}
          icon={CheckCircle2}
        />
        <StatsCard
          title="Action Required"
          value={feedbackRequiredTickets}
          icon={MessageSquare}
          linkTo="/feedback"
          showArrowOnHover={true}
        />
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest updates on your tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  {index !== recentActivities.length - 1 && (
                    <div className="w-px h-full bg-border mt-1" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{activity.ticketId}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground line-clamp-1">
                      {activity.ticketTitle}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.update}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
