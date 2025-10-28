export const ROLES = {
  CUSTOMER: 'Customer',
  AGENT: 'Agent',
  TRIAGE_OFFICER: 'Triage Officer',
  FIELD_ENGINEER: 'Field Engineer',
  NOC_ENGINEER: 'NOC Engineer',
  L1_ENGINEER: 'L1 Engineer',
  TEAM_LEAD: 'Team Lead',
  MANAGER: 'Manager',
  CXO: 'CXO',
  NOC_ADMIN: 'NOC Admin',
};

export const sidebarLinks = {
  [ROLES.CUSTOMER]: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Raise a Ticket', path: '/new-ticket', icon: 'Plus' },
    { label: 'Feedback Center', path: '/feedback', icon: 'MessageSquare' },
    { label: 'Notification Center', path: '/notifications', icon: 'Bell' },
    { label: 'My Tickets', path: '/my-tickets', icon: 'Ticket' },
  ],
  [ROLES.AGENT]: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Create a Ticket', path: '/create-ticket', icon: 'Plus' },
    { label: 'Feedback Center', path: '/feedback', icon: 'MessageSquare' },
    { label: 'Notification Center', path: '/notifications', icon: 'Bell' },
    { label: 'My Tickets', path: '/my-tickets', icon: 'Ticket' },
  ],
  [ROLES.TRIAGE_OFFICER]: [
    { label: 'Pending Tickets', path: '/pending-tickets', icon: 'Clock' },
    { label: 'Notification Center', path: '/notifications', icon: 'Bell' },
  ],
  [ROLES.FIELD_ENGINEER]: [
    { label: 'Pending Tickets', path: '/pending-tickets', icon: 'Clock' },
    { label: 'Resolution History', path: '/resolution-history', icon: 'History' },
    { label: 'Notification Center', path: '/notifications', icon: 'Bell' },
  ],
  [ROLES.NOC_ENGINEER]: [
    { label: 'Pending Tickets', path: '/pending-tickets', icon: 'Clock' },
    { label: 'Resolution History', path: '/resolution-history', icon: 'History' },
    { label: 'Notification Center', path: '/notifications', icon: 'Bell' },
  ],
  [ROLES.L1_ENGINEER]: [
    { label: 'Pending Tickets', path: '/pending-tickets', icon: 'Clock' },
    { label: 'Resolution History', path: '/resolution-history', icon: 'History' },
    { label: 'Notification Center', path: '/notifications', icon: 'Bell' },
  ],
  [ROLES.TEAM_LEAD]: [
    { label: 'Active Tickets', path: '/active-tickets', icon: 'Activity' },
    { label: 'SLA Risks', path: '/sla-risks', icon: 'AlertTriangle' },
    { label: 'Notification Center', path: '/notifications', icon: 'Bell' },
  ],
  [ROLES.MANAGER]: [
    { label: 'All Tickets', path: '/all-tickets', icon: 'List' },
    { label: 'Add User', path: '/add-user', icon: 'UserPlus' },
    { label: 'Notification Center', path: '/notifications', icon: 'Bell' },
  ],
  [ROLES.CXO]: [
    { label: 'Reports', path: '/reports', icon: 'BarChart3' },
  ],
  [ROLES.NOC_ADMIN]: [
    {
      label: 'Heat Map',path: '/heat-map', icon: 'MapPin'
    }
  ],
};
