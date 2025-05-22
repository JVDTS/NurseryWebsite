import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { UserPlus, Shield, Trash2, PencilLine, MoreHorizontal, Eye, EyeOff, Search, RefreshCcw } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

export default function StaffPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  // User management states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});
  
  // Forms
  const createForm = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "editor",
    }
  });

  const editForm = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema)
  });
  
  // Fetch users
  const usersQuery = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Fetch nurseries for dropdown
  const nurseriesQuery = useQuery({
    queryKey: ['/api/nurseries'],
  });
  
  // Fetch activity logs
  const logsQuery = useQuery({
    queryKey: ['/api/activity'],
  });

  // Filter users by search query
  const filteredUsers = usersQuery.data?.filter((user: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(query) || user.email.toLowerCase().includes(query);
  }) || [];

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createUserSchema>) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsCreateOpen(false);
      createForm.reset();
      toast({
        title: "User created successfully",
        description: "The new user has been added to the system.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create user",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updateUserSchema>) => {
      const response = await fetch(`/api/users/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsEditOpen(false);
      editForm.reset();
      toast({
        title: "User updated successfully",
        description: "The user details have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update user",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "User deleted successfully",
        description: "The user has been removed from the system.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle password visibility
  const togglePasswordVisibility = (userId: number) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };
  
  // Handle create user form submission
  const onCreateSubmit = (data: z.infer<typeof createUserSchema>) => {
    createUserMutation.mutate(data);
  };
  
  // Handle edit user form submission
  const onEditSubmit = (data: z.infer<typeof updateUserSchema>) => {
    updateUserMutation.mutate(data);
  };
  
  // Handle user edit button click
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    editForm.reset({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      nurseryId: user.nurseryId,
    });
    setIsEditOpen(true);
  };
  
  // Handle user delete button click
  const handleDeleteUser = (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Get nursery name by ID
  const getNurseryName = (id: number) => {
    const nursery = nurseriesQuery.data?.find((n: any) => n.id === id);
    return nursery ? nursery.name : "Unknown";
  };

  // Loading state
  if (usersQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system. Fill in all required fields.
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
                        <Input placeholder="user@example.com" type="email" {...field} />
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
                        <Input placeholder="Password" type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Must be at least 8 characters long
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
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isSuperAdmin && (
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          )}
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Assigns permissions for this user
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="nurseryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nursery</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select nursery" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {nurseriesQuery.data?.map((nursery: any) => (
                            <SelectItem key={nursery.id} value={nursery.id.toString()}>
                              {nursery.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The nursery this user will manage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    Create User
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  Manage staff accounts and access permissions
                </CardDescription>
              </div>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Nursery</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((userData: any) => (
                    <TableRow key={userData.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage alt={`${userData.firstName} ${userData.lastName}`} src={userData.profileImageUrl || ""} />
                            <AvatarFallback>{userData.firstName?.[0]}{userData.lastName?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{userData.firstName} {userData.lastName}</div>
                            <div className="text-sm text-muted-foreground">{userData.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${userData.role === 'super_admin' ? 'bg-red-100 text-red-800' : userData.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {userData.role === 'super_admin' ? 'Super Admin' : userData.role === 'admin' ? 'Admin' : 'Editor'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {userData.nurseryId ? getNurseryName(userData.nurseryId) : 'All Nurseries'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="font-mono text-sm mr-2">
                            {showPasswords[userData.id] ? userData.password : '••••••••'}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePasswordVisibility(userData.id)}
                          >
                            {showPasswords[userData.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
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
                            <DropdownMenuItem onClick={() => handleEditUser(userData)}>
                              <PencilLine className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(userData.id)}
                              className="text-red-600 focus:text-red-600"
                            >
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
                    <TableCell colSpan={5} className="h-24 text-center">
                      {searchQuery ? "No users matching your search" : "No users found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity Log</CardTitle>
            <CardDescription>
              Recent user actions and system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {logsQuery.data && logsQuery.data.length > 0 ? (
                  logsQuery.data.map((log: any) => (
                    <div key={log.id} className="flex gap-4 items-start border-b pb-4">
                      <div className={`${log.action.includes('delete') ? 'bg-red-100' : 'bg-primary/10'} p-2 rounded-full`}>
                        {log.action.includes('create') ? (
                          <UserPlus className="h-4 w-4 text-primary" />
                        ) : log.action.includes('update') ? (
                          <PencilLine className="h-4 w-4 text-primary" />
                        ) : log.action.includes('delete') ? (
                          <Trash2 className="h-4 w-4 text-red-600" />
                        ) : (
                          <Shield className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.details}
                        </p>
                        <p className="text-xs text-muted-foreground">By: {log.username}, {new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-24">
                    <p className="text-muted-foreground">No activity logs found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions
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
                        <Input {...field} />
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
                        <Input {...field} />
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
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                      Enter a new password or leave blank to keep the current one
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                        {isSuperAdmin && (
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        )}
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="nurseryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nursery</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select nursery" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {nurseriesQuery.data?.map((nursery: any) => (
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
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)} type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}