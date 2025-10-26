export const NOTIFICATION_TYPE = {
  RESOLVED: 'resolved',
  IN_PROGRESS: 'in_progress',
  ASSIGNED: 'assigned',
  REOPENED: 'reopened',
  DELAYED: 'delayed',
  FEEDBACK_REQUESTED: 'feedback_requested',
  NEEDS_FEEDBACK: 'needs_feedback',
  NEW_TICKET: 'new_ticket',
  FIELD_VISIT_COMPLETE: 'field_visit_complete',
  AWAITING_FIELD: 'awaiting_field',
};

export const mockNotifications = [
  {
    id: 'NOTIF001',
    type: NOTIFICATION_TYPE.RESOLVED,
    message: 'Ticket #12345 Resolved — Your internet connectivity issue has been marked as Resolved by Alice Johnson.',
    timestamp: '2025-01-20T14:30:00Z',
    read: false,
    ticketId: 'TKT12345',
  },
  {
    id: 'NOTIF002',
    type: NOTIFICATION_TYPE.IN_PROGRESS,
    message: 'Ticket #12346 Update — Bob Smith is working on your email server issue.',
    timestamp: '2025-01-18T09:00:00Z',
    read: true,
    ticketId: 'TKT12346',
  },
  {
    id: 'NOTIF003',
    type: NOTIFICATION_TYPE.NEEDS_FEEDBACK,
    message: 'Ticket #12347 Feedback Required — Your VPN issue has been resolved. Please provide feedback.',
    timestamp: '2025-01-15T16:30:00Z',
    read: false,
    ticketId: 'TKT12347',
  },
  {
    id: 'NOTIF004',
    type: NOTIFICATION_TYPE.REOPENED,
    message: 'Ticket #12353 Reopened — Website performance issue still persists.',
    timestamp: '2025-01-23T09:15:00Z',
    read: false,
    ticketId: 'TKT12353',
  },
  {
    id: 'NOTIF005',
    type: NOTIFICATION_TYPE.DELAYED,
    message: 'Ticket #12348 SLA Warning — Response time approaching SLA limit.',
    timestamp: '2025-01-22T16:00:00Z',
    read: true,
    ticketId: 'TKT12348',
  },
];

// Triage Officer specific notifications
export const triageOfficerNotifications = [
  {
    id: 'NOTIF_TO001',
    type: NOTIFICATION_TYPE.NEW_TICKET,
    message: '🆕 New Ticket #12354 requires triage — Access control system malfunction.',
    timestamp: '2025-01-23T11:35:00Z',
    read: false,
    ticketId: 'TKT12354',
  },
  {
    id: 'NOTIF_TO002',
    type: NOTIFICATION_TYPE.REOPENED,
    message: '🔄 Ticket #12353 was reopened by the customer and needs reassignment.',
    timestamp: '2025-01-23T09:15:00Z',
    read: false,
    ticketId: 'TKT12353',
  },
  {
    id: 'NOTIF_TO003',
    type: NOTIFICATION_TYPE.FIELD_VISIT_COMPLETE,
    message: '✅ Field visit for Ticket #12352 is complete. Ticket requires next steps.',
    timestamp: '2025-01-21T13:15:00Z',
    read: true,
    ticketId: 'TKT12352',
  },
  {
    id: 'NOTIF_TO004',
    type: NOTIFICATION_TYPE.AWAITING_FIELD,
    message: '⚠️ Ticket #12350 requires field assignment — Server room HVAC issue.',
    timestamp: '2025-01-23T09:35:00Z',
    read: false,
    ticketId: 'TKT12350',
  },
];

// Field Engineer specific notifications
export const fieldEngineerNotifications = [
  {
    id: 'NOTIF_FE001',
    type: NOTIFICATION_TYPE.ASSIGNED,
    message: '➡️ You have been assigned to Ticket #12351 for an on-site visit — Database backup failure.',
    timestamp: '2025-01-22T09:35:00Z',
    read: false,
    ticketId: 'TKT12351',
  },
  {
    id: 'NOTIF_FE002',
    type: NOTIFICATION_TYPE.IN_PROGRESS,
    message: 'ℹ️ New update added to Ticket #12351 by the NOC team.',
    timestamp: '2025-01-22T08:50:00Z',
    read: true,
    ticketId: 'TKT12351',
  },
  {
    id: 'NOTIF_FE003',
    type: NOTIFICATION_TYPE.ASSIGNED,
    message: '➡️ Field visit scheduled for Ticket #12351 — Please review details.',
    timestamp: '2025-01-22T09:30:00Z',
    read: true,
    ticketId: 'TKT12351',
  },
];

// L1 Engineer specific notifications
export const l1EngineerNotifications = [
  {
    id: 'NOTIF_L1_001',
    type: NOTIFICATION_TYPE.ASSIGNED,
    message: '➡️ New Ticket #12355 assigned to you by the Triage Officer — Network latency issue.',
    timestamp: '2025-01-23T10:15:00Z',
    read: false,
    ticketId: 'TKT12355',
  },
  {
    id: 'NOTIF_L1_002',
    type: NOTIFICATION_TYPE.IN_PROGRESS,
    message: '💬 Customer added a new comment on Ticket #12349 — Please review.',
    timestamp: '2025-01-22T15:30:00Z',
    read: false,
    ticketId: 'TKT12349',
  },
  {
    id: 'NOTIF_L1_003',
    type: NOTIFICATION_TYPE.AWAITING_FIELD,
    message: '✅ Your request for a field visit on Ticket #12350 has been approved and assigned.',
    timestamp: '2025-01-21T11:00:00Z',
    read: true,
    ticketId: 'TKT12350',
  },
];

// NOC Engineer specific notifications
export const nocEngineerNotifications = [
  {
    id: 'NOTIF_NOC_001',
    type: NOTIFICATION_TYPE.ASSIGNED,
    message: '➡️ New Ticket #12356 assigned to you by the Triage Officer — Server monitoring alert.',
    timestamp: '2025-01-23T08:45:00Z',
    read: false,
    ticketId: 'TKT12356',
  },
  {
    id: 'NOTIF_NOC_002',
    type: NOTIFICATION_TYPE.IN_PROGRESS,
    message: '💬 Customer added a new comment on Ticket #12348 — Requires immediate attention.',
    timestamp: '2025-01-22T14:20:00Z',
    read: false,
    ticketId: 'TKT12348',
  },
  {
    id: 'NOTIF_NOC_003',
    type: NOTIFICATION_TYPE.AWAITING_FIELD,
    message: '✅ Your request for a field visit on Ticket #12352 has been approved and assigned.',
    timestamp: '2025-01-21T09:30:00Z',
    read: true,
    ticketId: 'TKT12352',
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
