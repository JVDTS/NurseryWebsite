import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useNurserySelector, ALL_NURSERIES } from '@/hooks/use-nursery-selector';
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
import StaffSection from '@/components/admin/StaffSection';

export default function AdminDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { selectedNurseryId, setSelectedNurseryId, nurseryName } = useNurserySelector();
  const [stats, setStats] = useState({
    newsletters: 0,
    events: 0,
    galleryImages: 0,
    staff: 0
  });

  // Construct query keys based on selected nursery
  const galleryQueryKey = selectedNurseryId 
    ? [`/api/admin/nurseries/${selectedNurseryId}/gallery`]
    : (user?.role === 'super_admin' 
      ? ['/api/admin/gallery'] 
      : [`/api/admin/nurseries/${user?.nurseryId}/gallery`]
    );
    
  const newslettersQueryKey = selectedNurseryId 
    ? [`/api/admin/nurseries/${selectedNurseryId}/newsletters`]
    : (user?.role === 'super_admin' 
      ? ['/api/admin/newsletters'] 
      : [`/api/admin/nurseries/${user?.nurseryId}/newsletters`]
    );
    
  const eventsQueryKey = selectedNurseryId 
    ? [`/api/admin/nurseries/${selectedNurseryId}/events`]
    : (user?.role === 'super_admin' 
      ? ['/api/admin/events'] 
      : [`/api/admin/nurseries/${user?.nurseryId}/events`]
    );
    
  console.log("Query keys:", { galleryQueryKey, newslettersQueryKey, eventsQueryKey });
      
  // Fetch actual gallery images count based on selected nursery
  const { data: galleryData } = useQuery<{ images: any[] }>({
    queryKey: galleryQueryKey,
    enabled: !!user,
  });
  
  // Fetch actual newsletters count based on selected nursery
  const { data: newslettersData } = useQuery<{ newsletters: any[] }>({
    queryKey: newslettersQueryKey,
    enabled: !!user,
  });

  // Fetch events based on selected nursery
  const { data: eventsData } = useQuery<{ events: any[] }>({
    queryKey: eventsQueryKey,
    enabled: !!user,
  });
  
  // Handle nursery selection change
  const handleNurseryChange = (nurseryId: number | null) => {
    console.log("Dashboard: Nursery changed to:", nurseryId);
    // Use the global nursery selector context to update the nursery ID
    setSelectedNurseryId(nurseryId);
    
    // Invalidate and refetch all data when nursery changes
    queryClient.invalidateQueries({ queryKey: ['gallery'] });
    queryClient.invalidateQueries({ queryKey: ['newsletters'] });
    queryClient.invalidateQueries({ queryKey: ['events'] });
  };
  
  // Update stats with actual data when available
  useEffect(() => {
    console.log("Dashboard: Data or selectedNurseryId changed", {
      selectedNurseryId,
      galleryImages: galleryData?.images?.length || 0,
      newsletters: newslettersData?.newsletters?.length || 0,
      events: eventsData?.events?.length || 0
    });
    
    const updatedStats = {
      galleryImages: galleryData?.images?.length || 0,
      newsletters: newslettersData?.newsletters?.length || 0,
      events: eventsData?.events?.length || 0,
      staff: 0 // This will be updated when we have staff data
    };
    
    setStats(updatedStats);
  }, [galleryData, newslettersData, eventsData, selectedNurseryId]);

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
    return getNurseryNameById(user.nurseryId);
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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">
            {getWelcomeMessage()}, {user?.firstName}
          </h1>
          <p className="text-gray-500">
            {user?.role === 'super_admin' 
              ? 'You have access to all nurseries' 
              : `Managing ${getNurseryName()} Nursery`}
          </p>
        </div>
        <div className="grid gap-6 max-w-6xl mx-auto">
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Nursery Selector */}
            <NurserySelector
              onChange={handleNurseryChange}
              selectedNurseryId={selectedNurseryId}
            />
            
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
                <p className="text-xs text-gray-500 mt-1">
                  {selectedNurseryId ? `For selected nursery` : 'Across all nurseries'}
                </p>
              </CardContent>
            </Card>
            
            {/* Gallery Stats */}
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
                <p className="text-xs text-gray-500 mt-1">
                  {selectedNurseryId ? `For selected nursery` : 'Across all nurseries'}
                </p>
              </CardContent>
            </Card>
            
            {/* Newsletters Stats */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-100 bg-opacity-50">
                <CardTitle className="text-sm font-medium">
                  Newsletters
                </CardTitle>
                <div className="rounded-md bg-blue-500 p-2">
                  <Newspaper className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">{stats.newsletters}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedNurseryId ? `For selected nursery` : 'Across all nurseries'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Admin Activities & Staff Sections */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Admin Activities */}
            <ActivitiesSection nurseryId={selectedNurseryId || undefined} limit={5} />

            {/* Staff Section */}
            <StaffSection nurseryId={selectedNurseryId || undefined} limit={5} />
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