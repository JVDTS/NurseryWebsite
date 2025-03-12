import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import DashboardLayout from '@/components/admin/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Users, Newspaper, Image, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    events: 0,
    newsletters: 0,
    galleryImages: 0,
    staff: 0
  });

  // In a real implementation, this would fetch actual data from the API
  useEffect(() => {
    // Mock data for demonstration purposes
    const mockStats = {
      events: Math.floor(Math.random() * 10) + 5,
      newsletters: Math.floor(Math.random() * 8) + 3,
      galleryImages: Math.floor(Math.random() * 30) + 10,
      staff: Math.floor(Math.random() * 5) + 3
    };
    
    setStats(mockStats);
  }, []);

  // Format welcome message based on time of day
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get nursery name for display
  const getNurseryName = () => {
    if (!user?.nurseryId) return '';
    
    switch(user.nurseryId) {
      case 1: return 'Hayes';
      case 2: return 'Uxbridge';
      case 3: return 'Hounslow';
      default: return '';
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Dashboard">
        <div className="space-y-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">
                {getWelcomeMessage()}, {user?.firstName}!
              </CardTitle>
              <CardDescription>
                {user?.role === 'super_admin' 
                  ? 'Here\'s an overview of all nurseries'
                  : `Here's an overview of ${getNurseryName()} nursery`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <Clock className="inline-block mr-1 h-4 w-4" />
                {new Date().toLocaleDateString('en-UK', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Events
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.events}</div>
                <p className="text-xs text-muted-foreground">
                  Events scheduled
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Gallery Images
                </CardTitle>
                <Image className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.galleryImages}</div>
                <p className="text-xs text-muted-foreground">
                  Photos in gallery
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Newsletters
                </CardTitle>
                <Newspaper className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.newsletters}</div>
                <p className="text-xs text-muted-foreground">
                  Published newsletters
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Staff Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.staff}</div>
                <p className="text-xs text-muted-foreground">
                  Active staff members
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you can perform</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              <button className="p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">Create Event</span>
                </div>
                <p className="text-sm text-muted-foreground">Add a new event to the calendar</p>
              </button>
              
              <button className="p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Image className="h-5 w-5 text-primary" />
                  <span className="font-medium">Upload Images</span>
                </div>
                <p className="text-sm text-muted-foreground">Add new photos to the gallery</p>
              </button>
              
              <button className="p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Newspaper className="h-5 w-5 text-primary" />
                  <span className="font-medium">Publish Newsletter</span>
                </div>
                <p className="text-sm text-muted-foreground">Create a new newsletter</p>
              </button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}