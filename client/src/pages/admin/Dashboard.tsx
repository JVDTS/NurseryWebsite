import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import DashboardLayout from '@/components/admin/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Users, Newspaper, Image, Calendar, Clock, Pencil, Search,
  BarChart3, ArrowRight, ArrowUp, FileText, Settings, Plus, MoreHorizontal
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ActivitiesSection from '@/components/admin/ActivitiesSection';
import NurserySelector from '@/components/admin/NurserySelectorNew';

// Use -1 to represent "All Nurseries" selection
const ALL_NURSERIES = -1;

export default function AdminDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedNurseryId, setSelectedNurseryId] = useState<number | null>(null);
  // Define stats type for dashboard
  type DashboardStats = {
    newsletters: number;
    events: number;
    galleryImages: number;
  };

  const [stats, setStats] = useState<DashboardStats>({
    newsletters: 0,
    events: 0,
    galleryImages: 0
  });

  // Construct query keys based on selected nursery
  const galleryQueryKey = selectedNurseryId 
    ? [`/api/admin/nurseries/${selectedNurseryId}/gallery`]
    : (user?.role === 'super_admin' 
        ? ['/api/admin/gallery'] 
        : user?.nurseryId 
          ? [`/api/admin/nurseries/${user.nurseryId}/gallery`] 
          : ['/api/admin/gallery']);

  const eventsQueryKey = selectedNurseryId 
    ? [`/api/admin/nurseries/${selectedNurseryId}/events`]
    : (user?.role === 'super_admin' 
        ? ['/api/admin/events'] 
        : user?.nurseryId 
          ? [`/api/admin/nurseries/${user.nurseryId}/events`] 
          : ['/api/admin/events']);

  const newslettersQueryKey = selectedNurseryId 
    ? [`/api/admin/nurseries/${selectedNurseryId}/newsletters`]
    : (user?.role === 'super_admin' 
        ? ['/api/admin/newsletters'] 
        : user?.nurseryId 
          ? [`/api/admin/nurseries/${user.nurseryId}/newsletters`] 
          : ['/api/admin/newsletters']);

  // Use React Query to fetch data based on role
  const { data: galleryImages = [] } = useQuery({
    queryKey: galleryQueryKey,
    enabled: !!user
  });

  const { data: events = [] } = useQuery({
    queryKey: eventsQueryKey,
    enabled: !!user
  });

  const { data: newsletters = [] } = useQuery({
    queryKey: newslettersQueryKey,
    enabled: !!user
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: !!user && user.role === 'super_admin'
  });

  const { data: nurseries = [] } = useQuery({
    queryKey: ['/api/admin/nurseries'],
    enabled: !!user
  });

  // Calculate statistics
  useEffect(() => {
    setStats({
      newsletters: newsletters.length,
      events: events.length,
      galleryImages: galleryImages.length
    });
  }, [newsletters, events, galleryImages]);

  // Handle nursery selection change
  const handleNurseryChange = (nurseryId: number | null) => {
    setSelectedNurseryId(nurseryId);
    
    // Invalidate and refetch data for the new selection
    queryClient.invalidateQueries({ queryKey: ['gallery'] });
    queryClient.invalidateQueries({ queryKey: ['events'] });
    queryClient.invalidateQueries({ queryKey: ['newsletters'] });
  };

  const quickActions = [
    {
      title: "Add Newsletter",
      description: "Create a new newsletter",
      icon: Newspaper,
      href: "/admin/newsletters/new",
      color: "bg-blue-500"
    },
    {
      title: "Schedule Event",
      description: "Add upcoming event",
      icon: Calendar,
      href: "/admin/events/new",
      color: "bg-green-500"
    },
    {
      title: "Upload Images",
      description: "Add to gallery",
      icon: Image,
      href: "/admin/gallery/new",
      color: "bg-purple-500"
    },
    {
      title: "Manage Users",
      description: "User administration",
      icon: Users,
      href: "/admin/users",
      color: "bg-orange-500",
      superAdminOnly: true
    }
  ];

  const recentNewsletters = newsletters.slice(0, 3);
  const upcomingEvents = events.slice(0, 3);
  const recentImages = galleryImages.slice(0, 3);

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout title="Dashboard">
        <div className="space-y-8">
          {/* Nursery Selector for Super Admin */}
          {user?.role === 'super_admin' && (
            <div className="mb-6">
              <NurserySelector 
                onChange={handleNurseryChange}
                selectedNurseryId={selectedNurseryId}
              />
            </div>
          )}

          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-8 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="text-teal-100 text-lg">
                  {user?.role === 'super_admin' 
                    ? 'Manage your nursery network from here' 
                    : `Managing ${user?.nurseryId ? nurseries.find(n => n.id === user.nurseryId)?.name || 'your nursery' : 'your nursery'}`}
                </p>
              </div>
              <div className="hidden md:block">
                <BarChart3 className="w-16 h-16 text-teal-200" />
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Newsletters</CardTitle>
                <Newspaper className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.newsletters}</div>
                <p className="text-xs text-muted-foreground">
                  {selectedNurseryId ? 'For selected nursery' : 'Across all nurseries'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.events}</div>
                <p className="text-xs text-muted-foreground">
                  {selectedNurseryId ? 'For selected nursery' : 'Across all nurseries'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gallery Images</CardTitle>
                <Image className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.galleryImages}</div>
                <p className="text-xs text-muted-foreground">
                  {selectedNurseryId ? 'For selected nursery' : 'Across all nurseries'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Frequently used management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions
                  .filter(action => !action.superAdminOnly || user?.role === 'super_admin')
                  .map((action, index) => (
                  <Link key={index} href={action.href}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Newsletters */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Newsletters</CardTitle>
                  <CardDescription>Latest published content</CardDescription>
                </div>
                <Link href="/admin/newsletters">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentNewsletters.length > 0 ? (
                    recentNewsletters.map((newsletter: any) => (
                      <div key={newsletter.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{newsletter.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(newsletter.publishDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No newsletters yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Scheduled activities</CardDescription>
                </div>
                <Link href="/admin/events">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event: any) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No upcoming events</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <ActivitiesSection />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}