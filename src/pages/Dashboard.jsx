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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.username}! Here's your overview.
          </p>
        </div>
        {/* Only show the "Raise a Ticket" button for customers and agents */}
        {(user?.role === ROLES.CUSTOMER || user?.role === ROLES.AGENT) && (
          <Button onClick={() => navigate(user.role === ROLES.CUSTOMER ? '/new-ticket' : '/create-ticket')} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            {user.role === ROLES.CUSTOMER ? 'Raise a Ticket' : 'Create a Ticket'}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Active Tickets" value={stats.activeTickets} icon={Ticket} linkTo="/my-tickets" />
        <StatsCard title="Resolved Tickets" value={stats.resolvedTickets} icon={CheckCircle2} />
        {/* Only show "Action Required" to customers */}
        {user?.role === ROLES.CUSTOMER && (
          <StatsCard title="Action Required" value={stats.feedbackRequiredTickets} icon={MessageSquare} linkTo="/feedback" showArrowOnHover />
        )}
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates on your tickets</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/notifications')}>See all</Button>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No recent activities to show.</p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.activityId} className="flex gap-3 items-start">
                  {/* ... same rendering logic as before ... */}
                  <div className="flex flex-col items-center"><div className="h-2 w-2 rounded-full bg-primary mt-2" /><div className="w-px h-full bg-border mt-1" /></div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{activity.ticketUid}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground line-clamp-1">{activity.ticketTitle}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
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