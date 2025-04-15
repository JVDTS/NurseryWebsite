import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Clock, UserCircle, MapPin, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ActivityLog {
  id: number;
  userId: number;
  username: string;
  userRole: string;
  nurseryId: number | null;
  nurseryName: string | null;
  actionType: string;
  resourceId: number | null;
  description: string;
  createdAt: string;
}

interface ActivityLogsProps {
  nurseryId?: number;
}

export default function ActivityLogs({ nurseryId }: ActivityLogsProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        
        // Different endpoint based on whether we're viewing logs for a specific nursery
        const endpoint = nurseryId 
          ? `/api/admin/nurseries/${nurseryId}/activity-logs` 
          : '/api/admin/activity-logs';
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error('Failed to fetch activity logs');
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.logs)) {
          setLogs(data.logs);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching activity logs:', err);
        toast({
          title: 'Error',
          description: 'Failed to load activity logs',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, [nurseryId, toast]);

  // Filter logs based on active tab
  const filteredLogs = logs.filter(log => {
    if (activeTab === 'all') return true;
    return log.actionType.startsWith(activeTab.replace('-', '_'));
  });

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get color for action type badge
  const getActionColor = (actionType: string) => {
    if (actionType.includes('create')) return 'bg-green-100 text-green-800';
    if (actionType.includes('update')) return 'bg-blue-100 text-blue-800';
    if (actionType.includes('delete')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Format action type for display
  const formatActionType = (actionType: string) => {
    return actionType
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get color for user role badge
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'nursery_admin':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-center items-center mb-4">
        <h2 className="text-2xl font-bold">Activity Logs</h2>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex justify-center w-full mb-4">
          <TabsList>
            <TabsTrigger value="all">All Activities</TabsTrigger>
            <TabsTrigger value="user">User Management</TabsTrigger>
            <TabsTrigger value="event">Events</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletters</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center bg-gray-50 rounded-lg">
              <p className="text-lg text-gray-500">No activity logs found</p>
              <p className="text-sm text-gray-400 mt-2">Activity will be recorded as admins make changes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map(log => (
                <Card key={log.id} className="overflow-hidden border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getActionColor(log.actionType)}>
                            {formatActionType(log.actionType)}
                          </Badge>
                          <Badge variant="outline" className={getRoleBadgeClass(log.userRole)}>
                            {log.userRole.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock size={14} className="mr-1" />
                          {formatDate(log.createdAt)}
                        </div>
                      </div>
                      
                      <p className="text-gray-800">{log.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <div className="flex items-center">
                          <UserCircle size={14} className="mr-1" />
                          <span>By <span className="font-medium">{log.username}</span></span>
                        </div>
                        
                        {log.nurseryName && (
                          <div className="flex items-center">
                            <MapPin size={14} className="mr-1" />
                            <span>{log.nurseryName}</span>
                          </div>
                        )}
                        
                        {log.resourceId && (
                          <div className="flex items-center">
                            <Info size={14} className="mr-1" />
                            <span>Resource ID: {log.resourceId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}