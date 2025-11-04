import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Upload, CheckCircle2, Loader2, AlertTriangle, Check, ChevronsUpDown, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { mockCustomers } from '@/data/mockCustomers';
import { useUser } from '@/contexts/UserContext';
import apiClient from '@/services/api';

// Categories matching the backend TicketCategory enum
const categories = [
  { value: 'NETWORK_CONNECTIVITY', label: 'Network Connectivity' },
  { value: 'PERFORMANCE_ISSUE', label: 'Performance Issue' },
  { value: 'HARDWARE_FAILURE', label: 'Hardware Failure' },
  { value: 'INFRASTRUCTURE_PROBLEM', label: 'Infrastructure Problem' },
  { value: 'CONFIGURATION_REQUEST', label: 'Configuration Request' },
  { value: 'SECURITY_CONCERN', label: 'Security Concern' },
  { value: 'SERVICE_OUTAGE', label: 'Service Outage' },
  { value: 'OTHER', label: 'Other' },
];

const priorities = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const AgentNewTicket = () => {
  const navigate = useNavigate();
  const { user, isLoading: isUserLoading } = useUser();

  const [formData, setFormData] = useState({
    customerId: '',
    title: '',
    category: '',
    priority: 'MEDIUM',
    description: '',
    dueDate: null,
    attachments: [],
  });
  
  const [openCustomerSelect, setOpenCustomerSelect] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setFormData({ ...formData, customerId: customer.id });
    setOpenCustomerSelect(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, attachments: files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!selectedCustomer) {
      setError('Please select a customer');
      setIsSubmitting(false);
      return;
    }

    // Payload for agent ticket creation
    const payload = {
      customerId: formData.customerId,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      dueDate: formData.dueDate ? format(formData.dueDate, 'yyyy-MM-dd') : null,
      attachments: formData.attachments.map(file => file.name),
    };

    console.log("Agent ticket payload:", payload);

    try {
      const response = await apiClient.post('/agent/tickets', payload);
      
      setSubmittedTicket(response.data);
      setShowSuccessModal(true);
      setFormData({ 
        customerId: '', 
        title: '', 
        category: '', 
        priority: 'MEDIUM', 
        description: '', 
        dueDate: null, 
        attachments: [] 
      });
      setSelectedCustomer(null);
    } catch (err) {
      console.error("Agent ticket creation failed:", err);
      setError(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/my-tickets');
  };

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-3xl p-6 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You must be logged in to create a ticket.</p>
            <Button onClick={() => navigate('/login')} className="mt-4">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Ticket for Customer</CardTitle>
          <CardDescription>Create a new support ticket on behalf of a customer</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label>Select Customer *</Label>
              <Popover open={openCustomerSelect} onOpenChange={setOpenCustomerSelect}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCustomerSelect}
                    className="w-full justify-between"
                  >
                    {selectedCustomer
                      ? `${selectedCustomer.name} (${selectedCustomer.email})`
                      : "Select customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search customers..." />
                    <CommandList>
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        {mockCustomers.map((customer) => (
                          <CommandItem
                            key={customer.id}
                            onSelect={() => handleCustomerSelect(customer)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{customer.name}</span>
                              <span className="text-sm text-muted-foreground">{customer.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Customer experiencing connection drops"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Category and Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  required
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the customer's issue..."
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            
            {/* Attachments */}
            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              {formData.attachments.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {formData.attachments.length} file(s) selected
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            
            {/* Submit Buttons */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Ticket'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <DialogTitle>Ticket Created Successfully</DialogTitle>
                <DialogDescription>The ticket has been created and assigned.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {submittedTicket && (
            <div className="space-y-3 py-4 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Ticket ID:</span>
                <span>{submittedTicket.ticketUid}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Customer:</span>
                <span>{selectedCustomer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Title:</span>
                <span>{submittedTicket.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Priority:</span>
                <span className="font-semibold">{submittedTicket.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Status:</span>
                <span className="font-semibold">{submittedTicket.status}</span>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowSuccessModal(false)}>
              Create Another
            </Button>
            <Button onClick={handleCloseModal}>View Tickets</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentNewTicket;
