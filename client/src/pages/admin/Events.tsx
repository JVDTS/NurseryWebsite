import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import DashboardLayout from '@/components/admin/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarPlus, Calendar, Clock, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLocation } from 'wouter';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  nurseryId: number;
}

export default function AdminEvents() {
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Extract nurseryId from URL if present
  const nurseryIdMatch = location.match(/\/admin\/nurseries\/(\d+)\/events/);
  const nurseryId = nurseryIdMatch ? parseInt(nurseryIdMatch[1], 10) : null;
  
  // Determine the API endpoint based on user role and current location
  const eventsEndpoint = nurseryId 
    ? `/api/admin/nurseries/${nurseryId}/events` 
    : '/api/admin/events';

  // Fetch events data
  const { data, isLoading, error } = useQuery<{ success: boolean; data: Event[] }>({
    queryKey: [eventsEndpoint],
  });

  // Format date to readable string
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (err) {
      return dateString;
    }
  };

  const getTitle = () => {
    if (nurseryId) {
      switch(nurseryId) {
        case 1: return "Hayes Nursery Events";
        case 2: return "Uxbridge Nursery Events";
        case 3: return "Hounslow Nursery Events";
        default: return "Nursery Events";
      }
    }
    return "All Nursery Events";
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title={getTitle()}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Upcoming Events</h2>
            <Button 
              onClick={() => setIsAddEventDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <CalendarPlus className="h-4 w-4" />
              Add New Event
            </Button>
          </div>

          <Card className="overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg m-6">
                An error occurred while loading events.
              </div>
            ) : !data?.data || data.data.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No events found.</p>
                <p className="text-gray-400 mt-2 mb-6">Create your first event to get started.</p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddEventDialogOpen(true)}
                  className="mx-auto"
                >
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {data.data.map((event: Event) => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 text-gray-800">{event.title}</h3>
                      <p className="text-gray-600 line-clamp-2 mb-4">{event.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Clock className="h-4 w-4 mr-2" />
                          {event.time}
                        </div>
                        <div className="flex items-center text-gray-500">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.location}
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-4 space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Add Event Dialog (placeholder) */}
        <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Event</DialogTitle>
              <DialogDescription>
                Create a new event for parents and children.
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 space-y-4">
              {/* Placeholder for event form - would be implemented with react-hook-form */}
              <p className="text-gray-600">The event creation form will be implemented here.</p>
            </div>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>Cancel</Button>
              <Button>Create Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}