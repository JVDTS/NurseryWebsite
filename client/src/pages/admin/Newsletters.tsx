import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, FileText, Plus, Loader2, Pencil, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Types for newsletters
interface Newsletter {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  publishDate: string;
  nurseryId: number;
}

// Define the validation schema for newsletter form
const newsletterFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters' }),
  fileUrl: z.string().url({ message: 'Please enter a valid URL for the file' }),
  publishDate: z.date({
    required_error: "Please select a date",
  }),
});

type NewsletterFormValues = z.infer<typeof newsletterFormSchema>;

export default function AdminNewsletters() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddNewsletterOpen, setIsAddNewsletterOpen] = useState(false);
  const [isEditNewsletterOpen, setIsEditNewsletterOpen] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);

  // Get nurseryId for fetching newsletters
  const nurseryId = user?.nurseryId || 0;
  const isSuperAdmin = user?.role === 'super_admin';

  // Create form for adding new newsletters
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      title: '',
      description: '',
      fileUrl: '',
    },
  });

  // Create form for editing newsletters
  const editForm = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      title: '',
      description: '',
      fileUrl: '',
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!isAddNewsletterOpen) {
      form.reset();
    }
  }, [isAddNewsletterOpen, form]);

  // Reset edit form when dialog closes
  useEffect(() => {
    if (!isEditNewsletterOpen) {
      editForm.reset();
    }
  }, [isEditNewsletterOpen, editForm]);

  // Set form values when editing a newsletter
  useEffect(() => {
    if (selectedNewsletter && isEditNewsletterOpen) {
      editForm.setValue('title', selectedNewsletter.title);
      editForm.setValue('description', selectedNewsletter.description);
      editForm.setValue('fileUrl', selectedNewsletter.fileUrl);
      
      // Convert string date to Date object
      const [year, month, day] = selectedNewsletter.publishDate.split('-').map(Number);
      editForm.setValue('publishDate', new Date(year, month - 1, day));
    }
  }, [selectedNewsletter, isEditNewsletterOpen, editForm]);

  // Fetch newsletters based on user role
  const { data: newsletters = [], isLoading } = useQuery<Newsletter[]>({
    queryKey: isSuperAdmin ? ['/api/admin/newsletters'] : [`/api/admin/nurseries/${nurseryId}/newsletters`],
    enabled: !!user,
  });

  // Mutation for adding a new newsletter
  const addNewsletterMutation = useMutation({
    mutationFn: async (data: NewsletterFormValues) => {
      // Format the date to YYYY-MM-DD
      const formattedDate = format(data.publishDate, 'yyyy-MM-dd');
      
      return apiRequest('POST', `/api/admin/nurseries/${nurseryId}/newsletters`, {
        ...data,
        publishDate: formattedDate,
        nurseryId: nurseryId,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Newsletter Created',
        description: 'The newsletter has been created successfully.',
      });
      setIsAddNewsletterOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/admin/nurseries/${nurseryId}/newsletters`] });
      if (isSuperAdmin) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/newsletters'] });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create newsletter: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation for updating a newsletter
  const updateNewsletterMutation = useMutation({
    mutationFn: async (data: NewsletterFormValues & { id: number }) => {
      // Format the date to YYYY-MM-DD
      const formattedDate = format(data.publishDate, 'yyyy-MM-dd');
      
      return apiRequest('PUT', `/api/admin/newsletters/${data.id}`, {
        ...data,
        publishDate: formattedDate,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Newsletter Updated',
        description: 'The newsletter has been updated successfully.',
      });
      setIsEditNewsletterOpen(false);
      setSelectedNewsletter(null);
      queryClient.invalidateQueries({ queryKey: [`/api/admin/nurseries/${nurseryId}/newsletters`] });
      if (isSuperAdmin) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/newsletters'] });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update newsletter: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation for deleting a newsletter
  const deleteNewsletterMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/newsletters/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Newsletter Deleted',
        description: 'The newsletter has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/nurseries/${nurseryId}/newsletters`] });
      if (isSuperAdmin) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/newsletters'] });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete newsletter: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle form submission for adding a new newsletter
  const onSubmit = (data: NewsletterFormValues) => {
    addNewsletterMutation.mutate(data);
  };

  // Handle form submission for editing a newsletter
  const onEditSubmit = (data: NewsletterFormValues) => {
    if (selectedNewsletter) {
      updateNewsletterMutation.mutate({
        ...data,
        id: selectedNewsletter.id,
      });
    }
  };

  // Function to handle edit button click
  const handleEditNewsletter = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
    setIsEditNewsletterOpen(true);
  };

  // Function to handle delete button click
  const handleDeleteNewsletter = (id: number) => {
    deleteNewsletterMutation.mutate(id);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Newsletter Management">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Newsletters</CardTitle>
              <CardDescription>
                Manage newsletters for {isSuperAdmin ? 'all nurseries' : 'your nursery'}
              </CardDescription>
            </div>
            <Dialog open={isAddNewsletterOpen} onOpenChange={setIsAddNewsletterOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Newsletter
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Add Newsletter</DialogTitle>
                  <DialogDescription>
                    Add a new newsletter to share with parents.
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
                            <Input placeholder="Newsletter title" {...field} />
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
                              placeholder="Brief description of the newsletter content"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fileUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>File URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/newsletter.pdf" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="publishDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Publish Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${
                                    !field.value ? "text-muted-foreground" : ""
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
                              <CalendarComponent
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
                    
                    <DialogFooter>
                      <Button type="submit" disabled={addNewsletterMutation.isPending}>
                        {addNewsletterMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          'Add Newsletter'
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
            ) : newsletters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No newsletters found. Click "Add Newsletter" to create one.
              </div>
            ) : (
              <div className="space-y-4">
                {newsletters.map((newsletter: Newsletter) => (
                  <Card key={newsletter.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{newsletter.title}</CardTitle>
                          {isSuperAdmin && (
                            <CardDescription>
                              {getNurseryName(newsletter.nurseryId)} Nursery
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditNewsletter(newsletter)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Newsletter</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this newsletter? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteNewsletter(newsletter.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <p className="text-muted-foreground mb-2 md:mb-0">{newsletter.description}</p>
                        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-2 h-4 w-4" />
                            {format(new Date(newsletter.publishDate), 'PPP')}
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <a href={newsletter.fileUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="mr-2 h-4 w-4" />
                              View PDF
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Newsletter Dialog */}
        <Dialog open={isEditNewsletterOpen} onOpenChange={setIsEditNewsletterOpen}>
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
                        <Textarea
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="publishDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Publish Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value ? "text-muted-foreground" : ""
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
                          <CalendarComponent
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
                
                <DialogFooter>
                  <Button type="submit" disabled={updateNewsletterMutation.isPending}>
                    {updateNewsletterMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Newsletter'
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