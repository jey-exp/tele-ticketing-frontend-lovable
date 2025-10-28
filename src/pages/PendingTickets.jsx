import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { ROLES } from '@/config/rolesConfig';
import { TicketCard } from '@/components/TicketCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { mockTickets, TICKET_STATUS, PRIORITY, SEVERITY, getUnassignedTickets, getReopenedTickets, getTicketsAwaitingField, getFieldVisitCompleteTickets, getTicketsByEngineer } from '@/data/mockTickets';
import { mockEngineers, searchEngineers } from '@/data/mockEngineers';
import { format, formatDistanceToNow } from 'date-fns';
import { Clock, AlertTriangle, User, Package, Calendar, Tag, Users, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const PendingTickets = () => {
  const { user } = useUser();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedPriority, setEditedPriority] = useState('');
  const [editedSeverity, setEditedSeverity] = useState('');
  const [selectedEngineers, setSelectedEngineers] = useState([]);
  const [updateText, setUpdateText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [engineerSearchOpen, setEngineerSearchOpen] = useState(false);
  const [engineerSearch, setEngineerSearch] = useState('');

  // Get tickets based on role
  const getTicketsForRole = () => {
    if (user.role === ROLES.TRIAGE_OFFICER) {
      const unassigned = getUnassignedTickets();
      const awaitingField = getTicketsAwaitingField();
      const fieldComplete = getFieldVisitCompleteTickets();
      
      // Combine and sort by priority then creation time
      const allPending = [...unassigned, ...awaitingField, ...fieldComplete].sort((a, b) => {
        const priorityOrder = { [PRIORITY.HIGH]: 0, [PRIORITY.MEDIUM]: 1, [PRIORITY.LOW]: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      
      return allPending;
    } else if (user.role === ROLES.FIELD_ENGINEER) {
      // For demo purposes, show tickets assigned to Diana Prince (ENG004)
      return getTicketsByEngineer('ENG004').filter(
        ticket => ticket.status === TICKET_STATUS.FIELD_VISIT_SCHEDULED || 
                  ticket.status === TICKET_STATUS.IN_PROGRESS
      );
    } else if (user.role === ROLES.L1_ENGINEER || user.role === ROLES.NOC_ENGINEER) {
      // For other engineers, show their assigned tickets
      return mockTickets.filter(
        ticket => ticket.assignedTo.some(eng => eng.name === user.name) &&
                  ticket.status !== TICKET_STATUS.RESOLVED &&
                  ticket.status !== TICKET_STATUS.NEEDS_FEEDBACK
      );
    }
    
    return [];
  };

  const pendingTickets = getTicketsForRole();
  const reopenedTickets = getReopenedTickets();

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setEditedPriority(ticket.priority);
    setEditedSeverity(ticket.severity);
    setSelectedEngineers(ticket.assignedTo.map(eng => eng.id));
    setNewStatus(ticket.status);
    setIsModalOpen(true);
  };

  const handleSaveChanges = () => {
    if (user.role === ROLES.TRIAGE_OFFICER) {
      toast.success('Ticket updated successfully', {
        description: `Priority: ${editedPriority}, Severity: ${editedSeverity}, Assigned to ${selectedEngineers.length} engineer(s)`,
      });
    } else if (user.role === ROLES.FIELD_ENGINEER || user.role === ROLES.L1_ENGINEER || user.role === ROLES.NOC_ENGINEER) {
      if (updateText.trim()) {
        toast.success('Update added to ticket', {
          description: `Your update has been logged to ticket #${selectedTicket.id}`,
        });
        setUpdateText('');
      }
      if (newStatus !== selectedTicket.status) {
        const statusMessage = newStatus === TICKET_STATUS.AWAITING_FIELD 
          ? 'Field visit requested. Ticket sent to Triage Officer for assignment.'
          : `Status changed to: ${newStatus}`;
        toast.success('Ticket status updated', {
          description: statusMessage,
        });
      }
    }
    setIsModalOpen(false);
  };

  const toggleEngineer = (engineerId) => {
    setSelectedEngineers(prev =>
      prev.includes(engineerId)
        ? prev.filter(id => id !== engineerId)
        : [...prev, engineerId]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case PRIORITY.HIGH:
        return 'destructive';
      case PRIORITY.MEDIUM:
        return 'default';
      case PRIORITY.LOW:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case TICKET_STATUS.RESOLVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case TICKET_STATUS.IN_PROGRESS:
      case TICKET_STATUS.FIELD_VISIT_SCHEDULED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case TICKET_STATUS.PENDING:
      case TICKET_STATUS.AWAITING_FIELD:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case TICKET_STATUS.NEEDS_FEEDBACK:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case TICKET_STATUS.REOPENED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case TICKET_STATUS.FIELD_VISIT_COMPLETE:
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredEngineers = searchEngineers(engineerSearch);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Pending Tickets</h1>
        <p className="text-muted-foreground">
          {user.role === ROLES.TRIAGE_OFFICER
            ? 'Review, prioritize, and assign tickets to engineers'
            : 'Your assigned tickets requiring action'}
        </p>
      </div>

      {user.role === ROLES.TRIAGE_OFFICER ? (
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Tickets ({pendingTickets.length})</TabsTrigger>
            <TabsTrigger value="reopened">Reopened Tickets ({reopenedTickets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingTickets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No pending tickets at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onClick={() => handleTicketClick(ticket)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reopened" className="space-y-4">
            {reopenedTickets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No reopened tickets.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reopenedTickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleTicketClick(ticket)}
                    >
                      <TableCell className="font-mono">{ticket.id}</TableCell>
                      <TableCell className="font-medium">{ticket.title}</TableCell>
                      <TableCell>{ticket.customer.name}</TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ticket.logs.length > 0 &&
                          formatDistanceToNow(new Date(ticket.logs[ticket.logs.length - 1].timestamp), {
                            addSuffix: true,
                          })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4">
          {pendingTickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No pending tickets assigned to you.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => handleTicketClick(ticket)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ticket Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-3xl h-auto max-h-[85vh] overflow-hidden flex flex-col">
          {selectedTicket && (
            <>
              <div className="overflow-y-auto flex-1 -mx-6 px-6">
                <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl">
                    {selectedTicket.id} - {selectedTicket.title}
                  </DialogTitle>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </Badge>
                  <Badge className={getStatusColor(selectedTicket.status)}>
                    {selectedTicket.status}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{selectedTicket.description}</p>
                </div>

                {/* Ticket Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Created</span>
                    </div>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedTicket.createdAt), 'PPp')}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>SLA Duration</span>
                    </div>
                    <p className="text-sm font-medium">{selectedTicket.slaDuration}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Tag className="h-4 w-4" />
                      <span>Category</span>
                    </div>
                    <p className="text-sm font-medium">
                      {selectedTicket.category} / {selectedTicket.subCategory}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Severity</span>
                    </div>
                    <p className="text-sm font-medium">{selectedTicket.severity}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Customer</span>
                    </div>
                    <p className="text-sm font-medium">{selectedTicket.customer.name}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Assigned To</span>
                    </div>
                    <p className="text-sm font-medium">
                      {selectedTicket.assignedTo.length > 0
                        ? selectedTicket.assignedTo.map((eng) => eng.name).join(', ')
                        : 'Unassigned'}
                    </p>
                  </div>
                </div>

                {/* Triage Officer Actions */}
                {user.role === ROLES.TRIAGE_OFFICER && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Ticket Management</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={editedPriority} onValueChange={setEditedPriority}>
                          <SelectTrigger id="priority">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={PRIORITY.HIGH}>High</SelectItem>
                            <SelectItem value={PRIORITY.MEDIUM}>Medium</SelectItem>
                            <SelectItem value={PRIORITY.LOW}>Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="severity">Severity</Label>
                        <Select value={editedSeverity} onValueChange={setEditedSeverity}>
                          <SelectTrigger id="severity">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={SEVERITY.CRITICAL}>Critical</SelectItem>
                            <SelectItem value={SEVERITY.MAJOR}>Major</SelectItem>
                            <SelectItem value={SEVERITY.MINOR}>Minor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Assign Engineer(s)</Label>
                      <Popover open={engineerSearchOpen} onOpenChange={setEngineerSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={engineerSearchOpen}
                            className="w-full justify-between"
                          >
                            {selectedEngineers.length > 0
                              ? `${selectedEngineers.length} engineer(s) selected`
                              : 'Select engineers...'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search engineers..."
                              value={engineerSearch}
                              onValueChange={setEngineerSearch}
                            />
                            <CommandList>
                              <CommandEmpty>No engineer found.</CommandEmpty>
                              <CommandGroup>
                                {filteredEngineers.map((engineer) => (
                                  <CommandItem
                                    key={engineer.id}
                                    value={engineer.id}
                                    onSelect={() => toggleEngineer(engineer.id)}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        selectedEngineers.includes(engineer.id)
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{engineer.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {engineer.type}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}

                {/* Field Engineer Actions */}
                {user.role === ROLES.FIELD_ENGINEER && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Field Actions</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="update">Add Update</Label>
                      <Textarea
                        id="update"
                        placeholder="Describe the work performed, findings, or next steps..."
                        value={updateText}
                        onChange={(e) => setUpdateText(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Change Status</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TICKET_STATUS.FIELD_VISIT_SCHEDULED}>
                            Field Visit Scheduled
                          </SelectItem>
                          <SelectItem value={TICKET_STATUS.IN_PROGRESS}>
                            In Progress
                          </SelectItem>
                          <SelectItem value={TICKET_STATUS.FIELD_VISIT_COMPLETE}>
                            Field Visit Complete
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* L1 & NOC Engineer Actions */}
                {(user.role === ROLES.L1_ENGINEER || user.role === ROLES.NOC_ENGINEER) && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Engineer Actions</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="update">Add Update</Label>
                      <Textarea
                        id="update"
                        placeholder="Describe your progress, findings, or troubleshooting steps..."
                        value={updateText}
                        onChange={(e) => setUpdateText(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Change Status</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TICKET_STATUS.IN_PROGRESS}>
                            In Progress
                          </SelectItem>
                          <SelectItem value={TICKET_STATUS.RESOLVED}>
                            Resolved
                          </SelectItem>
                          <SelectItem value={TICKET_STATUS.AWAITING_FIELD}>
                            Request Field Visit
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Activity Timeline */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Activity Timeline
                  </h3>
                  <div className="space-y-3">
                    {selectedTicket.logs.map((log, index) => (
                      <div key={index} className="flex gap-3 text-sm">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          {index < selectedTicket.logs.length - 1 && (
                            <div className="w-px h-full bg-border mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-3">
                          <p className="font-medium">{log.update}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                     ))}
                  </div>
                </div>
              </div>
              </div>

              <DialogFooter className="-mx-6 px-6 pt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={handleSaveChanges}>
                  {user.role === ROLES.TRIAGE_OFFICER ? 'Save Changes' : 
                   (user.role === ROLES.L1_ENGINEER || user.role === ROLES.NOC_ENGINEER) && newStatus === TICKET_STATUS.AWAITING_FIELD ? 'Request Field Visit' :
                   'Save Update'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingTickets;
