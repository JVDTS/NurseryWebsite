import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import NewDashboardLayout from '@/components/admin/NewDashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import {
  Plus,
  Search,
  FileText,
  Newspaper,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  FileImage,
  Calendar,
  ChevronDown
} from 'lucide-react';

export default function ContentManagement() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNursery, setSelectedNursery] = useState<string | null>(null);
  const [contentType, setContentType] = useState('posts');

  // Sample data for demonstration
  const posts = [
    {
      id: 1,
      title: 'Summer Activities for Children',
      status: 'published',
      nursery: 'Hayes',
      author: 'Sarah Johnson',
      date: 'May 10, 2025',
      views: 245
    },
    {
      id: 2,
      title: 'New Curriculum Announcement',
      status: 'draft',
      nursery: 'Uxbridge',
      author: 'John Smith',
      date: 'May 8, 2025',
      views: 0
    },
    {
      id: 3,
      title: 'Parent-Teacher Meeting Schedule',
      status: 'published',
      nursery: 'Hounslow',
      author: 'Emma Taylor',
      date: 'May 5, 2025',
      views: 189
    },
    {
      id: 4,
      title: 'Health and Safety Guidelines Update',
      status: 'published',
      nursery: 'Hayes',
      author: 'Sarah Johnson',
      date: 'May 1, 2025',
      views: 302
    },
    {
      id: 5,
      title: 'Fun Activities for Spring Season',
      status: 'draft',
      nursery: 'Hounslow',
      author: 'Mark Wilson',
      date: 'April 28, 2025',
      views: 0
    }
  ];

  const newsletters = [
    {
      id: 1,
      title: 'May 2025 Monthly Newsletter',
      status: 'published',
      nursery: 'Hayes',
      author: 'Sarah Johnson',
      date: 'May 1, 2025',
      format: 'PDF'
    },
    {
      id: 2,
      title: 'April 2025 Monthly Newsletter',
      status: 'published',
      nursery: 'Uxbridge',
      author: 'John Smith',
      date: 'April 1, 2025',
      format: 'PDF'
    },
    {
      id: 3,
      title: 'March 2025 Monthly Newsletter',
      status: 'published',
      nursery: 'Hounslow',
      author: 'Emma Taylor',
      date: 'March 1, 2025',
      format: 'PDF'
    },
    {
      id: 4,
      title: 'Summer Term Special Newsletter',
      status: 'draft',
      nursery: 'Hayes',
      author: 'Sarah Johnson',
      date: 'May 14, 2025',
      format: 'HTML'
    }
  ];

  // Filtered content based on search query and selected nursery
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNursery = !selectedNursery || post.nursery === selectedNursery;
    return matchesSearch && matchesNursery;
  });

  const filteredNewsletters = newsletters.filter(newsletter => {
    const matchesSearch = searchQuery === '' || 
      newsletter.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNursery = !selectedNursery || newsletter.nursery === selectedNursery;
    return matchesSearch && matchesNursery;
  });

  // Get content based on selected type
  const getContentData = () => {
    switch(contentType) {
      case 'posts':
        return filteredPosts;
      case 'newsletters':
        return filteredNewsletters;
      default:
        return [];
    }
  };

  const contentData = getContentData();
  
  return (
    <ProtectedRoute>
      <NewDashboardLayout>
        <div className="flex flex-col gap-6">
          {/* Page header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
            <p className="text-gray-500">
              Manage all your content in one place - posts, newsletters, and more.
            </p>
          </div>

          {/* Filters and actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Search content..."
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
                value={contentType}
                onValueChange={setContentType}
                className="w-full sm:w-auto"
              >
                <TabsList>
                  <TabsTrigger value="posts" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" /> Posts
                  </TabsTrigger>
                  <TabsTrigger value="newsletters" className="flex items-center gap-1">
                    <Newspaper className="h-4 w-4" /> Newsletters
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button className="ml-auto flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                <span>New {contentType.slice(0, -1)}</span>
              </Button>
            </div>
          </div>

          {/* Main content */}
          <Card>
            <CardHeader className="px-6">
              <CardTitle>
                {contentType === 'posts' ? 'Blog Posts' : 'Newsletters'}
              </CardTitle>
              <CardDescription>
                {contentType === 'posts' 
                  ? 'Create and manage blog posts for your nursery website' 
                  : 'Manage and distribute newsletters to parents'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Nursery</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentData.length > 0 ? (
                    contentData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === 'published' ? 'default' : 'secondary'} 
                                 className={item.status === 'published' ? 'bg-green-500 hover:bg-green-600' : ''}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.nursery}</TableCell>
                        <TableCell>{item.author}</TableCell>
                        <TableCell>{item.date}</TableCell>
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
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
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
                        No content found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t px-6 py-4">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{contentData.length}</span> of{" "}
                <span className="font-medium">
                  {contentType === 'posts' ? posts.length : newsletters.length}
                </span>{" "}
                items
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

          {/* Content creation tips */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Content Creation Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium">Keep it engaging</h3>
                  <p className="text-sm text-gray-500">
                    Use clear, simple language that parents can easily understand. Include engaging images where appropriate.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium">Be consistent</h3>
                  <p className="text-sm text-gray-500">
                    Maintain a regular posting schedule for newsletters and updates to keep parents informed.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium">Highlight achievements</h3>
                  <p className="text-sm text-gray-500">
                    Showcase children's work and nursery achievements to build community engagement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </NewDashboardLayout>
    </ProtectedRoute>
  );
}