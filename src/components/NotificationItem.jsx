import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, Wrench, AlertCircle, UserPlus, Star, FileText, MessageSquare, Plus, GitBranchPlus } from 'lucide-react';

// Dr. X's Note: This function is now mapped to the backend's ActivityType enum values.
// This is critical for displaying the correct icon.
const getNotificationIcon = (activityType) => {
  switch (activityType) {
    case 'CREATION':
      return <Plus className="h-5 w-5 text-indigo-600" />;
    case 'STATUS_CHANGE':
      return <GitBranchPlus className="h-5 w-5 text-blue-600" />;
    case 'PRIORITY_CHANGE':
      return <AlertCircle className="h-5 w-5 text-orange-600" />;
    case 'ASSIGNMENT':
       return <UserPlus className="h-5 w-5 text-purple-600" />;
    case 'COMMENT':
      return <MessageSquare className="h-5 w-5 text-gray-600" />;
    case 'RESOLUTION':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'REOPENED':
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    case 'ATTACHMENT_ADDED':
      return <FileText className="h-5 w-5 text-gray-500" />;
    default:
      return <MessageSquare className="h-5 w-5 text-gray-500" />;
  }
};

export const NotificationItem = ({ notification }) => {
  if (!notification) return null; // Defensive programming

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Icon based on activity type */}
          <div className="mt-1">{getNotificationIcon(notification.activityType)}</div>
          
          <div className="flex-1 space-y-1">
            {/* Dr. X's Note: A more structured and informative display. */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{notification.ticketUid}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground line-clamp-1">{notification.ticketTitle}</span>
            </div>
            
            {/* The main description from the backend log. */}
            <p className="text-sm leading-relaxed text-foreground">{notification.description}</p>
            
            {/* The timestamp from the backend log. */}
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};