import { useState, useEffect, useMemo } from 'react';
import { TicketCard } from '@/components/TicketCard';
import { TicketDetailModal } from '@/components/TicketDetailModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import apiClient from '@/services/api';

// Dr. X's Note: These values now EXACTLY match our backend TicketStatus enum.
// This is the single source of truth for filtering.
const STATUS_OPTIONS = [
  { value: 'CREATED', label: 'Created' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'NEEDS_TRIAGING', label: 'Needs Triage' },
  { value: 'REOPENED', label: 'Reopened' },
];

const MyTickets = () => {
  const { user } = useUser();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch active tickets when the component mounts and a user is present.
  useEffect(() => {
    const fetchActiveTickets = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/customer/tickets/active');
        setTickets(response.data);
      } catch (err) {
        console.error("Failed to fetch active tickets:", err);
        setError("Could not load your tickets. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchActiveTickets();
    }
  }, [user]); // This effect depends on the user object.

  // Dr. X's Note: useMemo is a performance optimization.
  // This filtering logic will only re-run when the source data or filters change.
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesSearch =
        ticket.ticketUid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [tickets, statusFilter, searchQuery]);

  const handleCardClick = (ticket) => {
    console.log("Ticket : ", ticket);
    
    setSelectedTicket(ticket);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tickets</h1>
        <p className="text-muted-foreground mt-1">View and track all your active tickets</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Ticket ID or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tickets Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== 'all'
              ? 'No tickets match your filters.'
              : 'You have no active tickets at the moment.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} onClick={() => handleCardClick(ticket)} />
          ))}
        </div>
      )}

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        open={!!selectedTicket}
        onOpenChange={(isOpen) => !isOpen && setSelectedTicket(null)}
      />
    </div>
  );
};

export default MyTickets;