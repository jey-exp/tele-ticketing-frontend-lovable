// Mock customer data for Agent role
export const mockCustomers = [
  { id: 'CUST001', name: 'Global Corp Inc.' },
  { id: 'CUST002', name: 'Acme Solutions' },
  { id: 'CUST003', name: 'Innovate Tech' },
  { id: 'CUST004', name: 'TechVision Ltd.' },
  { id: 'CUST005', name: 'Digital Dynamics' },
  { id: 'CUST006', name: 'Quantum Systems' },
  { id: 'CUST007', name: 'NextGen Enterprises' },
  { id: 'CUST008', name: 'BlueSky Corporation' },
  { id: 'CUST009', name: 'Phoenix Industries' },
  { id: 'CUST010', name: 'Stellar Networks' },
];

export const getCustomerById = (id) => {
  return mockCustomers.find(customer => customer.id === id);
};

export const searchCustomers = (query) => {
  if (!query) return mockCustomers;
  const lowercaseQuery = query.toLowerCase();
  return mockCustomers.filter(customer => 
    customer.name.toLowerCase().includes(lowercaseQuery) ||
    customer.id.toLowerCase().includes(lowercaseQuery)
  );
};
