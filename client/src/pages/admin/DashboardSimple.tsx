import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import DashboardLayout from '@/components/admin/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Users, Newspaper, Image, Calendar, Clock, Pencil, Search,
  Building2, ArrowRight, ArrowUp, FileText, Settings, Plus, MoreHorizontal
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Use -1 to represent "All Nurseries" selection
const ALL_NURSERIES = -1;

export default function AdminDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedNurseryId, setSelectedNurseryId] = useState<number | null>(null);
  const [nurseries, setNurseries] = useState<any[]>([]);
  const [stats, setStats] = useState({
    newsletters: 0,
    events: 0,
    galleryImages: 0
  });

  // Get endpoint based on nursery selection
  const getEndpoint = (base: string) => {
    if (selectedNurseryId && selectedNurseryId !== ALL_NURSERIES) {
      return `/api/admin/nurseries/${selectedNurseryId}/${base}`;
    } else {
      return `/api/admin/${base}`;
    }
  };

  // Fetch nurseries for the selector
  const { data: nurseriesData } = useQuery({
    queryKey: ['/api/nurseries'],
    enabled: !!user,
  });

  // Fetch gallery images
  const { data: galleryData } = useQuery({
    queryKey: ['gallery', selectedNurseryId],
    queryFn: async () => {
      const endpoint = getEndpoint('gallery');
      console.log("Fetching gallery from:", endpoint);
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch gallery data');
      return response.json();
    },
    enabled: !!user,
  });
  
  // Fetch newsletters
  const { data: newslettersData } = useQuery({
    queryKey: ['newsletters', selectedNurseryId],
    queryFn: async () => {
      const endpoint = getEndpoint('newsletters');
      console.log("Fetching newsletters from:", endpoint);
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch newsletter data');
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch events
  const { data: eventsData } = useQuery({
    queryKey: ['events', selectedNurseryId],
    queryFn: async () => {
      const endpoint = getEndpoint('events');
      console.log("Fetching events from:", endpoint);
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch event data');
      return response.json();
    },
    enabled: !!user,
  });
  
  // Set nurseries when data is loaded
  useEffect(() => {
    if (nurseriesData?.nurseries) {
      console.log("Nurseries loaded:", nurseriesData.nurseries);
      setNurseries(nurseriesData.nurseries);
    }
  }, [nurseriesData]);

  // Initialize nursery selection based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'super_admin') {
        setSelectedNurseryId(ALL_NURSERIES);
      } else if (user.nurseryId) {
        setSelectedNurseryId(user.nurseryId);
      }
    }
  }, [user]);
  
  // Handle nursery selection change
  const handleNurseryChange = (value: string) => {
    console.log("Nursery selection changed to:", value);
    const newNurseryId = value === 'all' ? ALL_NURSERIES : parseInt(value, 10);
    setSelectedNurseryId(newNurseryId);
    
    // Invalidate and refetch all data
    queryClient.invalidateQueries({ queryKey: ['gallery', newNurseryId] });
    queryClient.invalidateQueries({ queryKey: ['newsletters', newNurseryId] });
    queryClient.invalidateQueries({ queryKey: ['events', newNurseryId] });
  };
  
  // Update stats when data changes
  useEffect(() => {
    console.log("Gallery data updated:", galleryData);
    console.log("Newsletters data updated:", newslettersData);
    console.log("Events data updated:", eventsData);
    
    const updatedStats = {
      galleryImages: galleryData?.images?.length || 0,
      newsletters: newslettersData?.newsletters?.length || 0,
      events: eventsData?.events?.length || 0
    };
    
    console.log("Updated stats:", updatedStats);
    setStats(updatedStats);
  }, [galleryData, newslettersData, eventsData]);

  // Format welcome message based on time of day
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get nursery name by ID
  function getNurseryNameById(id: number): string {
    switch(id) {
      case 1: return 'Hayes';
      case 2: return 'Uxbridge';
      case 3: return 'Hounslow';
      default: return 'Unknown Nursery';
    }
  }

  // Get nursery name for display
  const getNurseryName = () => {
    if (selectedNurseryId === ALL_NURSERIES) {
      return 'All Nurseries';
    } else if (selectedNurseryId) {
      return getNurseryNameById(selectedNurseryId);
    } else if (user?.nurseryId) {
      return getNurseryNameById(user.nurseryId);
    }
    return '';
  };

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
            {/* Nursery Selector Card */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-purple-100 bg-opacity-50">
                <CardTitle className="text-sm font-medium">
                  {user?.role === 'super_admin' ? 'Select Nursery' : 'Your Nursery'}
                </CardTitle>
                <div className="rounded-md bg-purple-500 p-2">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {user?.role === 'super_admin' ? (
                  <>
                    <Select 
                      onValueChange={handleNurseryChange} 
                      value={selectedNurseryId === ALL_NURSERIES ? 'all' : selectedNurseryId?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a nursery" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Nurseries</SelectItem>
                        {nurseries.map(nursery => (
                          <SelectItem key={nursery.id} value={nursery.id.toString()}>
                            {nursery.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2">
                      View data for a specific nursery location
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-xl font-bold">{getNurseryName()}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      {user?.nurseryId ? `Nursery ID: ${user.nurseryId}` : ''}
                    </p>
                  </>
                )}
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
                <p className="text-xs text-gray-500 mt-1">
                  {selectedNurseryId === ALL_NURSERIES ? 'Across all nurseries' : `For ${getNurseryName()}`}
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
                  {selectedNurseryId === ALL_NURSERIES ? 'Across all nurseries' : `For ${getNurseryName()}`}
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
                  {selectedNurseryId === ALL_NURSERIES ? 'Across all nurseries' : `For ${getNurseryName()}`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Latest Content Section */}
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
                    <TableHead>Nursery</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Show actual events data if available */}
                  {eventsData?.events && eventsData.events.slice(0, 3).map((event, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      </TableCell>
                      <TableCell className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-xs text-gray-500">{event.date}</div>
                        </div>
                      </TableCell>
                      <TableCell>Event</TableCell>
                      <TableCell>{getNurseryNameById(event.nurseryId)}</TableCell>
                      <TableCell>{new Date(event.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Show sample data if no events are available */}
                  {(!eventsData?.events || eventsData.events.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                        No content items available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-center border-t px-6 py-4">
              <Button variant="outline" size="sm">
                View All Content <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}