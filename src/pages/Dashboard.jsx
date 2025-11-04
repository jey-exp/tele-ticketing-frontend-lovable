import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, CheckCircle2, MessageSquare, Plus, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@/contexts/UserContext';
import { ROLES } from '@/config/rolesConfig'; // We need this to check the role
import apiClient from '@/services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [stats, setStats] = useState({ activeTickets: 0, resolvedTickets: 0, feedbackRequiredTickets: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return; // Don't fetch if there's no user

      setIsLoading(true);
      setError(null);

      try {
        // Dr. X's Note: This is the core logic change. We determine the API path based on the user's role.
        const dashboardPath = user.role === ROLES.CUSTOMER
          ? '/customer/dashboard'
          : user.role === ROLES.AGENT
          ? '/agent/dashboard'
          : null;

        if (!dashboardPath) {
          throw new Error("Dashboard not available for this role.");
        }

        const [statsResponse, activitiesResponse] = await Promise.all([
          apiClient.get(`${dashboardPath}/stats`),
          apiClient.get(`${dashboardPath}/recent-activities`),
        ]);

        setStats(statsResponse.data);
        setRecentActivities(activitiesResponse.data);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Could not load dashboard. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (error) {
    return <div className="container mx-auto p-6 text-center text-red-500">{error}</div>;
  }

  // The rest of the component's JSX is identical to the previous version,
  // as it just renders the data from the 'stats' and 'recentActivities' state.
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user?.username}!</span> Here's your overview.
          </p>
        </div>
        {/* Only show the "Raise a Ticket" button for customers and agents */}
        {(user?.role === ROLES.CUSTOMER || user?.role === ROLES.AGENT) && (
          <Button 
            onClick={() => navigate(user.role === ROLES.CUSTOMER ? '/new-ticket' : '/create-ticket')} 
            size="lg"
            className="btn-gradient group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
            {user.role === ROLES.CUSTOMER ? 'Raise a Ticket' : 'Create a Ticket'}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <StatsCard 
          title="Active Tickets" 
          value={stats.activeTickets} 
          icon={Ticket} 
          linkTo="/my-tickets"
          color="info"
          subtitle="Currently open"
          trend={{ type: 'up', value: '+12%' }}
        />
        <StatsCard 
          title="Resolved Tickets" 
          value={stats.resolvedTickets} 
          icon={CheckCircle2}
          color="success"
          subtitle="All time"
          trend={{ type: 'up', value: '+8%' }}
        />
        {/* Only show "Action Required" to customers */}
        {user?.role === ROLES.CUSTOMER && (
          <StatsCard 
            title="Action Required" 
            value={stats.feedbackRequiredTickets} 
            icon={MessageSquare} 
            linkTo="/feedback" 
            showArrowOnHover
            color={stats.feedbackRequiredTickets > 0 ? "warning" : "default"}
            subtitle="Needs feedback"
          />
        )}
        {/* Show different third card for agents */}
        {user?.role === ROLES.AGENT && (
          <StatsCard 
            title="Pending Assignments" 
            value={stats.pendingAssignments || 0} 
            icon={Clock} 
            linkTo="/pending-tickets"
            color={stats.pendingAssignments > 0 ? "warning" : "default"}
            subtitle="Awaiting assignment"
          />
        )}
      </div>

      {/* Recent Activities */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">Recent Activities</CardTitle>
            <CardDescription className="text-muted-foreground">
              Latest updates on your tickets
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/notifications')}
            className="hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          >
            See all
          </Button>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No recent activities to show.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Activities will appear here as tickets are updated.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={activity.activityId} className="group relative">
                  <div className="flex gap-4 items-start">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full border-2 border-background ${
                        index === 0 ? 'bg-primary shadow-lg shadow-primary/50' : 'bg-muted-foreground/30'
                      } group-hover:bg-primary transition-colors duration-200`} />
                      {index < recentActivities.length - 1 && (
                        <div className="w-px h-12 bg-border mt-2" />
                      )}
                    </div>
                    
                    {/* Activity content */}
                    <div className="flex-1 space-y-2 pb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">
                          {activity.ticketUid}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-sm text-foreground font-medium line-clamp-1">
                          {activity.ticketTitle}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;