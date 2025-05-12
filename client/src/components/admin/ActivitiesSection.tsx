import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { 
  Activity, 
  User, 
  FileText, 
  Calendar, 
  Upload, 
  Trash, 
  Edit, 
  LogIn, 
  LogOut,
  RefreshCcw,
  ArrowRight,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

// Activity type icons mapping
const activityIcons = {
  login: <LogIn className="h-4 w-4 text-white" />,
  logout: <LogOut className="h-4 w-4 text-white" />,
  create_event: <Calendar className="h-4 w-4 text-white" />,
  update_event: <Edit className="h-4 w-4 text-white" />,
  delete_event: <Trash className="h-4 w-4 text-white" />,
  upload_gallery: <Upload className="h-4 w-4 text-white" />,
  delete_gallery: <Trash className="h-4 w-4 text-white" />,
  create_newsletter: <FileText className="h-4 w-4 text-white" />,
  update_newsletter: <Edit className="h-4 w-4 text-white" />,
  delete_newsletter: <Trash className="h-4 w-4 text-white" />,
  create_user: <User className="h-4 w-4 text-white" />,
  update_user: <Edit className="h-4 w-4 text-white" />,
  update_nursery: <Edit className="h-4 w-4 text-white" />
};

// Background colors for activity types
const activityColors = {
  login: 'bg-green-500',
  logout: 'bg-gray-500',
  create_event: 'bg-blue-500',
  update_event: 'bg-yellow-500',
  delete_event: 'bg-red-500',
  upload_gallery: 'bg-purple-500',
  delete_gallery: 'bg-red-500',
  create_newsletter: 'bg-indigo-500',
  update_newsletter: 'bg-yellow-500',
  delete_newsletter: 'bg-red-500',
  create_user: 'bg-emerald-500',
  update_user: 'bg-yellow-500',
  update_nursery: 'bg-teal-500'
};

// Format activity timestamp for display
const formatActivityTime = (timestamp: string | Date) => {
  const date = new Date(timestamp);
  return formatDistanceToNow(date, { addSuffix: true });
};

interface ActivitiesSectionProps {
  nurseryId?: number;
  limit?: number;
}

export const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({ nurseryId, limit = 5 }) => {
  const { user } = useAuth();
  
  // Fetch admin activities based on nursery selection
  const { data: response, isLoading, error } = useQuery({
    queryKey: nurseryId 
      ? ['/api/admin/activities/nursery', nurseryId]
      : ['/api/admin/activities/recent'],
    enabled: !!user
  });
  
  // Extract activities from response
  const activities = response?.success ? response.data : [];

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Loading recent activities...</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-40">
            <RefreshCcw className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !activities) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Unable to load activities</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            There was an error loading recent activities. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="text-center">
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>
          {nurseryId 
            ? 'Latest activities for this nursery' 
            : 'Latest activities across all nurseries'}
        </CardDescription>
        <div className="flex justify-center mt-2">
          <Button variant="outline" size="sm" className="h-8">
            <Clock className="mr-2 h-3.5 w-3.5" />
            Today
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.slice(0, limit).map((activity, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full ${activityColors[activity.activityType] || 'bg-gray-500'} flex items-center justify-center mr-3`}>
                  {activityIcons[activity.activityType] || <Activity className="h-4 w-4 text-white" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{activity.description}</h4>
                  <div className="flex justify-between">
                    <p className="text-xs text-gray-500">by {activity.userName || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{formatActivityTime(activity.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center">No recent activities found</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-3 flex justify-center">
        <Link href="/admin/activities">
          <a className="text-sm text-primary font-medium flex items-center hover:underline">
            View All Activities
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ActivitiesSection;