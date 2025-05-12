import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LogIn, 
  LogOut, 
  Calendar, 
  Pencil, 
  Trash2, 
  Image, 
  FileText, 
  UserPlus, 
  Settings,
  ArrowRight
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: number;
  userId: number;
  username: string;
  action: string;
  entityId?: number;
  entityType?: string;
  nurseryId?: number;
  timestamp: string;
}

interface ActivitiesSectionProps {
  nurseryId?: number;
  userId?: number;
  limit?: number;
}

export default function ActivitiesSection({
  nurseryId,
  userId,
  limit = 5
}: ActivitiesSectionProps) {
  // Define the API endpoint based on props
  const getEndpoint = () => {
    if (userId) {
      return `/api/admin/activities/user/${userId}`;
    } else if (nurseryId) {
      return `/api/admin/activities/nursery/${nurseryId}`;
    } else {
      return '/api/admin/activities/recent';
    }
  };

  // Fetch activities
  const { data, isLoading, isError } = useQuery({
    queryKey: ['activities', nurseryId, userId],
    queryFn: async () => {
      const endpoint = getEndpoint();
      console.log("Fetching activities from:", endpoint);
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
  });

  // Maps for friendly action names and icons
  const actionNames = {
    login: 'Logged in',
    logout: 'Logged out',
    create_event: 'Created event',
    update_event: 'Updated event',
    delete_event: 'Deleted event',
    upload_gallery: 'Uploaded gallery image',
    delete_gallery: 'Deleted gallery image',
    create_newsletter: 'Created newsletter',
    update_newsletter: 'Updated newsletter',
    delete_newsletter: 'Deleted newsletter',
    create_user: 'Created user',
    update_user: 'Updated user',
    update_nursery: 'Updated nursery'
  };

  const actionIcons = {
    login: <LogIn className="h-4 w-4" />,
    logout: <LogOut className="h-4 w-4" />,
    create_event: <Calendar className="h-4 w-4" />,
    update_event: <Pencil className="h-4 w-4" />,
    delete_event: <Trash2 className="h-4 w-4" />,
    upload_gallery: <Image className="h-4 w-4" />,
    delete_gallery: <Trash2 className="h-4 w-4" />,
    create_newsletter: <FileText className="h-4 w-4" />,
    update_newsletter: <Pencil className="h-4 w-4" />,
    delete_newsletter: <Trash2 className="h-4 w-4" />,
    create_user: <UserPlus className="h-4 w-4" />,
    update_user: <Pencil className="h-4 w-4" />,
    update_nursery: <Settings className="h-4 w-4" />
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-center text-center">
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>
            {nurseryId 
              ? 'Latest actions for this nursery'
              : userId
                ? 'Latest actions by this user'
                : 'Latest actions across all nurseries'
            }
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="rounded-full bg-gray-100 p-2">
                  <Skeleton className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))
          ) : isError ? (
            <div className="text-center text-red-500 py-4">
              Failed to load activities
            </div>
          ) : data?.activities?.length > 0 ? (
            // Render activities
            data.activities.slice(0, limit).map((activity, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="rounded-full bg-gray-100 p-2">
                  {actionIcons[activity.action] || <Pencil className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {activity.username || 'Unknown user'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {actionNames[activity.action] || activity.action}
                    {activity.entityType && ` ${activity.entityType}`}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {formatTimestamp(activity.timestamp)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              No recent activities found
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-2 border-t">
        <Button variant="link" size="sm">
          View all activities <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}