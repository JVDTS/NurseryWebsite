import React, { useState } from 'react';
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
} from 'lucide-react';

export default function NewDashboard() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('weekly');

  // Simulated data
  const analytics = {
    weekly: {
      visitors: 1245,
      contactSubmissions: 28,
      newsletterSignups: 37,
      visitorIncrease: 12.5,
    },
    monthly: {
      visitors: 5250,
      contactSubmissions: 124,
      newsletterSignups: 156,
      visitorIncrease: 8.3,
    },
    yearly: {
      visitors: 62500,
      contactSubmissions: 1450,
      newsletterSignups: 1820,
      visitorIncrease: 24.7,
    },
  };

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

          {/* Analytics Overview */}
          <Tabs defaultValue="weekly" className="space-y-4" onValueChange={setTimeframe}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Analytics Overview</h2>
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
                      Website Visitors
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.weekly.visitors.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <span className={analytics.weekly.visitorIncrease > 0 ? "text-green-500" : "text-red-500"}>
                        {analytics.weekly.visitorIncrease > 0 ? "+" : ""}{analytics.weekly.visitorIncrease}%
                      </span>
                      <span className="ml-1">from last week</span>
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Contact Submissions
                    </CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.weekly.contactSubmissions}</div>
                    <p className="text-xs text-muted-foreground">
                      {(analytics.weekly.contactSubmissions / 7).toFixed(1)} per day
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Newsletter Signups
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.weekly.newsletterSignups}</div>
                    <p className="text-xs text-muted-foreground">
                      {(analytics.weekly.newsletterSignups / 7).toFixed(1)} per day
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Site Performance
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">98.2%</div>
                    <p className="text-xs text-muted-foreground">
                      Uptime this week
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
                      Website Visitors
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.monthly.visitors.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <span className={analytics.monthly.visitorIncrease > 0 ? "text-green-500" : "text-red-500"}>
                        {analytics.monthly.visitorIncrease > 0 ? "+" : ""}{analytics.monthly.visitorIncrease}%
                      </span>
                      <span className="ml-1">from last month</span>
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Contact Submissions
                    </CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.monthly.contactSubmissions}</div>
                    <p className="text-xs text-muted-foreground">
                      {(analytics.monthly.contactSubmissions / 30).toFixed(1)} per day
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Newsletter Signups
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.monthly.newsletterSignups}</div>
                    <p className="text-xs text-muted-foreground">
                      {(analytics.monthly.newsletterSignups / 30).toFixed(1)} per day
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Site Performance
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">99.1%</div>
                    <p className="text-xs text-muted-foreground">
                      Uptime this month
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
                      Website Visitors
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.yearly.visitors.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <span className={analytics.yearly.visitorIncrease > 0 ? "text-green-500" : "text-red-500"}>
                        {analytics.yearly.visitorIncrease > 0 ? "+" : ""}{analytics.yearly.visitorIncrease}%
                      </span>
                      <span className="ml-1">from last year</span>
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Contact Submissions
                    </CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.yearly.contactSubmissions}</div>
                    <p className="text-xs text-muted-foreground">
                      {(analytics.yearly.contactSubmissions / 365).toFixed(1)} per day avg.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Newsletter Signups
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.yearly.newsletterSignups}</div>
                    <p className="text-xs text-muted-foreground">
                      {(analytics.yearly.newsletterSignups / 365).toFixed(1)} per day avg.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Site Performance
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">99.3%</div>
                    <p className="text-xs text-muted-foreground">
                      Uptime this year
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