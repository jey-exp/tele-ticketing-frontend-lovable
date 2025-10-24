export const NOTIFICATION_TYPE = {
  RESOLVED: 'resolved',
  IN_PROGRESS: 'in_progress',
  ASSIGNED: 'assigned',
  REOPENED: 'reopened',
  DELAYED: 'delayed',
  FEEDBACK_REQUESTED: 'feedback_requested',
};

export const mockNotifications = [
  {
    id: 'NOTIF001',
    type: NOTIFICATION_TYPE.RESOLVED,
    icon: '✅',
    message: 'Ticket #TKT12346 Resolved — "Your email server issue has been marked as Resolved. Please provide feedback."',
    timestamp: '2025-01-18T14:30:00Z',
    read: false,
    ticketId: 'TKT12346',
  },
  {
    id: 'NOTIF002',
    type: NOTIFICATION_TYPE.IN_PROGRESS,
    icon: '🔧',
    message: 'Ticket #TKT12345 In Progress — "Alice Johnson is now working on your internet connectivity issue."',
    timestamp: '2025-01-20T11:00:00Z',
    read: false,
    ticketId: 'TKT12345',
  },
  {
    id: 'NOTIF003',
    type: NOTIFICATION_TYPE.FEEDBACK_REQUESTED,
    icon: '⭐',
    message: 'Ticket #TKT12349 Resolved — "Your printer connectivity issue has been resolved. Please rate our service."',
    timestamp: '2025-01-19T15:35:00Z',
    read: true,
    ticketId: 'TKT12349',
  },
  {
    id: 'NOTIF004',
    type: NOTIFICATION_TYPE.ASSIGNED,
    icon: '👤',
    message: 'Ticket #TKT12345 Assigned — "Your ticket has been assigned to Alice Johnson."',
    timestamp: '2025-01-20T10:15:00Z',
    read: true,
    ticketId: 'TKT12345',
  },
  {
    id: 'NOTIF005',
    type: NOTIFICATION_TYPE.RESOLVED,
    icon: '✅',
    message: 'Ticket #TKT12347 Resolved — "Your VPN connection issue has been successfully resolved."',
    timestamp: '2025-01-15T16:05:00Z',
    read: true,
    ticketId: 'TKT12347',
  },
];

// Helper to get unread notifications
export const getUnreadNotifications = () => {
  return mockNotifications.filter((notif) => !notif.read);
};

// Helper to mark notification as read
export const markAsRead = (notificationId) => {
  const notif = mockNotifications.find((n) => n.id === notificationId);
  if (notif) {
    notif.read = true;
  }
};
