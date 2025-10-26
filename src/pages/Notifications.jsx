import { useState } from 'react';
import { NotificationItem } from '@/components/NotificationItem';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockNotifications, triageOfficerNotifications, fieldEngineerNotifications, l1EngineerNotifications, nocEngineerNotifications, getUnreadNotifications, markAsRead } from '@/data/mockNotifications';
import { Bell, CheckCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { ROLES } from '@/config/rolesConfig';

const Notifications = () => {
  const { toast } = useToast();
  const { user } = useUser();
  
  // Get notifications based on user role
  const getNotificationsForRole = () => {
    if (user.role === ROLES.TRIAGE_OFFICER) {
      return triageOfficerNotifications;
    } else if (user.role === ROLES.FIELD_ENGINEER) {
      return fieldEngineerNotifications;
    } else if (user.role === ROLES.L1_ENGINEER) {
      return l1EngineerNotifications;
    } else if (user.role === ROLES.NOC_ENGINEER) {
      return nocEngineerNotifications;
    }
    return mockNotifications;
  };
  
  const [notifications, setNotifications] = useState(getNotificationsForRole());
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      const updatedNotifications = notifications.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      );
      setNotifications(updatedNotifications);
    }
  };

  const handleMarkAllRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    toast({
      title: 'All notifications marked as read',
    });
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with your ticket activities
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-base px-3 py-1">
            {unreadCount} Unread
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={handleNotificationClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
