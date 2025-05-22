import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { UserPlus, Users, Shield, Trash2, PencilLine, MoreHorizontal, Eye, EyeOff } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdmin } from "@/hooks/useAdmin";

// Role badge colors
const roleBadgeColors = {
  super_admin: "bg-red-100 text-red-800 border-red-300",
  admin: "bg-blue-100 text-blue-800 border-blue-300",
  editor: "bg-green-100 text-green-800 border-green-300"
};

// Create user schema
const createUserSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  role: z.enum(["super_admin", "admin", "editor"]),
  nurseryId: z.number().int().positive("Nursery must be selected").optional()
});

// Update user schema
const updateUserSchema = createUserSchema.partial().extend({
  id: z.number().positive(),
});

export default function UserManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});
  const { toast } = useToast();
  const { isAdmin, isSuperAdmin, currentUser } = useAdmin();
  
  // Queries
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
    enabled: isAdmin || isSuperAdmin,
  });
  
  const { data: nurseries = [], isLoading: isLoadingNurseries } = useQuery({
    queryKey: ["/api/nurseries"],
    enabled: isAdmin || isSuperAdmin,
  });
  
  // Create user form
  const createForm = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "editor",
    },
  });
  
  // Edit user form
  const editForm = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "editor",
    },
  });
  
  // Reset forms when dialogs close
  useEffect(() => {
    if (!isCreateOpen) {
      createForm.reset();
    }
    if (!isEditOpen) {
      editForm.reset();
    }
  }, [isCreateOpen, isEditOpen, createForm, editForm]);
  
  // Set edit form values when a user is selected
  useEffect(() => {
    if (selectedUser) {
      editForm.reset({
        id: selectedUser.id,
        email: selectedUser.email,
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        role: selectedUser.role,
        nurseryId: selectedUser.nurseryId || undefined,
      });
    }
  }, [selectedUser, editForm]);
  
  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof createUserSchema>) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "User created",
        description: "The user has been created successfully.",
      });
      setIsCreateOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof updateUserSchema>) => {
      const { id, ...data } = userData;
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "User updated",
        description: "The user has been updated successfully.",
      });
      setIsEditOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle create user form submission
  const onCreateSubmit = (values: z.infer<typeof createUserSchema>) => {
    createUserMutation.mutate(values);
  };
  
  // Handle edit user form submission
  const onEditSubmit = (values: z.infer<typeof updateUserSchema>) => {
    updateUserMutation.mutate(values);
  };
  
  // Handle delete user
  const handleDeleteUser = (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = (userId: number) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };
  
  // Check if the user can edit other users
  const canEditUser = (user: any) => {
    if (!currentUser) return false;
    
    // Super admins can edit anyone except other super admins
    if (isSuperAdmin) {
      return currentUser.id !== user.id;
    }
    
    // Admins can only edit editors in their nursery
    if (isAdmin) {
      return user.role === 'editor' && user.nurseryId === currentUser.nurseryId;
    }
    
    return false;
  };
  
  // Check if the user can delete other users
  const canDeleteUser = (user: any) => {
    if (!currentUser) return false;
    
    // Super admins can delete anyone except themselves
    if (isSuperAdmin) {
      return currentUser.id !== user.id;
    }
    
    // Admins can only delete editors in their nursery
    if (isAdmin) {
      return user.role === 'editor' && user.nurseryId === currentUser.nurseryId;
    }
    
    return false;
  };
  
  // Get nursery name by ID
  const getNurseryName = (nurseryId: number) => {
    const nursery = nurseries.find(n => n.id === nurseryId);
    return nursery ? nursery.name : 'Not assigned';
  };
  
  return (
    <AdminLayout
      title="User Management"
      description="Manage users and their roles in the CMS"
      icon={<Users className="h-6 w-6" />}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">User Management</h2>
          
          {/* Only super admins and admins can create users */}
          {(isSuperAdmin || isAdmin) && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Add User</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user to the system with specific roles and permissions.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={createForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={createForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormDescription>
                            Password must be at least 8 characters long.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {/* Only super admins can create super admins and admins */}
                              {isSuperAdmin && (
                                <>
                                  <SelectItem value="super_admin">Super Admin</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </>
                              )}
                              <SelectItem value="editor">Editor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Defines what actions the user can perform in the system.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Only show nursery selection if role is admin or editor */}
                    {(createForm.watch("role") === "admin" || createForm.watch("role") === "editor") && (
                      <FormField
                        control={createForm.control}
                        name="nurseryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assigned Nursery</FormLabel>
                            <Select 
                              onValueChange={val => field.onChange(parseInt(val))} 
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a nursery" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {nurseries.map(nursery => (
                                  <SelectItem key={nursery.id} value={nursery.id.toString()}>
                                    {nursery.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {createForm.watch("role") === "admin" 
                                ? "Admin will have management rights for this nursery" 
                                : "Editor will be able to create content for this nursery"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <DialogFooter>
                      <Button type="submit" disabled={createUserMutation.isPending}>
                        {createUserMutation.isPending ? "Creating..." : "Create User"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <Tabs defaultValue="all-users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all-users">All Users</TabsTrigger>
            <TabsTrigger value="super-admins">Super Admins</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
            <TabsTrigger value="editors">Editors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Complete list of all users in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {isLoadingUsers ? (
                      <p>Loading users...</p>
                    ) : users.length === 0 ? (
                      <p>No users found.</p>
                    ) : (
                      users.map((user: any) => (
                        <div 
                          key={user.id} 
                          className="flex items-center justify-between p-3 rounded-md border border-primary/10 hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.profileImageUrl} />
                              <AvatarFallback>
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={roleBadgeColors[user.role as keyof typeof roleBadgeColors]}>
                                  {user.role === 'super_admin' ? 'Super Admin' : 
                                   user.role === 'admin' ? 'Admin' : 'Editor'}
                                </Badge>
                                {user.nurseryId && (
                                  <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                                    {getNurseryName(user.nurseryId)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Only super admins can see passwords */}
                          {isSuperAdmin && (
                            <div className="flex items-center mr-4">
                              <div className="relative">
                                <Input 
                                  type={showPasswords[user.id] ? "text" : "password"} 
                                  value={user.password} 
                                  readOnly
                                  className="w-32 pr-8"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full"
                                  onClick={() => togglePasswordVisibility(user.id)}
                                >
                                  {showPasswords[user.id] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              {canEditUser(user) && (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsEditOpen(true);
                                  }}
                                >
                                  <PencilLine className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              
                              {canDeleteUser(user) && (
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="super-admins">
            <Card>
              <CardHeader>
                <CardTitle>Super Admins</CardTitle>
                <CardDescription>
                  Users with complete system access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {isLoadingUsers ? (
                      <p>Loading users...</p>
                    ) : (
                      users
                        .filter((user: any) => user.role === 'super_admin')
                        .map((user: any) => (
                          <div 
                            key={user.id} 
                            className="flex items-center justify-between p-3 rounded-md border border-primary/10 hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.profileImageUrl} />
                                <AvatarFallback>
                                  {user.firstName?.[0]}{user.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.firstName} {user.lastName}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                            
                            {/* Only super admins can see passwords */}
                            {isSuperAdmin && (
                              <div className="flex items-center mr-4">
                                <div className="relative">
                                  <Input 
                                    type={showPasswords[user.id] ? "text" : "password"} 
                                    value={user.password} 
                                    readOnly
                                    className="w-32 pr-8"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full"
                                    onClick={() => togglePasswordVisibility(user.id)}
                                  >
                                    {showPasswords[user.id] ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                {canEditUser(user) && (
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsEditOpen(true);
                                    }}
                                  >
                                    <PencilLine className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                                
                                {canDeleteUser(user) && (
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="admins">
            <Card>
              <CardHeader>
                <CardTitle>Admins</CardTitle>
                <CardDescription>
                  Users with nursery-specific management access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {isLoadingUsers ? (
                      <p>Loading users...</p>
                    ) : (
                      users
                        .filter((user: any) => user.role === 'admin')
                        .map((user: any) => (
                          <div 
                            key={user.id} 
                            className="flex items-center justify-between p-3 rounded-md border border-primary/10 hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.profileImageUrl} />
                                <AvatarFallback>
                                  {user.firstName?.[0]}{user.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.firstName} {user.lastName}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                {user.nurseryId && (
                                  <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 mt-1">
                                    {getNurseryName(user.nurseryId)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* Only super admins can see passwords */}
                            {isSuperAdmin && (
                              <div className="flex items-center mr-4">
                                <div className="relative">
                                  <Input 
                                    type={showPasswords[user.id] ? "text" : "password"} 
                                    value={user.password} 
                                    readOnly
                                    className="w-32 pr-8"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full"
                                    onClick={() => togglePasswordVisibility(user.id)}
                                  >
                                    {showPasswords[user.id] ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                {canEditUser(user) && (
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsEditOpen(true);
                                    }}
                                  >
                                    <PencilLine className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                                
                                {canDeleteUser(user) && (
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="editors">
            <Card>
              <CardHeader>
                <CardTitle>Editors</CardTitle>
                <CardDescription>
                  Users with content creation access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {isLoadingUsers ? (
                      <p>Loading users...</p>
                    ) : (
                      users
                        .filter((user: any) => user.role === 'editor')
                        .map((user: any) => (
                          <div 
                            key={user.id} 
                            className="flex items-center justify-between p-3 rounded-md border border-primary/10 hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.profileImageUrl} />
                                <AvatarFallback>
                                  {user.firstName?.[0]}{user.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.firstName} {user.lastName}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                {user.nurseryId && (
                                  <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 mt-1">
                                    {getNurseryName(user.nurseryId)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* Only super admins can see passwords */}
                            {isSuperAdmin && (
                              <div className="flex items-center mr-4">
                                <div className="relative">
                                  <Input 
                                    type={showPasswords[user.id] ? "text" : "password"} 
                                    value={user.password} 
                                    readOnly
                                    className="w-32 pr-8"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full"
                                    onClick={() => togglePasswordVisibility(user.id)}
                                  >
                                    {showPasswords[user.id] ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                {canEditUser(user) && (
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsEditOpen(true);
                                    }}
                                  >
                                    <PencilLine className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                                
                                {canDeleteUser(user) && (
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Edit User Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user details and permissions.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Only super admins can change passwords */}
                {isSuperAdmin && (
                  <FormField
                    control={editForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Leave blank to keep current password" 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Leave blank to keep the current password.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {/* Only super admins can change roles */}
                {isSuperAdmin && (
                  <FormField
                    control={editForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Defines what actions the user can perform in the system.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {/* Only show nursery selection if role is admin or editor */}
                {(editForm.watch("role") === "admin" || editForm.watch("role") === "editor") && (
                  <FormField
                    control={editForm.control}
                    name="nurseryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Nursery</FormLabel>
                        <Select 
                          onValueChange={val => field.onChange(parseInt(val))} 
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a nursery" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {nurseries.map((nursery: any) => (
                              <SelectItem key={nursery.id} value={nursery.id.toString()}>
                                {nursery.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {editForm.watch("role") === "admin" 
                            ? "Admin will have management rights for this nursery" 
                            : "Editor will be able to create content for this nursery"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <DialogFooter>
                  <Button type="submit" disabled={updateUserMutation.isPending}>
                    {updateUserMutation.isPending ? "Updating..." : "Update User"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}