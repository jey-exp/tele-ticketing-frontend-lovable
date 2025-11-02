import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle2, Check, ChevronsUpDown, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import apiClient from '@/services/api';
import { toast } from 'sonner';

// This list MUST match the backend TicketCategory enum.
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

const CreateTicket = () => {
  const navigate = useNavigate();
  
  // State for the form data
  const [formData, setFormData] = useState({
    customerUsername: '',
    title: '',
    category: '',
    description: '',
    attachments: [],
  });
  
  // State for UI and data fetching
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [openCustomerCombobox, setOpenCustomerCombobox] = useState(false);
  
  // State for success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Fetch the list of customers when the component mounts.
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/users/customers');
        setCustomers(response.data);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        setError("Could not load customer list. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachments: Array.from(e.target.files) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Payload must match the AgentCreateTicketRequestDto on the backend.
    const payload = {
      customerUsername: formData.customerUsername,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      attachments: formData.attachments.map(file => file.name),
    };

    try {
      const response = await apiClient.post('/agent/tickets', payload);
      setSubmittedTicket(response.data);
      setShowSuccessModal(true);
      // Reset form on success
      setFormData({ customerUsername: '', title: '', category: '', description: '', attachments: [] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/my-tickets'); // Or agent's dashboard
  };

  const selectedCustomerName = customers.find(c => c.username === formData.customerUsername)?.fullName;

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create a Ticket</CardTitle>
          <CardDescription>Create a new support ticket on behalf of a customer</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label htmlFor="customer">Select Customer *</Label>
              <Popover open={openCustomerCombobox} onOpenChange={setOpenCustomerCombobox}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {selectedCustomerName || "Select customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search customer..." />
                    <CommandList>
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        {customers.map((customer) => (
                          <CommandItem
                            key={customer.id}
                            value={customer.fullName}
                            onSelect={() => {
                              setFormData({ ...formData, customerUsername: customer.username });
                              setOpenCustomerCombobox(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", formData.customerUsername === customer.username ? "opacity-100" : "opacity-0")} />
                            {customer.fullName} ({customer.username})
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
              <Input id="title" placeholder="Brief description of the issue" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" placeholder="Detailed description of the issue..." rows={5} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
            </div>
            
            {/* Attachments */}
            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments</Label>
              <div className="flex items-center gap-2"><Input id="attachments" type="file" multiple onChange={handleFileChange} className="cursor-pointer" /><Upload className="h-4 w-4 text-muted-foreground" /></div>
              {formData.attachments.length > 0 && <p className="text-sm text-muted-foreground">{formData.attachments.length} file(s) selected</p>}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || !formData.customerUsername}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Ticket'}
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
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 className="h-6 w-6 text-green-600" /></div>
              <div>
                <DialogTitle>Ticket Created Successfully</DialogTitle>
                <DialogDescription>
                  Ticket has been created for {submittedTicket?.createdFor.fullName}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {submittedTicket && (
            <div className="space-y-3 py-4 text-sm">
              <div className="flex justify-between"><span className="font-medium">Ticket ID:</span><span>{submittedTicket.ticketUid}</span></div>
              <div className="flex justify-between"><span className="font-medium">Customer:</span><span>{submittedTicket.createdFor.fullName}</span></div>
              <div className="flex justify-between"><span className="font-medium">Title:</span><span>{submittedTicket.title}</span></div>
              <div className="flex justify-between"><span className="font-medium">Status:</span><span className="font-semibold">{submittedTicket.status}</span></div>
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowSuccessModal(false)}>Create Another</Button>
            <Button onClick={handleCloseModal}>View Tickets</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateTicket;