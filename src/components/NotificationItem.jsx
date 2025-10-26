import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, Wrench, AlertCircle, UserPlus, Star, FileText, MapPin, MessageSquare } from 'lucide-react';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'resolved':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'in_progress':
      return <Wrench className="h-5 w-5 text-blue-600" />;
    case 'assigned':
      return <UserPlus className="h-5 w-5 text-purple-600" />;
    case 'reopened':
      return <AlertCircle className="h-5 w-5 text-orange-600" />;
    case 'delayed':
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    case 'feedback_requested':
    case 'needs_feedback':
      return <Star className="h-5 w-5 text-yellow-600" />;
    case 'new_ticket':
      return <FileText className="h-5 w-5 text-indigo-600" />;
    case 'field_visit_complete':
      return <CheckCircle2 className="h-5 w-5 text-teal-600" />;
    case 'awaiting_field':
      return <MapPin className="h-5 w-5 text-amber-600" />;
    default:
      return <CheckCircle2 className="h-5 w-5 text-gray-600" />;
  }
};

export const NotificationItem = ({ notification, onClick }) => {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        !notification.read ? 'bg-accent/50' : ''
      }`}
      onClick={() => onClick && onClick(notification)}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
          <div className="flex-1 space-y-1">
            <p className="text-sm leading-relaxed">{notification.message}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
            </p>
          </div>
          {!notification.read && (
            <div className="h-2 w-2 rounded-full bg-primary mt-2" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
