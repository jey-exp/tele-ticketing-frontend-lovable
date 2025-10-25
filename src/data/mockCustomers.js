export const mockCustomers = [
  {
    id: 'CUST001',
    name: 'Global Corp Inc.',
    email: 'contact@globalcorp.com',
    phone: '+1-555-0123',
    address: '123 Business Ave, Suite 100, NY 10001',
  },
  {
    id: 'CUST002',
    name: 'Acme Industries Ltd.',
    email: 'support@acmeindustries.com',
    phone: '+1-555-0124',
    address: '456 Industrial Blvd, Chicago, IL 60601',
  },
  {
    id: 'CUST003',
    name: 'Tech Solutions Pro',
    email: 'info@techsolutionspro.com',
    phone: '+1-555-0125',
    address: '789 Innovation Drive, Austin, TX 78701',
  },
  {
    id: 'CUST004',
    name: 'Metro Healthcare Systems',
    email: 'it@metrohealthcare.org',
    phone: '+1-555-0126',
    address: '321 Medical Center Way, Boston, MA 02101',
  },
  {
    id: 'CUST005',
    name: 'Pacific Finance Group',
    email: 'help@pacificfinance.com',
    phone: '+1-555-0127',
    address: '654 Financial Plaza, San Francisco, CA 94105',
  },
  {
    id: 'CUST006',
    name: 'Educational Services Network',
    email: 'admin@eduservices.edu',
    phone: '+1-555-0128',
    address: '987 Campus Road, Denver, CO 80202',
  },
  {
    id: 'CUST007',
    name: 'Retail Chain Express',
    email: 'operations@retailexpress.com',
    phone: '+1-555-0129',
    address: '147 Commerce Street, Atlanta, GA 30303',
  },
  {
    id: 'CUST008',
    name: 'Manufacturing Plus LLC',
    email: 'support@manufacturingplus.com',
    phone: '+1-555-0130',
    address: '258 Factory Lane, Detroit, MI 48201',
  },
  {
    id: 'CUST009',
    name: 'Green Energy Solutions',
    email: 'contact@greenenergy.com',
    phone: '+1-555-0131',
    address: '369 Renewable Way, Portland, OR 97201',
  },
  {
    id: 'CUST010',
    name: 'Digital Marketing Hub',
    email: 'info@digitalmarketing.com',
    phone: '+1-555-0132',
    address: '741 Creative Boulevard, Miami, FL 33101',
  },
];

// Helper function to search customers by name
export const searchCustomers = (query) => {
  if (!query) return mockCustomers;
  
  return mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(query.toLowerCase()) ||
    customer.email.toLowerCase().includes(query.toLowerCase()) ||
    customer.id.toLowerCase().includes(query.toLowerCase())
  );
};

// Helper function to get customer by ID
export const getCustomerById = (customerId) => {
  return mockCustomers.find(customer => customer.id === customerId);
};
