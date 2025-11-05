import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, CheckCircle2, MessageSquare, Plus, Clock, Loader2, ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@/contexts/UserContext';
import { ROLES } from '@/config/rolesConfig';
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
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'created':
        return <Plus className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'created':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'resolved':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'comment':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-center text-red-600">
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, <span className="font-medium text-foreground">{user?.username}</span>! Here's your overview.
          </p>
        </div>
        {(user?.role === ROLES.CUSTOMER || user?.role === ROLES.AGENT) && (
          <Button onClick={() => navigate(user.role === ROLES.CUSTOMER ? '/new-ticket' : '/create-ticket')} size="lg" className="shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            {user.role === ROLES.CUSTOMER ? 'Raise a Ticket' : 'Create a Ticket'}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard title="Active Tickets" value={stats.activeTickets} icon={Ticket} linkTo="/my-tickets" />
        <StatsCard title="Resolved Tickets" value={stats.resolvedTickets} icon={CheckCircle2} />
        {user?.role === ROLES.CUSTOMER && (
          <StatsCard title="Action Required" value={stats.feedbackRequiredTickets} icon={MessageSquare} linkTo="/feedback" showArrowOnHover />
        )}
      </div>

      {/* Recent Activities */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Recent Activities</CardTitle>
              <CardDescription className="mt-1">Latest updates on your tickets</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/notifications')} className="gap-2">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground font-medium">No recent activities</p>
              <p className="text-sm text-muted-foreground mt-1">Your activity feed will appear here</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.activityId} 
                  className="p-4 transition-colors group"
                >
                  <div className="flex gap-4">
                    {/* Activity Icon */}
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full border flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono text-xs">
                          {activity.ticketUid}
                        </Badge>
                        <span className="text-sm font-medium text-foreground truncate transition-colors">
                          {activity.ticketTitle}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
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