import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import DashboardLayout from '@/components/admin/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserManagement from '@/components/admin/UserManagement';
import ActivityLogs from '@/components/admin/ActivityLogs';
import ContactSubmissions from '@/components/admin/ContactSubmissions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Newspaper, Image, Clock, UserCog, ActivityIcon, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    newsletters: 5,
    galleryImages: 18,
    staff: 4
  });

  // Fetch actual gallery images count
  const { data: galleryData } = useQuery<{ images: any[] }>({
    queryKey: user?.role === 'super_admin' 
      ? ['/api/admin/gallery'] 
      : [`/api/admin/nurseries/${user?.nurseryId}/gallery`],
    enabled: !!user,
  });
  
  // Fetch actual newsletters count
  const { data: newslettersData } = useQuery<{ newsletters: any[] }>({
    queryKey: user?.role === 'super_admin' 
      ? ['/api/admin/newsletters'] 
      : [`/api/admin/nurseries/${user?.nurseryId}/newsletters`],
    enabled: !!user,
  });
  
  // Update stats with actual data when available
  useEffect(() => {
    const updatedStats = { ...stats };
    
    if (galleryData?.images) {
      updatedStats.galleryImages = galleryData.images.length;
    }
    
    if (newslettersData?.newsletters) {
      updatedStats.newsletters = newslettersData.newsletters.length;
    }
    
    setStats(updatedStats);
  }, [galleryData, newslettersData]);

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
        <div className="space-y-6 w-full">
          {/* Welcome and Stats Section */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {/* Welcome Card */}
            <Card className="md:col-span-3">
              <CardHeader className="pb-2 text-center">
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
              <CardContent className="flex justify-center">
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

            {/* Stats Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium mr-2">
                  Gallery Images
                </CardTitle>
                <Image className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold">{stats.galleryImages}</div>
                <p className="text-xs text-muted-foreground">
                  Photos in gallery
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium mr-2">
                  Newsletters
                </CardTitle>
                <Newspaper className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold">{stats.newsletters}</div>
                <p className="text-xs text-muted-foreground">
                  Published newsletters
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium mr-2">
                  Staff Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold">{stats.staff}</div>
                <p className="text-xs text-muted-foreground">
                  Active staff members
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you can perform</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-3">
              <Link href={user?.role === 'super_admin' ? '/admin/gallery' : `/admin/nurseries/${user?.nurseryId}/gallery`}>
                <a className="block">
                  <button className="p-4 border rounded-lg text-center hover:bg-gray-50 transition-colors w-full">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Image className="h-5 w-5 text-primary" />
                      <span className="font-medium">Manage Gallery</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Upload and manage gallery photos</p>
                  </button>
                </a>
              </Link>
              
              <Link href={user?.role === 'super_admin' ? '/admin/newsletters' : `/admin/nurseries/${user?.nurseryId}/newsletters`}>
                <a className="block">
                  <button className="p-4 border rounded-lg text-center hover:bg-gray-50 transition-colors w-full">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Newspaper className="h-5 w-5 text-primary" />
                      <span className="font-medium">Manage Newsletters</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Publish and organize newsletters</p>
                  </button>
                </a>
              </Link>
              
              <a className="block" href="#contact-submissions" onClick={(e) => {
                e.preventDefault();
                document.querySelector('#contact-submissions')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                <button className="p-4 border rounded-lg text-center hover:bg-gray-50 transition-colors w-full">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span className="font-medium">Contact Submissions</span>
                  </div>
                  <p className="text-sm text-muted-foreground">View messages from website visitors</p>
                </button>
              </a>
            </CardContent>
          </Card>
          
          {/* Admin sections */}
          <div className="grid gap-6 grid-cols-1">
            {/* Super Admin Only - User Management */}
            {user?.role === 'super_admin' && (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Create and manage users across all nurseries</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserManagement />
                </CardContent>
              </Card>
            )}
            
            {/* Activity Logs - For Super Admin (all nurseries) */}
            {user?.role === 'super_admin' && (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>Activity Logs</CardTitle>
                  <CardDescription>Monitor activity across all nurseries</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityLogs />
                </CardContent>
              </Card>
            )}
            
            {/* Activity Logs - For Nursery Admin (specific nursery) */}
            {user?.role === 'nursery_admin' && user?.nurseryId && (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>Nursery Activity</CardTitle>
                  <CardDescription>Monitor activity for your nursery</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityLogs nurseryId={user.nurseryId} />
                </CardContent>
              </Card>
            )}
            
            {/* Contact Submissions - For both Super Admin and Nursery Admin */}
            {(user?.role === 'super_admin' || user?.role === 'nursery_admin') && (
              <Card id="contact-submissions">
                <CardHeader className="text-center">
                  <CardTitle>Contact Submissions</CardTitle>
                  <CardDescription>View messages from the contact form</CardDescription>
                </CardHeader>
                <CardContent>
                  <ContactSubmissions />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}