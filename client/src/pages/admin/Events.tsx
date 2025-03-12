import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useNurserySelector, ALL_NURSERIES } from '@/hooks/use-nursery-selector';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Pencil, Trash2, Plus, Loader2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Types for the events
interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  nurseryId: number;
}

// Define the validation schema for event form
const eventFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  date: z.date({ required_error: 'Please select a date' }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Please enter a valid time (HH:MM)' }),
  location: z.string().min(3, { message: 'Location must be at least 3 characters' }),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function AdminEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { selectedNurseryId, isAllNurseries } = useNurserySelector();
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Get nurseryId for fetching events based on user role or selected nursery
  const nurseryId = user?.role === 'super_admin' 
    ? (selectedNurseryId === ALL_NURSERIES ? null : selectedNurseryId) 
    : user?.nurseryId || 0;
  
  const isSuperAdmin = user?.role === 'super_admin';

  // Create form for adding new events
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      time: '',
      location: '',
    },
  });

  // Create form for editing events
  const editForm = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      time: '',
      location: '',
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!isAddEventOpen) {
      form.reset();
    }
  }, [isAddEventOpen, form]);

  // Reset edit form when dialog closes
  useEffect(() => {
    if (!isEditEventOpen) {
      editForm.reset();
    }
  }, [isEditEventOpen, editForm]);

  // Set form values when editing an event
  useEffect(() => {
    if (selectedEvent && isEditEventOpen) {
      editForm.setValue('title', selectedEvent.title);
      editForm.setValue('description', selectedEvent.description);
      editForm.setValue('time', selectedEvent.time);
      editForm.setValue('location', selectedEvent.location);
      
      // Convert string date to Date object
      const [year, month, day] = selectedEvent.date.split('-').map(Number);
      editForm.setValue('date', new Date(year, month - 1, day));
    }
  }, [selectedEvent, isEditEventOpen, editForm]);

  // Fetch events based on user role and selected nursery
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: isSuperAdmin 
      ? (isAllNurseries ? ['/api/admin/events'] : [`/api/admin/nurseries/${selectedNurseryId || 0}/events`])
      : [`/api/admin/nurseries/${nurseryId || 0}/events`],
    enabled: !!user && (isSuperAdmin ? true : !!nurseryId),
  });

  // Mutation for adding a new event
  const addEventMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      // Format the date to YYYY-MM-DD
      const formattedDate = format(data.date, 'yyyy-MM-dd');
      
      // For super admin, use the selected nursery ID
      const targetNurseryId = isSuperAdmin ? selectedNurseryId : nurseryId;
      
      // Ensure we're not trying to add to "All Nurseries"
      if (targetNurseryId === ALL_NURSERIES) {
        throw new Error("Please select a specific nursery to add an event");
      }
      
      return apiRequest('POST', `/api/admin/nurseries/${targetNurseryId}/events`, {
        ...data,
        date: formattedDate,
        nurseryId: targetNurseryId,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Event Created',
        description: 'The event has been created successfully.',
      });
      setIsAddEventOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/admin/nurseries/${nurseryId || 0}/events`] });
      if (isSuperAdmin) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create event: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation for updating an event
  const updateEventMutation = useMutation({
    mutationFn: async (data: EventFormValues & { id: number }) => {
      // Format the date to YYYY-MM-DD
      const formattedDate = format(data.date, 'yyyy-MM-dd');
      
      return apiRequest('PUT', `/api/admin/events/${data.id}`, {
        ...data,
        date: formattedDate,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Event Updated',
        description: 'The event has been updated successfully.',
      });
      setIsEditEventOpen(false);
      setSelectedEvent(null);
      queryClient.invalidateQueries({ queryKey: [`/api/admin/nurseries/${nurseryId || 0}/events`] });
      if (isSuperAdmin) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update event: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation for deleting an event
  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/events/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Event Deleted',
        description: 'The event has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/nurseries/${nurseryId || 0}/events`] });
      if (isSuperAdmin) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete event: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle form submission for adding a new event
  const onSubmit = (data: EventFormValues) => {
    addEventMutation.mutate(data);
  };

  // Handle form submission for editing an event
  const onEditSubmit = (data: EventFormValues) => {
    if (selectedEvent) {
      updateEventMutation.mutate({ ...data, id: selectedEvent.id });
    }
  };

  // Function to handle edit button click
  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEditEventOpen(true);
  };

  // Function to handle delete button click
  const handleDeleteEvent = (id: number) => {
    deleteEventMutation.mutate(id);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-UK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Events Management">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                {isSuperAdmin 
                  ? `Manage events for ${isAllNurseries 
                      ? 'all nurseries' 
                      : `${selectedNurseryId ? getNurseryName(selectedNurseryId) : 'Unknown'} nursery`}`
                  : 'Manage events for your nursery'}
              </CardDescription>
            </div>
            
            {/* Add Event Button and Dialog */}
            <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
              {(!isSuperAdmin || (isSuperAdmin && !isAllNurseries)) && (
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </DialogTrigger>
              )}
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the new event.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Event title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={`w-full pl-3 text-left font-normal ${
                                      !field.value && "text-muted-foreground"
                                    }`}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 14:30" {...field} />
                            </FormControl>
                            <FormDescription>
                              Use 24-hour format (HH:MM)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Event location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Provide details about the event"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" disabled={addEventMutation.isPending}>
                        {addEventMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Event'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No events found. Click "Add Event" to create one.
              </div>
            ) : (
              <Table>
                <TableCaption>List of upcoming events</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Location</TableHead>
                    {isSuperAdmin && <TableHead>Nursery</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event: Event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{formatDate(event.date)}</TableCell>
                      <TableCell>{event.time}</TableCell>
                      <TableCell>{event.location}</TableCell>
                      {isSuperAdmin && <TableCell>{getNurseryName(event.nurseryId)}</TableCell>}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Event</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this event? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteEvent(event.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Event Dialog */}
        <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Update the details for this event.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Event title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full pl-3 text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 14:30" {...field} />
                        </FormControl>
                        <FormDescription>
                          Use 24-hour format (HH:MM)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Event location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide details about the event"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={updateEventMutation.isPending}>
                    {updateEventMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Event'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// Helper function to get nursery name from ID
function getNurseryName(nurseryId: number): string {
  switch(nurseryId) {
    case 1: return 'Hayes';
    case 2: return 'Uxbridge';
    case 3: return 'Hounslow';
    default: return 'Unknown';
  }
}