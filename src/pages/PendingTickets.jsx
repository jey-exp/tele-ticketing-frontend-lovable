import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { ROLES } from '@/config/rolesConfig';
import { TicketCard } from '@/components/TicketCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Clock, AlertTriangle, User, Calendar, Tag, Users, Check, ChevronsUpDown, Loader2, MessageSquare, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import apiClient from '@/services/api';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


// Constants matching backend enums
const TICKET_STATUS = {
    ASSIGNED: 'ASSIGNED',
    IN_PROGRESS: 'IN_PROGRESS',
    NEEDS_TRIAGING: 'NEEDS_TRIAGING',
    FIXED: 'FIXED',
    REOPENED: 'REOPENED',
};
const PRIORITY = { HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW' };
const SEVERITY = { CRITICAL: 'CRITICAL', HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW', TRIVIAL: 'TRIVIAL' };
const ROLE_NAMES = {
    ROLE_FIELD_ENGINEER: 'Field Engineer',
    ROLE_NOC_ENGINEER: 'NOC Engineer',
    ROLE_L1_ENGINEER: 'L1 Engineer',
};

const PendingTickets = () => {
    const { user, isLoading: isUserLoading } = useUser();
    
    // State for data, loading, and errors
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assignableEngineers, setAssignableEngineers] = useState([]);

    // State for the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null); // Will hold full ticket details
    const [activityLogs, setActivityLogs] = useState([]); // State for the logs
    
    // State for form fields inside the modal
    const [editedPriority, setEditedPriority] = useState('');
    const [editedSeverity, setEditedSeverity] = useState('');
    const [selectedEngineerIds, setSelectedEngineerIds] = useState([]);
    const [updateText, setUpdateText] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [engineerSearchOpen, setEngineerSearchOpen] = useState(false);

    // State for the new AI Triage tab
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isAccepting, setIsAccepting] = useState(null); // Tracks which row is being submitted

    // Fetches the main list of tickets based on the user's role
    const fetchTickets = async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const endpoint = user.role === ROLES.TRIAGE_OFFICER ? '/triage/tickets/pending' : '/engineer/tickets/assigned';
            const response = await apiClient.get(endpoint);
            setTickets(response.data);
        } catch (err) {
            setError("Failed to load tickets. Please refresh the page.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetches the list of engineers for the assignment dropdown
    const fetchEngineers = async () => {
        if (user?.role === ROLES.TRIAGE_OFFICER) {
            try {
                const response = await apiClient.get('/users/engineers');
                setAssignableEngineers(response.data);
            } catch (err) {
                console.error("Failed to fetch engineers:", err);
                toast.error("Could not load list of engineers.");
            }
        }
    };

    useEffect(() => {
        if (user) {
            fetchTickets();
            fetchEngineers();
        }
    }, [user]);

    // Memoized derivation of tickets for the Triage Officer's manual tabs
    const { pendingTickets, reopenedTickets } = useMemo(() => {
        if (user?.role === ROLES.TRIAGE_OFFICER) {
            return {
                pendingTickets: tickets.filter(t => t.status !== TICKET_STATUS.REOPENED),
                reopenedTickets: tickets.filter(t => t.status === TICKET_STATUS.REOPENED),
            };
        }
        return { pendingTickets: tickets, reopenedTickets: [] };
    }, [tickets, user]);

    // Handles clicking a ticket card to open the manual triage modal
    const handleTicketClick = async (ticketSummary) => {
        setIsModalOpen(true);
        setIsModalLoading(true);
        setActivityLogs([]); // Clear previous logs
        try {
            // Fetch details and logs in parallel for performance
            const [detailsRes, logsRes] = await Promise.all([
                apiClient.get(`/tickets/${ticketSummary.id}`),
                apiClient.get(`/tickets/${ticketSummary.id}/logs`)
            ]);
            
            const fullTicketDetails = detailsRes.data;
            setSelectedTicket(fullTicketDetails);
            setActivityLogs(logsRes.data);
            
            // Pre-fill form state
            setEditedPriority(fullTicketDetails.priority || '');
            setEditedSeverity(fullTicketDetails.severity || '');
            setSelectedEngineerIds(fullTicketDetails.assignedTo?.map(eng => eng.id) || []);
            setNewStatus(fullTicketDetails.status);
            setUpdateText('');
            
        } catch (err) {
            toast.error("Failed to load ticket details.");
            setIsModalOpen(false);
        } finally {
            setIsModalLoading(false);
        }
    };

    // Handles the "Save Changes" action from the manual triage modal
    const handleSaveChanges = async () => {
        setIsSubmitting(true);
        try {
            let payload;
            let endpoint;

            if (user.role === ROLES.TRIAGE_OFFICER) {
                payload = {
                    priority: editedPriority,
                    severity: editedSeverity,
                    assignedToUserIds: selectedEngineerIds,
                };
                endpoint = `/triage/tickets/${selectedTicket.id}`;
            } else { // Engineer roles
                payload = {
                    newStatus: newStatus,
                    updateText: updateText,
                };
                endpoint = `/engineer/tickets/${selectedTicket.id}`;
            }

            await apiClient.patch(endpoint, payload);
            toast.success(`Ticket ${selectedTicket.ticketUid} has been updated.`);
            setIsModalOpen(false);
            fetchTickets(); // Refresh the main list
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update ticket.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fetches AI suggestions from the new endpoint
    const fetchAiSuggestions = async () => {
        setIsAiLoading(true);
        try {
            const response = await apiClient.get('/triage/tickets/ai-suggestions');
            // Map the response to a new state object that includes local UI state
            setAiSuggestions(response.data.map(suggestion => ({
                ...suggestion,
                // Set defaults for the UI dropdowns
                priority: suggestion.suggestedPriority,
                severity: suggestion.suggestedSeverity,
                assignedEngineerId: '', // User must select an engineer
            })));
        } catch (err) {
            toast.error("Failed to fetch AI suggestions.");
        } finally {
            setIsAiLoading(false);
        }
    };

    // Updates the local state for a single row in the AI table
    const handleSuggestionChange = (ticketId, field, value) => {
        setAiSuggestions(prev => prev.map(item => 
            item.ticketId === ticketId ? { ...item, [field]: value } : item
        ));
    };

    // Accepts and triages a single AI suggestion
    const handleAcceptSuggestion = async (suggestion) => {
        if (!suggestion.assignedEngineerId) {
            toast.error("Please assign an engineer before accepting.");
            return;
        }
        setIsAccepting(suggestion.ticketId);
        try {
            const payload = {
                priority: suggestion.priority,
                severity: suggestion.severity,
                assignedToUserIds: [suggestion.assignedEngineerId], // Send the selected engineer ID
            };
            await apiClient.patch(`/triage/tickets/${suggestion.ticketId}`, payload);
            toast.success(`Ticket ${suggestion.ticketUid} has been triaged.`);
            // Refresh both lists, as this ticket is now gone from both queues
            fetchAiSuggestions();
            fetchTickets();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to accept suggestion.");
        } finally {
            setIsAccepting(null);
        }
    };
    
    // Main component render logic
    if (isUserLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">My Work Queue</h1>
                <p className="text-muted-foreground">
                    {user.role === ROLES.TRIAGE_OFFICER
                        ? 'Review, prioritize, and assign tickets to engineers.'
                        : 'Your assigned tickets requiring action.'}
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : error ? (
                <div className="text-center py-12 text-red-500">{error}</div>
            ) : (
                <>
                    {/* Triage Officer View (Tabs) */}
                    {user.role === ROLES.TRIAGE_OFFICER ? (
                        <Tabs defaultValue="pending" className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="pending">Pending ({pendingTickets.length})</TabsTrigger>
                                <TabsTrigger value="reopened">Reopened ({reopenedTickets.length})</TabsTrigger>
                                <TabsTrigger value="ai-triage" onClick={fetchAiSuggestions}>
                                    <Wand2 className="h-4 w-4 mr-2" /> AI Triage
                                </TabsTrigger>
                            </TabsList>
                            
                            {/* Manual Pending Tab */}
                            <TabsContent value="pending">
                                {pendingTickets.length === 0 ? <p className="text-center py-12 text-muted-foreground">No tickets are pending assignment.</p> :
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {pendingTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} onClick={() => handleTicketClick(ticket)} />)}
                                    </div>}
                            </TabsContent>

                            {/* Manual Reopened Tab */}
                            <TabsContent value="reopened">
                                {reopenedTickets.length === 0 ? <p className="text-center py-12 text-muted-foreground">No reopened tickets.</p> :
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {reopenedTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} onClick={() => handleTicketClick(ticket)} />)}
                                    </div>}
                            </TabsContent>

                            {/* AI Triage Tab */}
                            <TabsContent value="ai-triage" className="space-y-4">
                                {isAiLoading ? (
                                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
                                ) : aiSuggestions.length === 0 ? (
                                    <p className="text-center py-12 text-muted-foreground">All tickets have been triaged.</p>
                                ) : (
                                    <Card>
                                        <CardContent className="p-0">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Ticket</TableHead>
                                                        <TableHead>Priority</TableHead>
                                                        <TableHead>Severity</TableHead>
                                                        <TableHead>AI Suggestion (Role)</TableHead>
                                                        <TableHead>Assign Engineer</TableHead>
                                                        <TableHead className="text-right">Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {aiSuggestions.map(item => (
                                                        <TableRow key={item.ticketId}>
                                                            <TableCell><div className="font-medium">{item.ticketUid}</div><div className="text-xs text-muted-foreground truncate max-w-xs">{item.title}</div></TableCell>
                                                            <TableCell>
                                                                <Select value={item.priority} onValueChange={(v) => handleSuggestionChange(item.ticketId, 'priority', v)}>
                                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                                    <SelectContent>{Object.values(PRIORITY).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Select value={item.severity} onValueChange={(v) => handleSuggestionChange(item.ticketId, 'severity', v)}>
                                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                                    <SelectContent>{Object.values(SEVERITY).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell><Badge variant="outline">{ROLE_NAMES[item.suggestedRole] || item.suggestedRole}</Badge></TableCell>
                                                            <TableCell>
                                                                <Select value={item.assignedEngineerId} onValueChange={(v) => handleSuggestionChange(item.ticketId, 'assignedEngineerId', v)}>
                                                                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                                                    <SelectContent>
                                                                        {assignableEngineers.map(e => <SelectItem key={e.id} value={e.id}>{e.fullName}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button size="sm" onClick={() => handleAcceptSuggestion(item)} disabled={isAccepting === item.ticketId}>
                                                                    {isAccepting === item.ticketId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        </Tabs>
                    ) : (
                        /* Engineer View (Single Grid) */
                        <div className="space-y-4">
                            {tickets.length === 0 ? <p className="text-center py-12 text-muted-foreground">No pending tickets assigned to you.</p> :
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} onClick={() => handleTicketClick(ticket)} />)}
                                </div>}
                        </div>
                    )}
                </>
            )}
            
            {/* Universal Ticket Detail Modal (for manual triage) */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                    {isModalLoading ? (
                        <div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : selectedTicket && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl">{selectedTicket.ticketUid} - {selectedTicket.title}</DialogTitle>
                                <DialogDescription>
                                    Assigned to: {selectedTicket.assignedTo.length > 0 ? selectedTicket.assignedTo.map(e => e.fullName).join(', ') : 'None'}
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className="py-4 space-y-6 overflow-y-auto pr-6">
                                {/* Ticket Info */}
                                <div>
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <p className="text-sm text-muted-foreground">{selectedTicket.description}</p>
                                </div>

                                {/* Activity Log Accordion */}
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger>
                                            <h3 className="font-semibold">View Activity History ({activityLogs.length})</h3>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4 max-h-48 overflow-y-auto pr-4">
                                                {activityLogs.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">No activities logged yet.</p>
                                                ) : (
                                                    activityLogs.map(log => (
                                                        <div key={log.activityId} className="flex gap-3">
                                                            <div className="mt-1">
                                                                <User className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">{log.user.fullName}
                                                                    <span className="text-xs text-muted-foreground ml-2">({log.activityType})</span>
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">{log.description}</p>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                                                </p>
                                                            </div>
                                                            {log.internalOnly && (
                                                                <Badge variant="outline">Internal</Badge>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                {/* Triage Officer Actions */}
                                {user.role === ROLES.TRIAGE_OFFICER && (
                                    <div className="space-y-4 pt-4">
                                        <h3 className="font-semibold">Ticket Management</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="priority">Priority</Label>
                                                <Select value={editedPriority} onValueChange={setEditedPriority}><SelectTrigger><SelectValue placeholder="Set priority..."/></SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(PRIORITY).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="severity">Severity</Label>
                                                <Select value={editedSeverity} onValueChange={setEditedSeverity}><SelectTrigger><SelectValue placeholder="Set severity..."/></SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(SEVERITY).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Assign Engineer(s)</Label>
                                            <Popover open={engineerSearchOpen} onOpenChange={setEngineerSearchOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" role="combobox" className="w-full justify-between">
                                                        {selectedEngineerIds.length > 0 ? `${selectedEngineerIds.length} engineer(s) selected` : 'Select engineers...'}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search engineers..." />
                                                        <CommandList><CommandEmpty>No engineers found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {assignableEngineers.map((engineer) => (
                                                                    <CommandItem key={engineer.id} value={engineer.fullName} onSelect={() => {
                                                                        setSelectedEngineerIds(prev => prev.includes(engineer.id) ? prev.filter(id => id !== engineer.id) : [...prev, engineer.id]);
                                                                    }}>
                                                                        <Check className={cn('mr-2 h-4 w-4', selectedEngineerIds.includes(engineer.id) ? 'opacity-100' : 'opacity-0')} />
                                                                        {engineer.fullName} ({engineer.username})
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

                                {/* Engineer Actions */}
                                {user.role !== ROLES.TRIAGE_OFFICER && (
                                    <div className="space-y-4 pt-4">
                                        <h3 className="font-semibold">Engineer Actions</h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="update">Add Update</Label>
                                            <Textarea id="update" placeholder="Describe your progress..." value={updateText} onChange={(e) => setUpdateText(e.target.value)} rows={4} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Change Status</Label>
                                            <Select value={newStatus} onValueChange={setNewStatus}>
                                                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={TICKET_STATUS.IN_PROGRESS}>In Progress</SelectItem>
                                                    <SelectItem value={TICKET_STATUS.NEEDS_TRIAGING}>Request Re-assignment</SelectItem>
                                                    <SelectItem value={TICKET_STATUS.FIXED}>Mark as Fixed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <DialogFooter className="pt-4 border-t">
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                                <Button onClick={handleSaveChanges} disabled={isSubmitting}>
                                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Changes'}
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