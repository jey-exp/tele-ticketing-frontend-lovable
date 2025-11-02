import { useState, useEffect } from 'react';
import { NotificationItem } from '@/components/NotificationItem';
import { Bell, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import apiClient from '@/services/api';
import { ROLES } from '../config/rolesConfig';

const Notifications = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
        if (!user) return;
      
        setIsLoading(true);
        setError(null);

        // Dr. X's Note: Same dynamic endpoint logic as MyTickets.
        let endpoint = '';
        if (user.role === ROLES.CUSTOMER) {
            endpoint = '/customer/notifications';
        } else if (user.role === ROLES.AGENT) {
            endpoint = '/agent/notifications';
        } else {
            setError("Notifications are not available for your role.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await apiClient.get(endpoint);
            setNotifications(response.data);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
            setError("Could not load notifications. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    fetchNotifications();
  }, [user]);

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bell className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
          <p className="text-muted-foreground mt-1">
            A chronological feed of all activities on your tickets.
          </p>
        </div>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            You have no notifications yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            // Assuming NotificationItem component can take this data structure.
            <NotificationItem
              key={notification.activityId}
              notification={notification}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;