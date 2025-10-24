import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle2 } from 'lucide-react';

const categories = [
  { value: 'network', label: 'Network Connectivity', subcategories: ['Wi-Fi Signal', 'Ethernet', 'VPN', 'Bandwidth'] },
  { value: 'email', label: 'Email Services', subcategories: ['Server Outage', 'Configuration', 'Access Issues'] },
  { value: 'hardware', label: 'Hardware', subcategories: ['Printer', 'Computer', 'Phone System', 'Other'] },
  { value: 'security', label: 'Network Security', subcategories: ['Firewall', 'VPN', 'Access Control', 'Other'] },
  { value: 'performance', label: 'Network Performance', subcategories: ['Bandwidth', 'Latency', 'Packet Loss'] },
];

const NewTicket = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subCategory: '',
    priority: '',
    description: '',
    attachments: [],
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const selectedCategory = categories.find((cat) => cat.value === formData.category);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, attachments: files });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate mock ticket ID
    const ticketId = `TKT${Math.floor(Math.random() * 90000) + 10000}`;
    const slaDuration = formData.priority === 'high' ? '4 hours' : formData.priority === 'medium' ? '8 hours' : '24 hours';
    
    const ticket = {
      id: ticketId,
      ...formData,
      slaDuration,
      createdAt: new Date().toISOString(),
      status: 'Pending',
    };
    
    setSubmittedTicket(ticket);
    setShowSuccessModal(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/my-tickets');
  };

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Raise a Ticket</CardTitle>
          <CardDescription>Create a new support ticket for your network issue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Category and Subcategory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value, subCategory: '' })
                  }
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subCategory">Sub-Category *</Label>
                <Select
                  value={formData.subCategory}
                  onValueChange={(value) => setFormData({ ...formData, subCategory: value })}
                  disabled={!formData.category}
                  required
                >
                  <SelectTrigger id="subCategory">
                    <SelectValue placeholder="Select sub-category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {selectedCategory?.subcategories.map((subcat) => (
                      <SelectItem key={subcat} value={subcat}>
                        {subcat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Priority */}
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
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the issue..."
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments (Images only)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="attachments"
                  type="file"
                  accept="image/*"
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

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit">Submit Ticket</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <DialogTitle>Ticket Created Successfully</DialogTitle>
                <DialogDescription>Your support ticket has been submitted</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {submittedTicket && (
            <div className="space-y-3 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-medium">Ticket ID:</span>
                <span className="text-muted-foreground">{submittedTicket.id}</span>
                
                <span className="font-medium">Title:</span>
                <span className="text-muted-foreground">{submittedTicket.title}</span>
                
                <span className="font-medium">Priority:</span>
                <span className="text-muted-foreground capitalize">{submittedTicket.priority}</span>
                
                <span className="font-medium">SLA Duration:</span>
                <span className="text-muted-foreground">{submittedTicket.slaDuration}</span>
                
                <span className="font-medium">Status:</span>
                <span className="text-muted-foreground">{submittedTicket.status}</span>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowSuccessModal(false)}>
              Create Another
            </Button>
            <Button onClick={handleCloseModal}>View My Tickets</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewTicket;
