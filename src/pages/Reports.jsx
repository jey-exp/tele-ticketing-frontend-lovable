import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import apiClient from '@/services/api';
import { useUser } from '@/contexts/UserContext';
import { StatsCard } from '@/components/StatsCard';

const COLORS = ['#DC2626', '#F97316', '#F59E0B', '#10B981', '#059669'];

const Reports = () => {
  const { user } = useUser();
  const [ticketVolume, setTicketVolume] = useState([]);
  const [avgResolutionTime, setAvgResolutionTime] = useState(0);
  const [satisfactionScores, setSatisfactionScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [volumeRes, resolutionRes, satisfactionRes] = await Promise.all([
          apiClient.get('/reports/ticket-volume'),
          apiClient.get('/reports/resolution-time'),
          apiClient.get('/reports/satisfaction-scores'),
        ]);

        setTicketVolume(volumeRes.data);
        setAvgResolutionTime(resolutionRes.data.averageResolutionHours);
        
        const satData = satisfactionRes.data.map(item => ({
          name: `${item.rating} Star(s)`,
          value: item.count,
          rating: item.rating, // We keep this for the color mapping
        }));
        setSatisfactionScores(satData);

      } catch (err) {
        console.error("Failed to fetch report data:", err);
        setError("Could not load executive reports.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchReportData();
    }
  }, [user]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (error) {
    return <div className="container mx-auto p-6 text-center text-red-500"><AlertTriangle className="mx-auto h-8 w-8 mb-2" />{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
      <p className="text-muted-foreground mt-1">Key performance indicators for the last 30 days.</p>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard
          title="Avg. Resolution Time"
          value={`${avgResolutionTime.toFixed(1)} hours`}
          icon={Clock}
        />
        <StatsCard
          title="Total Tickets (Last 30d)"
          value={ticketVolume.reduce((acc, cur) => acc + cur.value, 0)}
          icon={CheckCircle2}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Ticket Volume Report */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Volume (Last 30 Days)</CardTitle>
          </CardHeader>
          {/* Dr. X's Fix: Replaced className="h-[300px]" with a direct inline style. */}
          <CardContent style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketVolume}>
                <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Tickets Created" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Satisfaction Score Report */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Satisfaction Scores</CardTitle>
          </CardHeader>
          {/* Dr. X's Fix: Replaced className="h-[300px]" with a direct inline style. */}
          <CardContent style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={satisfactionScores}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name} (${entry.value})`}
                >
                  {satisfactionScores.map((entry, index) => (
                    // The 'rating' field in our transformed data is used here
                    <Cell key={`cell-${index}`} fill={COLORS[entry.rating - 1]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;