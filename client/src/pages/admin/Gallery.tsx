import { useState } from 'react';
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
import { Eye, Image as ImageIcon, Plus, Trash2, Loader2, X } from 'lucide-react';

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

// Types for gallery images
interface GalleryImage {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  nurseryId: number;
}

// Define the validation schema for gallery image form
const galleryImageSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters' }),
  imageUrl: z.string().url({ message: 'Please enter a valid URL for the image' }),
});

type GalleryImageFormValues = z.infer<typeof galleryImageSchema>;

export default function AdminGallery() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddImageOpen, setIsAddImageOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Get nurseryId for fetching images
  const nurseryId = user?.nurseryId || 0;
  const isSuperAdmin = user?.role === 'super_admin';

  // Create form for adding new gallery images
  const form = useForm<GalleryImageFormValues>({
    resolver: zodResolver(galleryImageSchema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
    },
  });

  // Fetch gallery images based on user role
  const { data: galleryImages = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: isSuperAdmin ? ['/api/admin/gallery'] : [`/api/admin/nurseries/${nurseryId}/gallery`],
    enabled: !!user,
  });

  // Mutation for adding a new gallery image
  const addImageMutation = useMutation({
    mutationFn: async (data: GalleryImageFormValues) => {
      return apiRequest('POST', `/api/admin/nurseries/${nurseryId}/gallery`, {
        ...data,
        nurseryId: nurseryId,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Image Added',
        description: 'The image has been added to the gallery successfully.',
      });
      setIsAddImageOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/admin/nurseries/${nurseryId}/gallery`] });
      if (isSuperAdmin) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/gallery'] });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to add image: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation for deleting a gallery image
  const deleteImageMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/gallery/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Image Deleted',
        description: 'The image has been removed from the gallery.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/nurseries/${nurseryId}/gallery`] });
      if (isSuperAdmin) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/gallery'] });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete image: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle form submission for adding a new gallery image
  const onSubmit = (data: GalleryImageFormValues) => {
    addImageMutation.mutate(data);
  };

  // Function to handle delete button click
  const handleDeleteImage = (id: number) => {
    deleteImageMutation.mutate(id);
  };

  // Function to handle image preview
  const handleImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Gallery Management">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Gallery Images</CardTitle>
              <CardDescription>
                Manage gallery images for {isSuperAdmin ? 'all nurseries' : 'your nursery'}
              </CardDescription>
            </div>
            <Dialog open={isAddImageOpen} onOpenChange={setIsAddImageOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Image
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Add Gallery Image</DialogTitle>
                  <DialogDescription>
                    Add a new image to the gallery.
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
                            <Input placeholder="Image title" {...field} />
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
                              placeholder="Brief description of the image"
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
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/image.jpg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" disabled={addImageMutation.isPending}>
                        {addImageMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          'Add to Gallery'
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
            ) : galleryImages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No images found. Click "Add Image" to upload to the gallery.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryImages.map((image: GalleryImage) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="relative aspect-video bg-muted">
                      <img
                        src={image.imageUrl}
                        alt={image.title}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Not+Found';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => handleImagePreview(image.imageUrl)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Image</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this image? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteImage(image.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm truncate">{image.title}</CardTitle>
                      {isSuperAdmin && (
                        <CardDescription className="text-xs">
                          {getNurseryName(image.nurseryId)} Nursery
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {image.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image Preview Dialog */}
        {previewImage && (
          <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
            <DialogContent className="sm:max-w-[800px] p-1">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/20 hover:bg-black/40"
                  onClick={() => setPreviewImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
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