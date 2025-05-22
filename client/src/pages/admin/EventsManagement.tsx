import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import NewDashboardLayout from '@/components/admin/NewDashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  Users,
  User,
  Check,
  X,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  EyeIcon,
  ChevronDown,
  CalendarDays,
  CalendarClock,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define event types
type EventStatus = 'scheduled' | 'canceled' | 'completed';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  nursery: string;
  capacity: number;
  registrations: number;
  status: EventStatus;
  organizer: string;
}

export default function EventsManagement() {
  const { user } = useAuth();
  const [location, setLocation] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNursery, setSelectedNursery] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Sample events data
  const events: Event[] = [
    {
      id: 1,
      title: 'Parent-Teacher Conference',
      description: 'Term end meeting to discuss child progress',
      date: '2025-05-20',
      time: '14:00',
      duration: '4 hours',
      location: 'Main Hall',
      nursery: 'Hayes',
      capacity: 50,
      registrations: 32,
      status: 'scheduled',
      organizer: 'Sarah Johnson'
    },
    {
      id: 2,
      title: 'Summer Fair',
      description: 'Annual summer celebration with games and activities',
      date: '2025-06-15',
      time: '11:00',
      duration: '6 hours',
      location: 'Garden & Playground',
      nursery: 'Uxbridge',
      capacity: 100,
      registrations: 68,
      status: 'scheduled',
      organizer: 'John Smith'
    },
    {
      id: 3,
      title: 'Professional Development Day',
      description: 'Professional development workshop for the nursery',
      date: '2025-05-05',
      time: '09:00',
      duration: '8 hours',
      location: 'Conference Room',
      nursery: 'Hounslow',
      capacity: 25,
      registrations: 25,
      status: 'completed',
      organizer: 'Emma Taylor'
    },
    {
      id: 4,
      title: 'New Parents Open Evening',
      description: 'Introduction for parents of new children',
      date: '2025-05-25',
      time: '18:00',
      duration: '2 hours',
      location: 'Reception Area',
      nursery: 'Hayes',
      capacity: 30,
      registrations: 12,
      status: 'scheduled',
      organizer: 'Sarah Johnson'
    },
    {
      id: 5,
      title: 'End of Year Party',
      description: 'Celebration for children leaving for primary school',
      date: '2025-07-20',
      time: '14:00',
      duration: '3 hours',
      location: 'Main Hall',
      nursery: 'Uxbridge',
      capacity: 40,
      registrations: 28,
      status: 'scheduled',
      organizer: 'John Smith'
    },
    {
      id: 6,
      title: 'Health & Safety Workshop',
      description: 'Workshop canceled due to speaker illness',
      date: '2025-04-28',
      time: '13:00',
      duration: '3 hours',
      location: 'Conference Room',
      nursery: 'Hounslow',
      capacity: 35,
      registrations: 20,
      status: 'canceled',
      organizer: 'Emma Taylor'
    }
  ];

  // Filter events based on search, status, and nursery
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesNursery = !selectedNursery || event.nursery === selectedNursery;
    
    return matchesSearch && matchesStatus && matchesNursery;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get status badge variant
  const getStatusVariant = (status: EventStatus) => {
    switch(status) {
      case 'scheduled':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'canceled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Get status badge style
  const getStatusStyle = (status: EventStatus) => {
    switch(status) {
      case 'scheduled':
        return 'bg-green-500 hover:bg-green-600';
      case 'completed':
        return '';
      case 'canceled':
        return '';
      default:
        return '';
    }
  };

  // Calculate registration percentage
  const calculateRegistrationPercentage = (registrations: number, capacity: number) => {
    return Math.round((registrations / capacity) * 100);
  };

  return (
    <ProtectedRoute>
      <NewDashboardLayout>
        <div className="flex flex-col gap-6">
          {/* Page header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Events Management</h1>
            <p className="text-gray-500">
              Schedule and manage events across all nurseries.
            </p>
          </div>

          {/* Filters and actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
              <Button variant="outline" type="submit" className="h-9 px-3 flex-shrink-0">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Tabs
                value={viewType}
                onValueChange={(v) => setViewType(v as 'list' | 'calendar')}
                className="hidden sm:block"
              >
                <TabsList>
                  <TabsTrigger value="list" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> List
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" /> Calendar
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as EventStatus | 'all')}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
              
              <Button className="ml-auto flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                <span>New Event</span>
              </Button>
            </div>
          </div>

          {/* Events view - List */}
          {viewType === 'list' && (
            <Card>
              <CardHeader className="px-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle>Events</CardTitle>
                    <CardDescription>
                      All upcoming and past events
                    </CardDescription>
                  </div>
                  <Select value={selectedNursery || ''} onValueChange={setSelectedNursery}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Nurseries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Nurseries</SelectItem>
                      <SelectItem value="Hayes">Hayes</SelectItem>
                      <SelectItem value="Uxbridge">Uxbridge</SelectItem>
                      <SelectItem value="Hounslow">Hounslow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Nursery</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registrations</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.length > 0 ? (
                      filteredEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium max-w-[200px]">
                            <div className="truncate">{event.title}</div>
                            <div className="text-xs text-gray-500 truncate">{event.description}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-gray-500" />
                              <div>
                                <div className="text-sm">{formatDate(event.date)}</div>
                                <div className="text-xs text-gray-500">{event.time} ({event.duration})</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {event.nursery}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusVariant(event.status)} 
                              className={getStatusStyle(event.status)}
                            >
                              {event.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="text-sm">
                                {event.registrations}/{event.capacity}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${calculateRegistrationPercentage(event.registrations, event.capacity)}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  setSelectedEvent(event);
                                  setIsViewDialogOpen(true);
                                }}>
                                  <EyeIcon className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => {
                                    setSelectedEvent(event);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No events found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t px-6 py-4">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{filteredEvents.length}</span> of{" "}
                  <span className="font-medium">{events.length}</span> events
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={filteredEvents.length === events.length}>
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}

          {/* Events view - Calendar (placeholder) */}
          {viewType === 'calendar' && (
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>
                  View events in a monthly calendar layout
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center border rounded-md h-[400px] bg-gray-50 p-4">
                  <div className="text-center">
                    <CalendarClock className="h-12 w-12 text-primary/40 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Calendar View Coming Soon</h3>
                    <p className="text-sm text-gray-500 max-w-md mt-2">
                      The calendar view is under development. Use the list view to manage events for now.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Event Management Tips */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Event Planning Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium">Preparation Timeline</h3>
                  <p className="text-sm text-gray-500">
                    Start planning large events at least 6-8 weeks in advance. Send invitations 3-4 weeks before the event.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium">Resource Allocation</h3>
                  <p className="text-sm text-gray-500">
                    Assign specific resources and materials needed for the event well in advance to ensure everything is prepared.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium">Parent Communication</h3>
                  <p className="text-sm text-gray-500">
                    Send reminders 1 week and again 1 day before the event. Include all necessary details like what to bring.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Event Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Event Details</DialogTitle>
              <DialogDescription>
                View complete information about this event.
              </DialogDescription>
            </DialogHeader>

            {selectedEvent && (
              <div className="space-y-4 mt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{selectedEvent.title}</h2>
                  <Badge 
                    variant={getStatusVariant(selectedEvent.status)} 
                    className={getStatusStyle(selectedEvent.status)}
                  >
                    {selectedEvent.status}
                  </Badge>
                </div>

                <p className="text-gray-600">{selectedEvent.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span>{formatDate(selectedEvent.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 pl-6">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{selectedEvent.time} ({selectedEvent.duration})</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{selectedEvent.location}</span>
                    </div>
                    <div className="flex items-center gap-2 pl-6">
                      <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-[10px] text-primary font-bold">N</span>
                      </div>
                      <span>{selectedEvent.nursery} Nursery</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500">Registrations</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{selectedEvent.registrations} of {selectedEvent.capacity} spots filled</span>
                    </div>
                    <span className="text-sm font-medium">
                      {calculateRegistrationPercentage(selectedEvent.registrations, selectedEvent.capacity)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${calculateRegistrationPercentage(selectedEvent.registrations, selectedEvent.capacity)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-medium text-gray-500">Organizer</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-primary" />
                    <span>{selectedEvent.organizer}</span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex justify-between sm:justify-between">
              <Button
                type="button" 
                variant="outline" 
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
              <div className="space-x-2">
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Attendees
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this event? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {selectedEvent && (
              <div className="border rounded-md p-3 bg-gray-50">
                <h3 className="font-medium">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-500">{formatDate(selectedEvent.date)} at {selectedEvent.time}</p>
                <p className="text-sm text-gray-500">{selectedEvent.nursery} Nursery</p>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button" 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </NewDashboardLayout>
    </ProtectedRoute>
  );
}