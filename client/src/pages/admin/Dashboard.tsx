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
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ActivitiesSection from '@/components/admin/ActivitiesSection';
import NurserySelector from '@/components/admin/NurserySelector';
import StaffSection from '@/components/admin/StaffSection';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [selectedNurseryId, setSelectedNurseryId] = useState<number | null>(null);
  const [stats, setStats] = useState({
    newsletters: 0,
    events: 0,
    galleryImages: 0,
    staff: 0
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

  // Fetch events
  const { data: eventsData } = useQuery<{ events: any[] }>({
    queryKey: user?.role === 'super_admin' 
      ? ['/api/admin/events'] 
      : [`/api/admin/nurseries/${user?.nurseryId}/events`],
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

    if (eventsData?.events) {
      updatedStats.events = eventsData.events.length;
    }
    
    setStats(updatedStats);
  }, [galleryData, newslettersData, eventsData]);

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

  // Format date for display
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-UK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Sample upcoming events data (would be replaced with actual events)
  const sampleRecentEvents = eventsData?.events?.slice(0, 3).map(event => ({
    id: event.id,
    title: event.title,
    date: formatDate(event.date),
    nurseryName: getNurseryNameById(event.nurseryId)
  })) || [];

  // Get nursery name by ID
  function getNurseryNameById(id: number): string {
    switch(id) {
      case 1: return 'Hayes';
      case 2: return 'Uxbridge';
      case 3: return 'Hounslow';
      default: return 'Unknown Nursery';
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Dashboard">
        <div className="grid gap-6 max-w-6xl mx-auto">
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Activity Stats */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-purple-100 bg-opacity-50">
                <CardTitle className="text-sm font-medium">
                  Activity
                </CardTitle>
                <div className="rounded-md bg-purple-500 p-2">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">${(stats.galleryImages + stats.newsletters + stats.events) * 100}</div>
                <div className="text-xs text-green-500 font-medium flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +12%
                </div>
              </CardContent>
            </Card>
            
            {/* Events Stats */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-teal-100 bg-opacity-50">
                <CardTitle className="text-sm font-medium">
                  Events
                </CardTitle>
                <div className="rounded-md bg-teal-500 p-2">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">{stats.events}</div>
                <div className="text-xs text-green-500 font-medium flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +22%
                </div>
              </CardContent>
            </Card>
            
            {/* Products (Gallery) Stats */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-orange-100 bg-opacity-50">
                <CardTitle className="text-sm font-medium">
                  Gallery
                </CardTitle>
                <div className="rounded-md bg-orange-500 p-2">
                  <Image className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">{stats.galleryImages}</div>
                <div className="text-xs text-green-500 font-medium flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +12%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Chart & Recent Events */}
          <div className="grid gap-6 lg:grid-cols-7">
            {/* Activity Chart */}
            <Card className="col-span-7 lg:col-span-4">
              <CardHeader className="text-center">
                <div>
                  <CardTitle>Activity</CardTitle>
                  <CardDescription>Monthly Activity Growth</CardDescription>
                </div>
                <div className="flex items-center justify-center mt-2">
                  <Button variant="outline" size="sm" className="h-8">
                    <Clock className="mr-2 h-3.5 w-3.5" />
                    Last 30 Days
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Chart placeholder - in a real implementation, this would be a chart */}
                <div className="h-[260px] w-full rounded-md bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Activity Chart Placeholder</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card className="col-span-7 lg:col-span-3">
              <CardHeader className="text-center">
                <div>
                  <CardTitle>Recent Events</CardTitle>
                  <CardDescription>Latest scheduled events</CardDescription>
                </div>
                <div className="flex justify-center mt-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleRecentEvents.length > 0 ? (
                    sampleRecentEvents.map((event, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          <Calendar className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{event.title}</h4>
                          <p className="text-xs text-gray-500">{event.date}</p>
                        </div>
                        <div className="text-sm font-medium text-green-600">{event.nurseryName}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No recent events found</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-3 flex justify-center">
                <Link href={user?.role === 'super_admin' ? '/admin/events' : `/admin/nurseries/${user?.nurseryId}/events`}>
                  <a className="text-sm text-primary font-medium flex items-center hover:underline">
                    View More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Latest Content */}
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center text-center gap-4">
                <div>
                  <CardTitle>Latest Content</CardTitle>
                  <CardDescription>Recently added content items across all sections</CardDescription>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Search content..." 
                      className="pl-9 h-9 bg-gray-50 rounded-md text-sm border border-gray-200 w-full sm:w-60 focus:ring-1 focus:ring-primary focus:border-primary" 
                    />
                  </div>
                  <Button size="sm" className="h-9">
                    <Plus className="mr-2 h-4 w-4" /> Add New
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                    </TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Sample rows - would be replaced with actual data */}
                  <TableRow>
                    <TableCell>
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                    </TableCell>
                    <TableCell className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                        <Image className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">Spring Festival Photos</div>
                        <div className="text-xs text-gray-500">{getNurseryName() || 'Hounslow'} Nursery</div>
                      </div>
                    </TableCell>
                    <TableCell>Gallery Image</TableCell>
                    <TableCell>{formatDate(new Date().toISOString())}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                    </TableCell>
                    <TableCell className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">April Newsletter</div>
                        <div className="text-xs text-gray-500">{getNurseryName() || 'Hayes'} Nursery</div>
                      </div>
                    </TableCell>
                    <TableCell>Newsletter</TableCell>
                    <TableCell>{formatDate(new Date().toISOString())}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                    </TableCell>
                    <TableCell className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">Summer Fair</div>
                        <div className="text-xs text-gray-500">{getNurseryName() || 'Uxbridge'} Nursery</div>
                      </div>
                    </TableCell>
                    <TableCell>Event</TableCell>
                    <TableCell>{formatDate(new Date().toISOString())}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Upcoming
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row items-center justify-center border-t px-6 py-4 gap-4">
              <div className="text-sm text-gray-500 text-center">
                Showing <span className="font-medium">3</span> of <span className="font-medium">{stats.events + stats.newsletters + stats.galleryImages}</span> items
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}