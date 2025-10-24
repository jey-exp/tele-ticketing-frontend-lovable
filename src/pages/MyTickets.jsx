import { useState } from 'react';
import { TicketCard } from '@/components/TicketCard';
import { TicketDetailModal } from '@/components/TicketDetailModal';
import { getActiveTickets, TICKET_STATUS } from '@/data/mockTickets';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const MyTickets = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeTickets = getActiveTickets();

  // Filter tickets
  const filteredTickets = activeTickets.filter((ticket) => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesSearch =
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCardClick = (ticket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
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
            placeholder="Search tickets by ID, title, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={TICKET_STATUS.PENDING}>Pending</SelectItem>
            <SelectItem value={TICKET_STATUS.IN_PROGRESS}>In Progress</SelectItem>
            <SelectItem value={TICKET_STATUS.NEEDS_FEEDBACK}>Needs Feedback</SelectItem>
            <SelectItem value={TICKET_STATUS.AWAITING_FIELD}>Awaiting Field Assignment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets Grid */}
      {filteredTickets.length === 0 ? (
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
            <TicketCard key={ticket.id} ticket={ticket} onClick={handleCardClick} />
          ))}
        </div>
      )}

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
      />
    </div>
  );
};

export default MyTickets;
