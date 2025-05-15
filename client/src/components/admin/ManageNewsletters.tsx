import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from '@/components/ui/textarea';

import {
  FileText,
  Plus,
  Trash2,
  FileEdit,
  Eye,
  Download,
  MoreHorizontal,
  Loader2,
  Search,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Newsletter type definition
interface Newsletter {
  id: number;
  title: string;
  description: string;
  file: string;
  nurseryId: number;
  nurseryName: string;
  month: string;
  year: number;
  createdAt: string;
  updatedAt: string;
}

// Form schema for newsletter
const newsletterFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
  nurseryId: z.string().min(1, { message: "Please select a nursery" }),
  month: z.string().min(1, { message: "Please select a month" }),
  year: z.string().min(4, { message: "Please enter a valid year" }),
});

type NewsletterFormValues = z.infer<typeof newsletterFormSchema>;

export default function ManageNewsletters() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNursery, setSelectedNursery] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch newsletters
  const { data: newsletters = [], isLoading, error } = useQuery<Newsletter[]>({
    queryKey: ['/api/newsletters'],
  });

  // Add newsletter mutation
  const addNewsletterMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/newsletters', {
        method: 'POST',
        body: data,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add newsletter');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Newsletter added successfully',
        variant: 'default',
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/newsletters'] });
    },
    onError: (error) => {
      toast({
        title: 'Error adding newsletter',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Edit newsletter mutation
  const editNewsletterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: FormData }) => {
      const response = await fetch(`/api/newsletters/${id}`, {
        method: 'PUT',
        body: data,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update newsletter');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Newsletter updated successfully',
        variant: 'default',
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/newsletters'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating newsletter',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete newsletter mutation
  const deleteNewsletterMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/newsletters/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete newsletter');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Newsletter deleted successfully',
        variant: 'default',
      });
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/newsletters'] });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting newsletter',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Add newsletter form
  const addForm = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      title: '',
      description: '',
      nurseryId: '',
      month: '',
      year: new Date().getFullYear().toString(),
    },
  });

  // Edit newsletter form
  const editForm = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      title: '',
      description: '',
      nurseryId: '',
      month: '',
      year: '',
    },
  });

  // Handle add newsletter submission
  const onAddSubmit = (values: NewsletterFormValues) => {
    if (!fileToUpload) {
      toast({
        title: 'Please upload a file',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('nurseryId', values.nurseryId);
    formData.append('month', values.month);
    formData.append('year', values.year);
    formData.append('file', fileToUpload);

    addNewsletterMutation.mutate(formData);
  };

  // Handle edit newsletter submission
  const onEditSubmit = (values: NewsletterFormValues) => {
    if (!selectedNewsletter) return;

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('nurseryId', values.nurseryId);
    formData.append('month', values.month);
    formData.append('year', values.year);
    
    if (fileToUpload) {
      formData.append('file', fileToUpload);
    }

    editNewsletterMutation.mutate({ id: selectedNewsletter.id, data: formData });
  };

  // Handle delete newsletter
  const handleDelete = () => {
    if (!selectedNewsletter) return;
    deleteNewsletterMutation.mutate(selectedNewsletter.id);
  };

  // Initialize edit form with selected newsletter
  const initializeEditForm = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
    editForm.reset({
      title: newsletter.title,
      description: newsletter.description,
      nurseryId: newsletter.nurseryId.toString(),
      month: newsletter.month,
      year: newsletter.year.toString(),
    });
    setIsEditDialogOpen(true);
  };

  // Filter newsletters based on search and nursery selection
  const filteredNewsletters = newsletters.filter((newsletter) => {
    const matchesSearch = searchQuery === '' || 
      newsletter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      newsletter.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNursery = !selectedNursery || newsletter.nurseryId.toString() === selectedNursery;
    return matchesSearch && matchesNursery;
  });

  // Fetch nurseries for dropdown
  const { data: nurseries = [] } = useQuery<{id: number, name: string}[]>({
    queryKey: ['/api/nurseries'],
  });

  // Month options
  const months = [
    { value: 'January', label: 'January' },
    { value: 'February', label: 'February' },
    { value: 'March', label: 'March' },
    { value: 'April', label: 'April' },
    { value: 'May', label: 'May' },
    { value: 'June', label: 'June' },
    { value: 'July', label: 'July' },
    { value: 'August', label: 'August' },
    { value: 'September', label: 'September' },
    { value: 'October', label: 'October' },
    { value: 'November', label: 'November' },
    { value: 'December', label: 'December' },
  ];

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Manage Newsletters</h1>
        <p className="text-gray-500">
          Add, edit, and remove newsletters for all nurseries.
        </p>
      </div>

      {/* Filters and actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search newsletters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
          <Button variant="outline" type="submit" className="h-9 px-3 flex-shrink-0">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={selectedNursery} onValueChange={setSelectedNursery}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Nurseries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Nurseries</SelectItem>
              {nurseries.map((nursery) => (
                <SelectItem key={nursery.id} value={nursery.id.toString()}>
                  {nursery.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="ml-auto flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Newsletter</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Newsletter</DialogTitle>
                <DialogDescription>
                  Upload a new newsletter to share with parents and staff.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                  <FormField
                    control={addForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Monthly Newsletter" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="A brief description of this newsletter..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="nurseryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nursery</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select nursery" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {nurseries.map((nursery) => (
                                <SelectItem key={nursery.id} value={nursery.id.toString()}>
                                  {nursery.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={addForm.control}
                        name="month"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Month</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Month" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {months.map((month) => (
                                  <SelectItem key={month.value} value={month.value}>
                                    {month.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addForm.control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <FormItem>
                    <FormLabel>File</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept=".pdf,.doc,.docx" 
                        onChange={handleFileChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload PDF or Word document (max 10MB)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={addNewsletterMutation.isPending}
                    >
                      {addNewsletterMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Add Newsletter
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Newsletters table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Nursery</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>File</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2">Loading newsletters...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-destructive">
                      <AlertCircle className="h-8 w-8 mb-2" />
                      <p>Error loading newsletters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredNewsletters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <p className="text-muted-foreground">No newsletters found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredNewsletters.map((newsletter: Newsletter) => (
                  <TableRow key={newsletter.id}>
                    <TableCell>
                      <div className="font-medium">{newsletter.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {newsletter.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{newsletter.nurseryName}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                        <span>
                          {newsletter.month} {newsletter.year}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Added: {formatDate(newsletter.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <a 
                        href={`/uploads/${newsletter.file}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        <span>View PDF</span>
                      </a>
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
                          <DropdownMenuItem asChild>
                            <a 
                              href={`/uploads/${newsletter.file}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => initializeEditForm(newsletter)}>
                            <FileEdit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a 
                              href={`/uploads/${newsletter.file}`} 
                              download
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedNewsletter(newsletter);
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
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit newsletter dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Newsletter</DialogTitle>
            <DialogDescription>
              Update the newsletter information.
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
                      <Input {...field} />
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
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="nurseryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nursery</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select nursery" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {nurseries.map((nursery) => (
                            <SelectItem key={nursery.id} value={nursery.id.toString()}>
                              {nursery.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={editForm.control}
                    name="month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Month</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <FormItem>
                <FormLabel>Replace File (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    onChange={handleFileChange}
                  />
                </FormControl>
                <FormDescription>
                  Leave empty to keep the current file
                </FormDescription>
              </FormItem>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={editNewsletterMutation.isPending}
                >
                  {editNewsletterMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this newsletter? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedNewsletter && (
            <div className="bg-muted p-3 rounded-md">
              <p className="font-medium">{selectedNewsletter.title}</p>
              <p className="text-sm text-muted-foreground">
                {selectedNewsletter.month} {selectedNewsletter.year} - {selectedNewsletter.nurseryName}
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteNewsletterMutation.isPending}
            >
              {deleteNewsletterMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Newsletter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}