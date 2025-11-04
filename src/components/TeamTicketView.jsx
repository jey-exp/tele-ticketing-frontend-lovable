import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketCard } from '@/components/TicketCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import apiClient from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const TeamTicketView = ({ title, description, apiEndpoint }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New state to track if the team needs to be set up.
  const [teamNotSetup, setTeamNotSetup] = useState(false);

  // State for the reassignment modal
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [newAssigneeIds, setNewAssigneeIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user || !apiEndpoint) return;
      setIsLoading(true);
      setError(null);
      setTeamNotSetup(false);

      try {
        const response = await apiClient.get(apiEndpoint);
        setTickets(response.data);
      } catch (err) {
        // Check for the specific error from the backend indicating no team is set up.
        if (err.response?.status === 404 || err.response?.status === 400) {
            setTeamNotSetup(true);
        } else {
            setError("Failed to load tickets. Please try again later.");
        }
        console.error("Error fetching tickets:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [user, apiEndpoint]);
  
  const handleCardClick = async (ticket) => {
    setSelectedTicketId(ticket.id);
    setIsModalOpen(true);
    
    // Pre-fetch current assignees and team members for the modal.
    try {
        // Fetch full ticket details to get current assignees.
        const ticketDetailsRes = await apiClient.get(`/tickets/${ticket.id}`);
        setNewAssigneeIds(ticketDetailsRes.data.assignedTo.map(user => user.id));

        // Fetch team members if not already loaded.
        if (teamMembers.length === 0) {
            const teamMembersRes = await apiClient.get('/team-lead/team/members');
            setTeamMembers(teamMembersRes.data);
        }
    } catch {
        toast.error("Failed to load assignment data.");
        setIsModalOpen(false); // Close modal if data fails to load
    }
  };
  
  const handleReassign = async () => {
    setIsSubmitting(true);
    try {
      const payload = { newAssigneeUserIds: newAssigneeIds };
      await apiClient.patch(`/team-lead/tickets/${selectedTicketId}/reassign`, payload);
      toast.success("Ticket has been successfully reassigned.");
      setIsModalOpen(false);
      fetchTickets(); // Refresh the list of tickets.
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reassign ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Conditional render for the "Team not set up" state.
  if (teamNotSetup) {
      return (
          <div className="container mx-auto p-6 text-center">
              <Card className="max-w-md mx-auto mt-12">
                  <CardHeader>
                      <CardTitle>Team Setup Required</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <p className="text-muted-foreground">You must set up your team before you can view assigned tickets.</p>
                      <Button onClick={() => navigate('/manage-team')}>Go to Team Management</Button>
                  </CardContent>
              </Card>
          </div>
      );
  }

  const renderContent = () => {
    if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
    if (tickets.length === 0) return <p className="text-center py-12 text-muted-foreground">No tickets to display in this view.</p>;
    
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} onClick={() => handleCardClick(ticket)} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      {renderContent()}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Ticket</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label>Assign Engineer(s) to Ticket</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  {newAssigneeIds.length > 0 ? `${newAssigneeIds.length} engineer(s) selected` : 'Select engineers...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Search team members..." />
                  <CommandList>
                    <CommandEmpty>No members found.</CommandEmpty>
                    <CommandGroup>
                      {teamMembers.map((member) => (
                        <CommandItem key={member.id} value={member.fullName} onSelect={() => {
                            setNewAssigneeIds(prev => prev.includes(member.id) ? prev.filter(id => id !== member.id) : [...prev, member.id]);
                        }}>
                          <Check className={cn('mr-2 h-4 w-4', newAssigneeIds.includes(member.id) ? 'opacity-100' : 'opacity-0')} />
                          {member.fullName} ({member.username})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleReassign} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reassigning...</> : 'Reassign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
  
  export default TeamTicketView;