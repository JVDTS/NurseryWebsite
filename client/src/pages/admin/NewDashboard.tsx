import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import NewDashboardLayout from '@/components/admin/NewDashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Users, 
  FileText, 
  Clock, 
  BarChart2, 
  TrendingUp, 
  Mail, 
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Info,
  ImageIcon,
  Newspaper,
  CalendarDays,
} from 'lucide-react';

export default function NewDashboard() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('weekly');

  // Fetch actual data from database
  const { data: galleryImages = [] } = useQuery({
    queryKey: ['/api/gallery'],
  });
  
  const { data: newsletters = [] } = useQuery({
    queryKey: ['/api/newsletters'],
  });
  
  const { data: events = [] } = useQuery({
    queryKey: ['/api/events'],
  });
  
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Calculate actual metrics from database data
  const [contentMetrics, setContentMetrics] = useState({
    weekly: {
      newsletters: 0,
      galleryImages: 0,
      blogPosts: 0,
      eventsCreated: 0,
    },
    monthly: {
      newsletters: 0,
      galleryImages: 0,
      blogPosts: 0,
      eventsCreated: 0,
    },
    yearly: {
      newsletters: 0,
      galleryImages: 0,
      blogPosts: 0,
      eventsCreated: 0,
    },
  });
  
  // Update metrics when data is loaded
  useEffect(() => {
    // Calculate actual counts
    const actualCounts = {
      newsletters: newsletters?.length || 0,
      galleryImages: galleryImages?.length || 0,
      events: events?.length || 0,
      users: users?.length || 0,
    };
    
    // Update all timeframes with actual data
    setContentMetrics({
      weekly: {
        newsletters: actualCounts.newsletters,
        galleryImages: actualCounts.galleryImages,
        blogPosts: 0, // No blog posts implemented yet
        eventsCreated: actualCounts.events,
      },
      monthly: {
        newsletters: actualCounts.newsletters,
        galleryImages: actualCounts.galleryImages,
        blogPosts: 0, // No blog posts implemented yet
        eventsCreated: actualCounts.events,
      },
      yearly: {
        newsletters: actualCounts.newsletters,
        galleryImages: actualCounts.galleryImages,
        blogPosts: 0, // No blog posts implemented yet
        eventsCreated: actualCounts.events,
      }
    });
  }, [newsletters, galleryImages, events, users]);

  // Recent activities (would normally come from an API)
  const recentActivities = [
    {
      id: 1,
      type: 'content_update',
      description: 'Summer Activities for Children post updated',
      user: 'Sarah Johnson',
      nursery: 'Hayes',
      timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
    },
    {
      id: 2,
      type: 'new_event',
      description: 'New event added: Parent-Teacher Meeting',
      user: 'John Smith',
      nursery: 'Uxbridge',
      timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
      id: 3,
      type: 'newsletter',
      description: 'Monthly newsletter published for May',
      user: 'Emma Taylor',
      nursery: 'Hounslow',
      timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    },
    {
      id: 4,
      type: 'contact',
      description: 'New contact form submission received',
      user: 'System',
      nursery: 'Hayes',
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
  ];

  // Upcoming events (would normally come from an API)
  const upcomingEvents = [
    {
      id: 1,
      title: 'Parent-Teacher Conference',
      date: new Date(Date.now() + 2 * 24 * 3600000).toISOString(),
      nursery: 'Hayes',
      status: 'confirmed',
    },
    {
      id: 2,
      title: 'Summer Fair Preparation',
      date: new Date(Date.now() + 5 * 24 * 3600000).toISOString(),
      nursery: 'Uxbridge',
      status: 'confirmed',
    },
    {
      id: 3,
      title: 'Staff Training Day',
      date: new Date(Date.now() + 9 * 24 * 3600000).toISOString(),
      nursery: 'Hounslow',
      status: 'tentative',
    },
  ];

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  return (
    <ProtectedRoute>
      <NewDashboardLayout>
        <div className="flex flex-col gap-6">
          {/* Page header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-gray-500">
              Welcome back, {user?.firstName || 'Admin'}! Here's what's happening across your nurseries.
            </p>
          </div>

          {/* Content Metrics Overview */}
          <Tabs defaultValue="weekly" className="space-y-4" onValueChange={setTimeframe}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Content Overview</h2>
              <TabsList>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="weekly" className="space-y-0 mt-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Newsletters
                    </CardTitle>
                    <Newspaper className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentMetrics.weekly.newsletters}</div>
                    <p className="text-xs text-muted-foreground">
                      {(contentMetrics.weekly.newsletters / 3).toFixed(1)} per nursery
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Gallery Images
                    </CardTitle>
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentMetrics.weekly.galleryImages}</div>
                    <p className="text-xs text-muted-foreground">
                      {(contentMetrics.weekly.galleryImages / 7).toFixed(1)} per day
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Blog Posts
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentMetrics.weekly.blogPosts}</div>
                    <p className="text-xs text-muted-foreground">
                      {(contentMetrics.weekly.blogPosts / 3).toFixed(1)} per nursery
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Events Created
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentMetrics.weekly.eventsCreated}</div>
                    <p className="text-xs text-muted-foreground">
                      {(contentMetrics.weekly.eventsCreated / 3).toFixed(1)} per nursery
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="monthly" className="mt-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Newsletters
                    </CardTitle>
                    <Newspaper className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentMetrics.monthly.newsletters}</div>
                    <p className="text-xs text-muted-foreground">
                      {(contentMetrics.monthly.newsletters / 3).toFixed(1)} per nursery
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Gallery Images
                    </CardTitle>
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentMetrics.monthly.galleryImages}</div>
                    <p className="text-xs text-muted-foreground">
                      {(contentMetrics.monthly.galleryImages / 30).toFixed(1)} per day
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Blog Posts
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentMetrics.monthly.blogPosts}</div>
                    <p className="text-xs text-muted-foreground">
                      {(contentMetrics.monthly.blogPosts / 3).toFixed(1)} per nursery
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Events Created
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentMetrics.monthly.eventsCreated}</div>
                    <p className="text-xs text-muted-foreground">
                      {(contentMetrics.monthly.eventsCreated / 3).toFixed(1)} per nursery
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="yearly" className="mt-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Newsletters
                    </CardTitle>
                    <Newspaper className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentMetrics.yearly.newsletters}</div>
                    <p className="text-xs text-muted-foreground">
                      {(contentMetrics.yearly.newsletters / 3).toFixed(1)} per nursery
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Gallery Images
                    </CardTitle>
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentMetrics.yearly.galleryImages}</div>
                    <p className="text-xs text-muted-foreground">
                      {(contentMetrics.yearly.galleryImages / 365).toFixed(1)} per day
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Blog Posts
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentMetrics.yearly.blogPosts}</div>
                    <p className="text-xs text-muted-foreground">
                      {(contentMetrics.yearly.blogPosts / 3).toFixed(1)} per nursery
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Events Created
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentMetrics.yearly.eventsCreated}</div>
                    <p className="text-xs text-muted-foreground">
                      {(contentMetrics.yearly.eventsCreated / 3).toFixed(1)} per nursery
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Middle row: Recent Activity & Upcoming Events */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Activity */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates across all nurseries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-start gap-4 rounded-lg border p-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        {activity.type === 'content_update' && (
                          <FileText className="h-4 w-4 text-primary" />
                        )}
                        {activity.type === 'new_event' && (
                          <Calendar className="h-4 w-4 text-primary" />
                        )}
                        {activity.type === 'newsletter' && (
                          <Mail className="h-4 w-4 text-primary" />
                        )}
                        {activity.type === 'contact' && (
                          <Info className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {activity.user}
                          </p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <Badge variant="outline" className="text-xs">
                            {activity.nursery}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(activity.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>

            {/* Upcoming Events */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>
                  Schedule for the next two weeks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className="flex items-start gap-4 rounded-lg border p-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(event.date)}
                          </p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <Badge variant="outline" className="text-xs">
                            {event.nursery}
                          </Badge>
                        </div>
                      </div>
                      <Badge 
                        variant={event.status === 'confirmed' ? 'default' : 'secondary'}
                        className={event.status === 'confirmed' ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {event.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Manage Calendar
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Bottom row: Quick Links */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button 
                  variant="outline" 
                  className="h-auto flex-col items-center justify-center gap-2 p-4"
                >
                  <FileText className="h-5 w-5" />
                  <span>Add New Post</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col items-center justify-center gap-2 p-4"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Schedule Event</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col items-center justify-center gap-2 p-4"
                >
                  <Mail className="h-5 w-5" />
                  <span>Send Newsletter</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col items-center justify-center gap-2 p-4"
                >
                  <Users className="h-5 w-5" />
                  <span>Manage Staff</span>
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </NewDashboardLayout>
    </ProtectedRoute>
  );
}