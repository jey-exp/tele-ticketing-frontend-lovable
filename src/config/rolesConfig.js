// Dr. X's Note: The values here now EXACTLY match the role strings
// provided by the Spring Boot backend in the JWT's "authorities" claim.
export const ROLES = {
  CUSTOMER: 'ROLE_CUSTOMER',
  AGENT: 'ROLE_AGENT',
  TRIAGE_OFFICER: 'ROLE_TRIAGE_OFFICER',
  FIELD_ENGINEER: 'ROLE_FIELD_ENGINEER',
  NOC_ENGINEER: 'ROLE_NOC_ENGINEER',
  L1_ENGINEER: 'ROLE_L1_ENGINEER',
  TEAM_LEAD: 'ROLE_TEAM_LEAD',
  MANAGER: 'ROLE_MANAGER',
  CXO: 'ROLE_CXO',
  NOC_ADMIN: 'ROLE_NOC_ADMIN',
};

// The structure remains the same, but the keys are now the correct backend role strings.
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
    { label: 'Manage Team', path: '/manage-team', icon: 'Users' },
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
    { label: 'Heat Map', path: '/heat-map', icon: 'MapPin' },
  ],
};