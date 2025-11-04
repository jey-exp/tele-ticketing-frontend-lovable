import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketCard } from '@/components/TicketCard';
import { TicketDetailModal } from '@/components/TicketDetailModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import apiClient from '@/services/api';
import { ROLES } from '../config/rolesConfig';

const STATUS_OPTIONS = [
  { value: 'CREATED', label: 'Created' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'NEEDS_TRIAGING', label: 'Needs Triage' },
  { value: 'REOPENED', label: 'Reopened' },
];

const MyTickets = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);
      
      let endpoint = '';
      if (user.role === ROLES.CUSTOMER) {
        endpoint = '/customer/tickets/active';
      } else if (user.role === ROLES.AGENT) {
        endpoint = '/agent/tickets/active';
      } else {
        setError("This page is not available for your role.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(endpoint);
        setTickets(response.data);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
        setError("Could not load your tickets. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesSearch =
        ticket.ticketUid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [tickets, statusFilter, searchQuery]);

  // Dr. X's Fix 2: The click handler now extracts and sets only the ticket's ID.
  const handleCardClick = (ticket) => {
    setSelectedTicketId(ticket.id);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          My Tickets
        </h1>
        <p className="text-lg text-muted-foreground">
          View and track all your active tickets
        </p>
      </div>

      {/* Enhanced Filters */}
      <Card className="p-6 bg-gradient-to-r from-card to-card/50 border-0 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Ticket ID or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border/50 focus:border-primary/50 transition-all duration-200"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-[200px] bg-background border-border/50 focus:border-primary/50">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Results counter */}
          <div className="flex items-center text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
            <span className="font-medium">{filteredTickets.length}</span>
            <span className="ml-1">
              {filteredTickets.length === 1 ? 'ticket' : 'tickets'}
            </span>
          </div>
        </div>
      </Card>

      {/* Tickets Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your tickets...</p>
        </div>
      ) : error ? (
        <Card className="p-8 text-center border-destructive/20 bg-destructive/5">
          <div className="text-destructive text-lg font-semibold mb-2">
            {error}
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </Card>
      ) : filteredTickets.length === 0 ? (
        <Card className="p-12 text-center bg-gradient-to-br from-muted/20 to-muted/10 border-0">
          <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-6">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No matching tickets' : 'No active tickets'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'You have no active tickets at the moment.'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button 
              onClick={() => navigate('/new-ticket')}
              className="btn-gradient"
            >
              Create Your First Ticket
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTickets.map((ticket) => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket} 
              onClick={() => handleCardClick(ticket)} 
            />
          ))}
        </div>
      )}

      {/* Dr. X's Fix 3: The modal is now correctly wired to the ID-based state. */}
      <TicketDetailModal
        ticketId={selectedTicketId}
        open={!!selectedTicketId}
        onOpenChange={(isOpen) => !isOpen && setSelectedTicketId(null)}
      />
    </div>
  );
};

export default MyTickets; 