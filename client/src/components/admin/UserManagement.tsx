import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { PlusCircle, Pencil, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  nurseryId: number | null;
  createdAt: string;
  updatedAt: string;
}

interface Nursery {
  id: number;
  name: string;
  location: string;
}

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.enum(["super_admin", "nursery_admin", "staff", "regular"], {
    required_error: "Please select a role.",
  }),
  nurseryId: z.union([z.number().positive(), z.literal(0)]).nullable(),
});

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [nurseries, setNurseries] = useState<Nursery[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  // Form for creating a new user
  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "staff",
      nurseryId: null,
    },
  });

  // Form for editing an existing user
  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema.partial({ password: true })),
    defaultValues: {
      username: "",
      password: "", // Optional for editing
      firstName: "",
      lastName: "",
      email: "",
      role: "staff",
      nurseryId: null,
    },
  });

  // Fetch all users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/users');
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        toast({
          title: 'Error',
          description: 'Failed to load users',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    const fetchNurseries = async () => {
      try {
        const response = await fetch('/api/nurseries');
        
        if (!response.ok) {
          throw new Error('Failed to fetch nurseries');
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.nurseries)) {
          setNurseries(data.nurseries);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching nurseries:', err);
        toast({
          title: 'Error',
          description: 'Failed to load nurseries',
          variant: 'destructive'
        });
      }
    };
    
    fetchUsers();
    fetchNurseries();
  }, [toast]);

  // Function to create a new user
  const handleCreateUser = async (values: z.infer<typeof formSchema>) => {
    try {
      setCreating(true);
      
      // For role-based nursery assignment
      if (values.role !== 'nursery_admin' && values.role !== 'staff') {
        values.nurseryId = null;
      }
      
      // Get CSRF token
      const csrfResponse = await fetch('/api/csrf-token');
      const { csrfToken } = await csrfResponse.json();
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(values)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(prevUsers => [...prevUsers, data.user]);
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
        setIsCreateModalOpen(false);
        createForm.reset();
      } else {
        throw new Error(data.message || 'Failed to create user');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create user',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  // Function to update an existing user
  const handleUpdateUser = async (values: z.infer<typeof formSchema>) => {
    if (!selectedUser) return;
    
    try {
      setUpdating(true);
      
      // For role-based nursery assignment
      if (values.role !== 'nursery_admin' && values.role !== 'staff') {
        values.nurseryId = null;
      }
      
      // Remove empty password if not changed
      if (!values.password) {
        const { password, ...dataWithoutPassword } = values;
        values = dataWithoutPassword as any;
      }
      
      // Get CSRF token
      const csrfResponse = await fetch('/api/csrf-token');
      const { csrfToken } = await csrfResponse.json();
      
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(values)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === selectedUser.id ? data.user : user
          )
        );
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
        setIsEditModalOpen(false);
        setSelectedUser(null);
      } else {
        throw new Error(data.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update user',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  // Function to open edit modal and populate form with selected user's data
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      username: user.username,
      password: "", // Don't show current password
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role as any,
      nurseryId: user.nurseryId,
    });
    setIsEditModalOpen(true);
  };

  // Helper function to get nursery name from id
  const getNurseryName = (nurseryId: number | null) => {
    if (!nurseryId) return "None";
    const nursery = nurseries.find(n => n.id === nurseryId);
    return nursery ? nursery.name : "Unknown";
  };

  // Helper function to get role badge color
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'nursery_admin':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-center items-center mb-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        
        {/* Create User Dialog */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle size={16} />
              <span>Create User</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user account and set their role and permissions.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateUser)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} />
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
                        <Input type="password" placeholder="Enter password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
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
                          <Input placeholder="Last name" {...field} />
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
                        <Input type="email" placeholder="Enter email" {...field} />
                      </FormControl>
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
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                          <SelectItem value="nursery_admin">Nursery Admin</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="regular">Regular User</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Sets the user's permissions level
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Only show nursery selection for nursery_admin and staff roles */}
                {(createForm.watch('role') === 'nursery_admin' || createForm.watch('role') === 'staff') && (
                  <FormField
                    control={createForm.control}
                    name="nurseryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Nursery</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value === "null" ? null : Number(value))}
                          value={field.value === null ? "null" : field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a nursery" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="null">None</SelectItem>
                            {nurseries.map(nursery => (
                              <SelectItem key={nursery.id} value={nursery.id.toString()}>
                                {nursery.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The nursery this user will be assigned to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <DialogFooter>
                  <Button type="submit" disabled={creating}>
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {creating ? 'Creating...' : 'Create User'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Edit User Dialog */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleUpdateUser)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} />
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
                        />
                      </FormControl>
                      <FormDescription>
                        Leave blank to keep the current password
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
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
                          <Input placeholder="Last name" {...field} />
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
                        <Input type="email" placeholder="Enter email" {...field} />
                      </FormControl>
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                          <SelectItem value="nursery_admin">Nursery Admin</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="regular">Regular User</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Sets the user's permissions level
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Only show nursery selection for nursery_admin and staff roles */}
                {(editForm.watch('role') === 'nursery_admin' || editForm.watch('role') === 'staff') && (
                  <FormField
                    control={editForm.control}
                    name="nurseryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Nursery</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value === "null" ? null : Number(value))}
                          value={field.value === null ? "null" : field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a nursery" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="null">None</SelectItem>
                            {nurseries.map(nursery => (
                              <SelectItem key={nursery.id} value={nursery.id.toString()}>
                                {nursery.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The nursery this user will be assigned to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <DialogFooter>
                  <Button type="submit" disabled={updating}>
                    {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {updating ? 'Updating...' : 'Update User'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-lg text-gray-500 mb-4">No users found</p>
          <Button onClick={() => setIsCreateModalOpen(true)} variant="outline">Create Your First User</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto">
          {users.map(user => (
            <Card key={user.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{user.firstName} {user.lastName}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditUser(user)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil size={16} />
                  </Button>
                </CardTitle>
                <p className="text-sm font-medium text-muted-foreground">@{user.username}</p>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Email:</span> {user.email}
                  </div>
                  <div>
                    <span className="font-medium">Role:</span>{' '}
                    <Badge variant="outline" className={getRoleBadgeClass(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Nursery:</span> {getNurseryName(user.nurseryId)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}