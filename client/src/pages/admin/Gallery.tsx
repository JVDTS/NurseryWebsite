import { useState, useRef } from 'react';
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
import { Eye, Image as ImageIcon, Plus, Trash2, Loader2, X, Upload } from 'lucide-react';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
  imageUrl: string;
  caption: string;
  nurseryId: number;
  uploadedBy: number;
  createdAt: string;
}

// Define the validation schema for gallery image form
const galleryImageSchema = z.object({
  imageUrl: z.string().min(1, { message: 'Please upload an image file or provide a URL' }),
  caption: z.string().min(5, { message: 'Caption must be at least 5 characters' }),
  nurseryId: z.number().optional(), // Will be set by the component for non-super admins
  uploadToAll: z.boolean().default(false), // Option to upload to all nurseries
});

type GalleryImageFormValues = z.infer<typeof galleryImageSchema>;

export default function AdminGallery() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddImageOpen, setIsAddImageOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get nurseryId for fetching images
  const nurseryId = user?.nurseryId || 0;
  const isSuperAdmin = user?.role === 'super_admin';

  // Fetch all nurseries for dropdown (super admin only)
  const { data: nurseriesData } = useQuery<{ nurseries: any[] }>({
    queryKey: ['/api/nurseries'],
    enabled: isSuperAdmin,
  });
  const nurseries = nurseriesData?.nurseries || [];

  // Create form for adding new gallery images
  const form = useForm<GalleryImageFormValues>({
    resolver: zodResolver(galleryImageSchema),
    defaultValues: {
      imageUrl: '',
      caption: '',
      // For super admin, default to Hayes (1) instead of 0
      // For other admins, use their assigned nursery
      nurseryId: isSuperAdmin ? 1 : nurseryId,
      uploadToAll: false,
    },
  });
  
  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      // Get a fresh CSRF token with cache busting
      const { fetchCsrfToken } = await import('@/lib/csrf');
      const csrfToken = await fetchCsrfToken();
      
      if (!csrfToken) {
        throw new Error('Could not get security token. Please refresh the page and try again.');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);
      
      const response = await fetch('/api/admin/upload/gallery', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken, // Add CSRF token
          'Cache-Control': 'no-cache',
        },
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Upload failed:', responseData);
        throw new Error(responseData.message || 'Failed to upload file');
      }
      
      console.log('Upload successful:', responseData);
      return responseData;
    },
    onSuccess: (data) => {
      // Update the form with the uploaded file URL
      form.setValue('imageUrl', data.fileUrl);
      toast({
        title: 'File Uploaded',
        description: 'The image has been uploaded successfully.',
      });
      setIsUploading(false);
    },
    onError: (error) => {
      toast({
        title: 'Upload Error',
        description: `Failed to upload image: ${error.message}`,
        variant: 'destructive',
      });
      setIsUploading(false);
    },
  });
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: 'Please select an image file (JPEG, PNG, etc.)',
          variant: 'destructive',
        });
        return;
      }
      
      setIsUploading(true);
      uploadFileMutation.mutate(file);
    }
  };

  // Fetch gallery images based on user role
  const galleryQueryKey = isSuperAdmin ? ['/api/admin/gallery'] : [`/api/admin/nurseries/${nurseryId}/gallery`];
  
  const { data, isLoading } = useQuery<{ images: GalleryImage[] }>({
    queryKey: galleryQueryKey,
    enabled: !!user && (isSuperAdmin ? true : nurseryId > 0),
  });
  
  const galleryImages = data?.images || [];

  // Mutation for adding a new gallery image
  const addImageMutation = useMutation({
    mutationFn: async (data: GalleryImageFormValues) => {
      // Check if uploading to all nurseries (super admin only)
      if (isSuperAdmin && data.uploadToAll) {
        console.log('Uploading image to all nurseries:', data);
        
        // Upload to all nurseries
        const uploadPromises = nurseries.map(nursery => 
          apiRequest('POST', `/api/admin/nurseries/${nursery.id}/gallery`, {
            ...data,
            nurseryId: nursery.id,
          })
        );
        
        return Promise.all(uploadPromises);
      } else {
        // Upload to single nursery
        const targetNurseryId = isSuperAdmin ? (data.nurseryId || 1) : nurseryId;
        
        console.log('Adding image to nursery:', targetNurseryId, data);
        
        return apiRequest('POST', `/api/admin/nurseries/${targetNurseryId}/gallery`, {
          ...data,
          nurseryId: targetNurseryId,
        });
      }
    },
    onSuccess: () => {
      toast({
        title: 'Image Added',
        description: 'The image has been added to the gallery successfully.',
      });
      setIsAddImageOpen(false);
      form.reset();
      // Use the same query key that was used for fetching
      queryClient.invalidateQueries({ queryKey: galleryQueryKey });
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
      // Use the same query key that was used for fetching
      queryClient.invalidateQueries({ queryKey: galleryQueryKey });
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
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upload Image</FormLabel>
                          <div className="space-y-4">
                            <div className="relative">
                              <input
                                type="file"
                                id="file-upload"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="default"
                                className="w-full"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Select Image File
                                  </>
                                )}
                              </Button>
                            </div>
                            
                            {field.value && (
                              <div className="flex items-center justify-between bg-muted/30 p-2 rounded border">
                                <div className="flex items-center">
                                  <ImageIcon className="h-4 w-4 mr-2 text-green-600" />
                                  <span className="text-sm truncate max-w-[200px]">{field.value.split('/').pop()}</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => form.setValue('imageUrl', '')}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            
                            <FormControl>
                              <Input 
                                placeholder="Or enter an image URL directly" 
                                {...field} 
                                className="text-xs text-muted-foreground"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="caption"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Caption</FormLabel>
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
                    
                    {isSuperAdmin && (
                      <FormField
                        control={form.control}
                        name="nurseryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nursery</FormLabel>
                            <FormControl>
                              <select 
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                                value={field.value || 1}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              >
                                <option value="1">Hayes</option>
                                <option value="2">Uxbridge</option>
                                <option value="3">Hounslow</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
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
                        alt="Gallery image"
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
                      <CardTitle className="text-sm truncate">
                        {new Date(image.createdAt).toLocaleDateString()}
                      </CardTitle>
                      {isSuperAdmin && (
                        <CardDescription className="text-xs">
                          {getNurseryName(image.nurseryId)} Nursery
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {image.caption}
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