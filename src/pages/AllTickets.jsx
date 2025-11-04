import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TicketDetailModal } from '@/components/TicketDetailModal';
import { Loader2, X } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import apiClient from '@/services/api';
import { format } from 'date-fns';

const statusOptions = [
  { value: 'CREATED', label: 'Created' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'FIXED', label: 'Fixed' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'REOPENED', label: 'Reopened' },
];

const AllTickets = () => {
  const { user } = useUser();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the filter dropdowns' data
  const [teams, setTeams] = useState([]);
  const [cities, setCities] = useState([]);

  // State for the selected filter values
  const [filters, setFilters] = useState({
    teamId: '',
    city: '',
    sla: '', // 'atRisk' or 'breached'
  });

  // State for the ticket detail modal
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Fetch data for the filter dropdowns on component mount
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [teamsRes, citiesRes] = await Promise.all([
          apiClient.get('/teams'),
          apiClient.get('/users/cities'),
        ]);
        setTeams(teamsRes.data);
        setCities(citiesRes.data);
      } catch (err) {
        console.error("Failed to load filter data:", err);
        setError("Could not load filter options.");
      }
    };
    if (user) {
      fetchFilterData();
    }
  }, [user]);
  
  // Fetch tickets whenever the filters change
  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.teamId) params.append('teamId', filters.teamId);
        if (filters.city) params.append('city', filters.city);
        if (filters.sla === 'atRisk') params.append('slaAtRisk', 'true');
        if (filters.sla === 'breached') params.append('slaBreached', 'true');

        const response = await apiClient.get(`/manager/tickets?${params.toString()}`);
        setTickets(response.data);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
        setError("Could not load tickets.");
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      fetchTickets();
    }
  }, [user, filters]);
  
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };
  
  const clearFilters = () => {
    setFilters({ teamId: '', city: '', sla: '' });
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">All Tickets</h1>
      
      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <Select value={filters.teamId} onValueChange={(value) => handleFilterChange('teamId', value)}>
            <SelectTrigger><SelectValue placeholder="Filter by Team..." /></SelectTrigger>
            <SelectContent>
              {teams.map(team => <SelectItem key={team.id} value={team.id.toString()}>{team.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
            <SelectTrigger><SelectValue placeholder="Filter by Location..." /></SelectTrigger>
            <SelectContent>
              {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.sla} onValueChange={(value) => handleFilterChange('sla', value)}>
            <SelectTrigger><SelectValue placeholder="Filter by SLA..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="atRisk">At Risk</SelectItem>
              <SelectItem value="breached">Breached</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" onClick={clearFilters}><X className="mr-2 h-4 w-4" /> Clear</Button>
        </CardContent>
      </Card>
      
      {/* Ticket Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length > 0 ? tickets.map(ticket => (
                  <TableRow key={ticket.id} className="cursor-pointer" onClick={() => setSelectedTicketId(ticket.id)}>
                    <TableCell className="font-mono">{ticket.ticketUid}</TableCell>
                    <TableCell className="font-medium max-w-sm truncate">{ticket.title}</TableCell>
                    <TableCell><Badge>{ticket.status}</Badge></TableCell>
                    <TableCell>{format(new Date(ticket.createdAt), 'PP')}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center">No tickets match the current filters.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TicketDetailModal
        ticketId={selectedTicketId}
        open={!!selectedTicketId}
        onOpenChange={(isOpen) => !isOpen && setSelectedTicketId(null)}
      />
    </div>
  );
};

export default AllTickets;