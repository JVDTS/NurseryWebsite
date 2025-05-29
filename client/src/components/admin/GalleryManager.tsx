import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Tag,
  FolderOpen,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Archive,
  Plus
} from "lucide-react";

interface GalleryImage {
  id: number;
  title: string;
  description?: string;
  filename: string;
  altText?: string;
  fileSize?: number;
  mimeType?: string;
  dimensions?: { width: number; height: number };
  nurseryId: number;
  categoryId?: number;
  tags?: string[];
  status: "draft" | "published" | "archived";
  featured: boolean;
  sortOrder: number;
  uploadedBy: number;
  approvedBy?: number;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: GalleryCategory;
  uploader?: { firstName: string; lastName: string };
}

interface GalleryCategory {
  id: number;
  name: string;
  description?: string;
  nurseryId?: number;
  color?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  nurseryId?: number;
}

interface Nursery {
  id: number;
  name: string;
  location: string;
}

const imageFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  altText: z.string().optional(),
  categoryId: z.number().optional(),
  tags: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  featured: z.boolean().default(false),
});

const categoryFormSchema = z.object({
  name: z.string().min(2, "Category name is required"),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color").optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
});

export function GalleryManager() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedNursery, setSelectedNursery] = useState<number | null>(null);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);

  // Fetch current user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/admin/me"],
  });

  // Fetch nurseries (filtered by user permissions)
  const { data: nurseries = [] } = useQuery<Nursery[]>({
    queryKey: ["/api/nurseries"],
  });

  // Fetch gallery categories
  const { data: categories = [] } = useQuery<GalleryCategory[]>({
    queryKey: ["/api/gallery/categories", selectedNursery],
    queryFn: () => 
      apiRequest(`/api/gallery/categories${selectedNursery ? `?nurseryId=${selectedNursery}` : ""}`),
  });

  // Fetch gallery images
  const { data: images = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery", selectedNursery, statusFilter, categoryFilter, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedNursery) params.append("nurseryId", selectedNursery.toString());
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (categoryFilter !== "all") params.append("categoryId", categoryFilter);
      if (searchTerm) params.append("search", searchTerm);
      return apiRequest(`/api/gallery?${params.toString()}`);
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setUploadDialogOpen(false);
      toast({ title: "Images uploaded successfully" });
    },
    onError: () => {
      toast({ title: "Upload failed", variant: "destructive" });
    },
  });

  // Update image mutation
  const updateImageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/gallery/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setEditingImage(null);
      toast({ title: "Image updated successfully" });
    },
  });

  // Delete images mutation
  const deleteImagesMutation = useMutation({
    mutationFn: async (imageIds: number[]) => {
      await Promise.all(
        imageIds.map(id => apiRequest(`/api/gallery/${id}`, { method: "DELETE" }))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setSelectedImages([]);
      toast({ title: "Images deleted successfully" });
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/gallery/categories", {
        method: "POST",
        body: JSON.stringify({ ...data, nurseryId: selectedNursery }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery/categories"] });
      setCategoryDialogOpen(false);
      toast({ title: "Category created successfully" });
    },
  });

  const imageForm = useForm({
    resolver: zodResolver(imageFormSchema),
    defaultValues: editingImage || {
      title: "",
      description: "",
      altText: "",
      status: "published" as const,
      featured: false,
    },
  });

  const categoryForm = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
      icon: "",
      isActive: true,
    },
  });

  // Set default nursery based on user role
  useEffect(() => {
    if (user && !selectedNursery) {
      if (user.role === "super_admin") {
        // Super admin can see all nurseries
        setSelectedNursery(nurseries[0]?.id || null);
      } else if (user.nurseryId) {
        // Regular users see their assigned nursery
        setSelectedNursery(user.nurseryId);
      }
    }
  }, [user, nurseries, selectedNursery]);

  // Update form when editing image changes
  useEffect(() => {
    if (editingImage) {
      imageForm.reset({
        title: editingImage.title,
        description: editingImage.description || "",
        altText: editingImage.altText || "",
        categoryId: editingImage.categoryId,
        tags: editingImage.tags?.join(", ") || "",
        status: editingImage.status,
        featured: editingImage.featured,
      });
    }
  }, [editingImage, imageForm]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedNursery) return;

    const formData = new FormData();
    formData.append("nurseryId", selectedNursery.toString());
    
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    uploadMutation.mutate(formData);
  };

  const handleImageUpdate = (data: any) => {
    if (!editingImage) return;
    
    const updateData = {
      ...data,
      tags: data.tags ? data.tags.split(",").map((tag: string) => tag.trim()) : [],
    };
    
    updateImageMutation.mutate({ id: editingImage.id, data: updateData });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "draft": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "archived": return <Archive className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      case "archived": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const canManageNursery = (nurseryId: number) => {
    return user?.role === "super_admin" || user?.nurseryId === nurseryId;
  };

  const filteredImages = images.filter(image => {
    if (searchTerm && !image.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery Manager</h1>
          <p className="mt-2 text-gray-600">
            Manage images with Strapi-like functionality and role-based permissions
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-2">
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderOpen className="h-4 w-4 mr-2" />
                Manage Categories
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <Form {...categoryForm}>
                <form onSubmit={categoryForm.handleSubmit((data) => createCategoryMutation.mutate(data))}>
                  <div className="space-y-4">
                    <FormField
                      control={categoryForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter category name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={categoryForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Enter description (optional)" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={categoryForm.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <Input {...field} type="color" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={createCategoryMutation.isPending}>
                      Create Category
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Images</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Images</label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadMutation.isPending || !selectedNursery}
                  />
                </div>
                {!selectedNursery && (
                  <p className="text-sm text-red-600">Please select a nursery first</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Nursery Selection */}
          {user?.role === "super_admin" && (
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Nursery</label>
              <Select value={selectedNursery?.toString() || ""} onValueChange={(value) => setSelectedNursery(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select nursery" />
                </SelectTrigger>
                <SelectContent>
                  {nurseries.map((nursery) => (
                    <SelectItem key={nursery.id} value={nursery.id.toString()}>
                      {nursery.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Mode */}
          <div className="flex items-end">
            <div className="flex rounded-md border">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedImages.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedImages.length} images selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteImagesMutation.mutate(selectedImages)}
                  disabled={deleteImagesMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedImages([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Images Grid/List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading images...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
              ? "Try adjusting your filters"
              : "Upload some images to get started"}
          </p>
          {selectedNursery && (
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {filteredImages.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              {viewMode === "grid" ? (
                <div>
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={`/uploads/${image.filename}`}
                      alt={image.altText || image.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      {image.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <Badge className={getStatusColor(image.status)}>
                        {getStatusIcon(image.status)}
                        <span className="ml-1 capitalize">{image.status}</span>
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <input
                        type="checkbox"
                        checked={selectedImages.includes(image.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedImages([...selectedImages, image.id]);
                          } else {
                            setSelectedImages(selectedImages.filter(id => id !== image.id));
                          }
                        }}
                        className="rounded"
                      />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1 truncate">{image.title}</h3>
                    {image.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{image.description}</p>
                    )}
                    {image.tags && image.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {image.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {image.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{image.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {image.category?.name || "Uncategorized"}
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditingImage(image)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => deleteImagesMutation.mutate([image.id])}
                          disabled={!canManageNursery(image.nurseryId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              ) : (
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 bg-gray-100 rounded">
                      <img
                        src={`/uploads/${image.filename}`}
                        alt={image.altText || image.title}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{image.title}</h3>
                        {image.featured && (
                          <Star className="h-4 w-4 text-yellow-500" />
                        )}
                        <Badge className={getStatusColor(image.status)}>
                          {image.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{image.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>{image.category?.name || "Uncategorized"}</span>
                        <span>{image.fileSize ? `${Math.round(image.fileSize / 1024)} KB` : ""}</span>
                        <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedImages.includes(image.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedImages([...selectedImages, image.id]);
                          } else {
                            setSelectedImages(selectedImages.filter(id => id !== image.id));
                          }
                        }}
                        className="rounded"
                      />
                      <Button size="sm" variant="ghost" onClick={() => setEditingImage(image)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => deleteImagesMutation.mutate([image.id])}
                        disabled={!canManageNursery(image.nurseryId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Edit Image Dialog */}
      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          {editingImage && (
            <Form {...imageForm}>
              <form onSubmit={imageForm.handleSubmit(handleImageUpdate)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <FormField
                      control={imageForm.control}
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
                      control={imageForm.control}
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
                    <FormField
                      control={imageForm.control}
                      name="altText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alt Text</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Accessibility description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={imageForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select value={field.value?.toString() || ""} onValueChange={(value) => field.onChange(Number(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No category</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={imageForm.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Comma-separated tags" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded">
                      <img
                        src={`/uploads/${editingImage.filename}`}
                        alt={editingImage.altText || editingImage.title}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <FormField
                      control={imageForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={imageForm.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Featured Image</FormLabel>
                            <div className="text-sm text-gray-600">
                              Mark this image as featured
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditingImage(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateImageMutation.isPending}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}