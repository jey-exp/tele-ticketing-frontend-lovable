import { useState, useEffect, useMemo } from 'react';
import { NotificationItem } from '@/components/NotificationItem';
import { Button } from '@/components/ui/button';
import { Bell, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import apiClient from '@/services/api';
import { ROLES } from '../config/rolesConfig';

const PAGE_SIZE = 10; // We define our page size on the frontend

const Notifications = () => {
  const { user } = useUser();
  const [allNotifications, setAllNotifications] = useState([]); // Holds ALL notifications
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for client-side pagination
  const [currentPage, setCurrentPage] = useState(1); // Page numbers are 1-based for UI
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
        if (!user) return;
      
        setIsLoading(true);
        setError(null);

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
            // Fetch all notifications at once
            const response = await apiClient.get(endpoint);
            setAllNotifications(response.data);
            // Calculate total pages based on the full list
            setTotalPages(Math.ceil(response.data.length / PAGE_SIZE));
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
            setError("Could not load notifications. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    fetchNotifications();
  }, [user]);

  // Dr. X's Fix: Use useMemo to calculate the items for the *current page*
  const currentNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return allNotifications.slice(startIndex, endIndex);
  }, [allNotifications, currentPage]);

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
      ) : allNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">You have no notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* We now map over the paginated list */}
          {currentNotifications.map((notification) => (
            <NotificationItem
              key={notification.activityId}
              notification={notification}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= totalPages || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Notifications;