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
  const [contentType, setContentType] = useState('newsletters');

  // Fetch real newsletters from the API
  const { data: newsletters = [] } = useQuery({
    queryKey: ['/api/newsletters'],
  });

  // Filter newsletters based on search query and selected nursery
  const filteredNewsletters = newsletters.filter((newsletter: any) => {
    const matchesSearch = searchQuery === '' || 
      (newsletter.title && newsletter.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesNursery = !selectedNursery || 
      (newsletter.nursery && newsletter.nursery.toLowerCase() === selectedNursery.toLowerCase());
    return matchesSearch && matchesNursery;
  });

  // Only using newsletters now
  const contentData = filteredNewsletters;
  
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
              {/* No tabs needed with only newsletters */}
              <div className="flex items-center gap-1">
                <Newspaper className="h-4 w-4" /> 
                <span className="font-medium">Newsletters</span>
              </div>
              
              <Button className="ml-auto flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                <span>New Newsletter</span>
              </Button>
            </div>
          </div>

          {/* Main content */}
          <Card>
            <CardHeader className="px-6">
              <CardTitle>
                Newsletters
              </CardTitle>
              <CardDescription>
                Manage and distribute newsletters to parents
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Nursery</TableHead>
                    <TableHead>Month/Year</TableHead>
                    <TableHead>Date Created</TableHead>
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
                        <TableCell>
                          {item.nurseryId === 1 ? 'Hayes' : 
                           item.nurseryId === 2 ? 'Uxbridge' : 
                           item.nurseryId === 3 ? 'Hounslow' : 'Unknown'}
                        </TableCell>
                        <TableCell>{item.month} {item.year}</TableCell>
                        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
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
                  {newsletters.length}
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