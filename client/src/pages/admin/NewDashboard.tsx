import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import NewDashboardLayout from '@/components/admin/NewDashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

import {
  BarChart3,
  Users,
  FileText,
  Image,
  CalendarRange,
  ArrowRight,
  Plus,
  MoreHorizontal,
  TrendingUp,
  Eye,
  Clock,
  Calendar
} from 'lucide-react';

export default function NewDashboard() {
  const { user } = useAuth();
  const [selectedNurseryId, setSelectedNurseryId] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Statistics
  const [stats, setStats] = useState({
    totalUsers: 8,
    totalContent: 12,
    totalEvents: 5,
    totalImages: 24,
    recentActivity: [
      { 
        id: 1, 
        action: 'added a new event', 
        user: 'Sarah Johnson', 
        nursery: 'Hayes', 
        time: '10 minutes ago', 
        avatar: '/avatars/sarah.jpg' 
      },
      { 
        id: 2, 
        action: 'uploaded gallery images', 
        user: 'John Smith', 
        nursery: 'Uxbridge', 
        time: '2 hours ago',
        avatar: '/avatars/john.jpg'
      },
      { 
        id: 3, 
        action: 'edited newsletter content', 
        user: 'Emma Taylor', 
        nursery: 'Hounslow', 
        time: '4 hours ago',
        avatar: '/avatars/emma.jpg'
      },
      { 
        id: 4, 
        action: 'updated staff schedule', 
        user: 'Mark Wilson', 
        nursery: 'Hayes', 
        time: 'Yesterday at 3:45 PM',
        avatar: '/avatars/mark.jpg'
      },
    ],
    upcomingEvents: [
      {
        id: 1,
        title: 'Parent-Teacher Meeting',
        nursery: 'Hayes',
        date: 'Jun 15, 2025',
        time: '3:00 PM - 6:00 PM'
      },
      {
        id: 2,
        title: 'Summer Fair',
        nursery: 'All Nurseries',
        date: 'Jul 10, 2025',
        time: '11:00 AM - 4:00 PM'
      },
      {
        id: 3,
        title: 'Staff Training Day',
        nursery: 'Uxbridge',
        date: 'Jun 22, 2025',
        time: '9:00 AM - 2:00 PM'
      }
    ],
    contentPerformance: [
      {
        id: 1,
        title: 'Summer Activities Newsletter',
        views: 145,
        nursery: 'Hayes',
        progress: 78
      },
      {
        id: 2,
        title: 'New Curriculum Announcement',
        views: 98,
        nursery: 'Hounslow',
        progress: 52
      },
      {
        id: 3,
        title: 'Staff Introduction',
        views: 204,
        nursery: 'Uxbridge',
        progress: 92
      }
    ]
  });

  // Fetch data based on selected nursery
  const { data: nurseriesData } = useQuery({
    queryKey: ['/api/nurseries'],
    enabled: !!user
  });

  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <ProtectedRoute>
      <NewDashboardLayout>
        <div className="flex flex-col gap-6">
          {/* Dashboard header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-gray-500">
              Welcome back, {user?.firstName}! Here's what's happening across your nurseries.
            </p>
          </div>

          {/* Stats cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                <Users className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-gray-500">
                  Across all nursery locations
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Content Pieces</CardTitle>
                <FileText className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalContent}</div>
                <p className="text-xs text-gray-500">
                  +2 added this week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <CalendarRange className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
                <p className="text-xs text-gray-500">
                  Next: Parent-Teacher Meeting
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Gallery Images</CardTitle>
                <Image className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalImages}</div>
                <p className="text-xs text-gray-500">
                  +8 uploaded this month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="grid gap-6 md:grid-cols-6">
            {/* Activity feed */}
            <Card className="col-span-6 md:col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions across all nurseries
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start p-4 border-b last:border-0">
                      <Avatar className="h-9 w-9 mr-4">
                        <AvatarImage src={activity.avatar} alt={activity.user} />
                        <AvatarFallback>{getInitials(activity.user)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium">{activity.user}</p>
                          <span className="text-sm text-gray-500">{activity.action}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{activity.nursery}</Badge>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" size="sm" className="w-full">
                  <span>View all activity</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* Upcoming events */}
            <Card className="col-span-6 md:col-span-2">
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>
                  Events scheduled for this month
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {stats.upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start p-4 border-b last:border-0">
                      <div className="mr-4 rounded-md bg-primary/10 p-2">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <Badge variant="outline" className="mr-1">{event.nursery}</Badge>
                        <div className="flex items-center text-xs text-gray-500">
                          <p>
                            {event.date} • {event.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Add new event</span>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Content analytics */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Content Performance</CardTitle>
                  <CardDescription>
                    Analytics for your most viewed content
                  </CardDescription>
                </div>
                <Tabs defaultValue="week" className="w-[200px]">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="year">Year</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {stats.contentPerformance.map((content) => (
                  <div key={content.id} className="flex items-center p-4 border-b last:border-0">
                    <div className="grid gap-1 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{content.title}</div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">{content.views}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{content.nursery}</Badge>
                        <div className="flex items-center gap-1 ml-2">
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                          <span className="text-xs text-emerald-500">+{content.progress / 10}%</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Progress value={content.progress} className="h-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="outline" size="sm" className="w-full">
                <span>View all analytics</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Quick actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Button asChild className="h-24 flex-col shadow-md">
              <Link href="/admin/content">
                <FileText className="h-6 w-6 mb-2" />
                <span>Create Content</span>
              </Link>
            </Button>
            <Button asChild className="h-24 flex-col shadow-md">
              <Link href="/admin/gallery">
                <Image className="h-6 w-6 mb-2" />
                <span>Upload Images</span>
              </Link>
            </Button>
            <Button asChild className="h-24 flex-col shadow-md">
              <Link href="/admin/events">
                <CalendarRange className="h-6 w-6 mb-2" />
                <span>Schedule Event</span>
              </Link>
            </Button>
          </div>
        </div>
      </NewDashboardLayout>
    </ProtectedRoute>
  );
}