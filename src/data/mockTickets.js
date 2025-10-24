export const TICKET_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  NEEDS_FEEDBACK: 'Needs Feedback',
  AWAITING_FIELD: 'Awaiting Field Assignment',
  FIELD_VISIT_COMPLETE: 'Field Visit Complete',
  REOPENED: 'Reopened',
};

export const PRIORITY = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const SEVERITY = {
  CRITICAL: 'Critical',
  MAJOR: 'Major',
  MINOR: 'Minor',
};

export const mockTickets = [
  {
    id: 'TKT12345',
    title: 'Internet connection is unstable in conference room',
    customer: { id: 'CUST001', name: 'Global Corp Inc.' },
    status: TICKET_STATUS.IN_PROGRESS,
    priority: PRIORITY.HIGH,
    severity: SEVERITY.CRITICAL,
    category: 'Network Connectivity',
    subCategory: 'Wi-Fi Signal',
    description: 'The Wi-Fi signal in the main conference room keeps dropping during important meetings. This is affecting our business operations significantly.',
    attachments: [],
    createdAt: '2025-01-20T10:00:00Z',
    resolvedAt: null,
    slaDuration: '4 hours',
    slaRemaining: '2h 30m',
    assignedTo: [{ id: 'ENG007', name: 'Alice Johnson' }],
    logs: [
      { timestamp: '2025-01-20T10:00:00Z', update: 'Ticket created by customer.' },
      { timestamp: '2025-01-20T10:15:00Z', update: 'Assigned to Alice Johnson (L1 Engineer).' },
      { timestamp: '2025-01-20T11:00:00Z', update: 'Engineer started investigating the issue.' },
    ],
  },
  {
    id: 'TKT12346',
    title: 'Email server down - unable to send/receive emails',
    customer: { id: 'CUST001', name: 'Global Corp Inc.' },
    status: TICKET_STATUS.NEEDS_FEEDBACK,
    priority: PRIORITY.HIGH,
    severity: SEVERITY.MAJOR,
    category: 'Email Services',
    subCategory: 'Server Outage',
    description: 'Our email server has been down since this morning. Employees cannot send or receive emails.',
    attachments: [],
    createdAt: '2025-01-18T08:30:00Z',
    resolvedAt: '2025-01-18T14:00:00Z',
    slaDuration: '6 hours',
    slaRemaining: null,
    assignedTo: [{ id: 'ENG003', name: 'Bob Smith' }],
    logs: [
      { timestamp: '2025-01-18T08:30:00Z', update: 'Ticket created by customer.' },
      { timestamp: '2025-01-18T08:45:00Z', update: 'Assigned to Bob Smith (NOC Engineer).' },
      { timestamp: '2025-01-18T14:00:00Z', update: 'Issue resolved. Email server back online.' },
    ],
  },
  {
    id: 'TKT12347',
    title: 'VPN connection failing for remote employees',
    customer: { id: 'CUST001', name: 'Global Corp Inc.' },
    status: TICKET_STATUS.RESOLVED,
    priority: PRIORITY.MEDIUM,
    severity: SEVERITY.MAJOR,
    category: 'Network Security',
    subCategory: 'VPN',
    description: 'Multiple remote employees are unable to connect to the company VPN. Connection times out.',
    attachments: [],
    createdAt: '2025-01-15T09:00:00Z',
    resolvedAt: '2025-01-15T16:00:00Z',
    slaDuration: '8 hours',
    slaRemaining: null,
    assignedTo: [{ id: 'ENG005', name: 'Charlie Brown' }],
    logs: [
      { timestamp: '2025-01-15T09:00:00Z', update: 'Ticket created by customer.' },
      { timestamp: '2025-01-15T09:20:00Z', update: 'Assigned to Charlie Brown (L1 Engineer).' },
      { timestamp: '2025-01-15T16:00:00Z', update: 'VPN configuration updated. Issue resolved.' },
    ],
    feedbackGiven: true,
    rating: 5,
    feedbackText: 'Excellent service! Issue was resolved quickly and professionally.',
  },
  {
    id: 'TKT12348',
    title: 'Slow network speed in Building A',
    customer: { id: 'CUST001', name: 'Global Corp Inc.' },
    status: TICKET_STATUS.PENDING,
    priority: PRIORITY.LOW,
    severity: SEVERITY.MINOR,
    category: 'Network Performance',
    subCategory: 'Bandwidth',
    description: 'Employees in Building A are experiencing slower than usual network speeds.',
    attachments: [],
    createdAt: '2025-01-22T14:00:00Z',
    resolvedAt: null,
    slaDuration: '24 hours',
    slaRemaining: '20h 15m',
    assignedTo: [],
    logs: [
      { timestamp: '2025-01-22T14:00:00Z', update: 'Ticket created by customer.' },
    ],
  },
  {
    id: 'TKT12349',
    title: 'Printer network connectivity issue',
    customer: { id: 'CUST001', name: 'Global Corp Inc.' },
    status: TICKET_STATUS.NEEDS_FEEDBACK,
    priority: PRIORITY.MEDIUM,
    severity: SEVERITY.MINOR,
    category: 'Hardware',
    subCategory: 'Printer',
    description: 'Office printer on 3rd floor cannot be accessed from the network.',
    attachments: [],
    createdAt: '2025-01-19T11:00:00Z',
    resolvedAt: '2025-01-19T15:30:00Z',
    slaDuration: '8 hours',
    slaRemaining: null,
    assignedTo: [{ id: 'FLD001', name: 'Diana Prince' }],
    logs: [
      { timestamp: '2025-01-19T11:00:00Z', update: 'Ticket created by customer.' },
      { timestamp: '2025-01-19T11:30:00Z', update: 'Assigned to Field Engineer Diana Prince.' },
      { timestamp: '2025-01-19T15:30:00Z', update: 'Printer network settings reconfigured. Issue resolved.' },
    ],
  },
];

// Helper function to get tickets by status
export const getTicketsByStatus = (status) => {
  return mockTickets.filter((ticket) => ticket.status === status);
};

// Helper function to get customer's active tickets
export const getActiveTickets = () => {
  return mockTickets.filter(
    (ticket) => ticket.status !== TICKET_STATUS.RESOLVED
  );
};

// Helper function to get tickets needing feedback
export const getTicketsNeedingFeedback = () => {
  return mockTickets.filter(
    (ticket) => ticket.status === TICKET_STATUS.NEEDS_FEEDBACK
  );
};

// Helper function to get tickets with feedback history
export const getTicketsWithFeedback = () => {
  return mockTickets.filter(
    (ticket) => ticket.feedbackGiven === true
  );
};
