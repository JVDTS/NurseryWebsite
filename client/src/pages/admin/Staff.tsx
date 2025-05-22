import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AdminLayout } from "@/components/admin/AdminLayout";
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
import { UserPlus, Shield, Trash2, PencilLine, MoreHorizontal, Eye, EyeOff, Search } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Form schema for adding/editing staff
const staffFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(["super_admin", "nursery_admin", "staff"], {
    required_error: "Please select a role.",
  }),
  nurseryId: z.number().optional(),
});

// Create user schema - matches format used in UserManagement.tsx
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

export default function StaffManagement() {
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
  
  // Filter staff based on search query
  const filteredStaff = staffData.filter((staffMember: any) => {
    const fullName = `${staffMember.firstName} ${staffMember.lastName}`.toLowerCase();
    const email = staffMember.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || email.includes(query);
  });
  
  // Handle form submission for adding staff
  function onSubmitStaffForm(data: z.infer<typeof staffFormSchema>) {
    // In a real app, this would call an API to create the user
    console.log("Staff form data:", data);
    
    toast({
      title: "Staff member added",
      description: `${data.firstName} ${data.lastName} has been added as ${data.role}.`,
    });
    
    staffForm.reset();
    setIsAddStaffOpen(false);
  }
  
  // Role display names for readability
  const roleDisplayNames = {
    super_admin: "Super Admin",
    nursery_admin: "Nursery Admin",
    staff: "Staff Member",
    regular: "Regular User",
  };
  
  // Get nursery name by ID
  function getNurseryNameById(id: number): string {
    const nursery = nurseries.find((n: any) => n.id === id);
    return nursery ? nursery.name : "Unknown Nursery";
  }
  
  // Loading state
  if (staffQuery.isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Staff Management">
          <div className="container mx-auto py-6">
            <div className="flex justify-center items-center h-64">
              <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Staff Management">
        <div className="container mx-auto py-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Staff Management</h1>
            
            {isSuperAdmin && (
              <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Staff Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Staff Member</DialogTitle>
                    <DialogDescription>
                      Create a new staff account. They'll receive an email with login instructions.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...staffForm}>
                    <form onSubmit={staffForm.handleSubmit(onSubmitStaffForm)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={staffForm.control}
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
                          control={staffForm.control}
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
                        control={staffForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Email address" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={staffForm.control}
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
                                {isSuperAdmin && (
                                  <SelectItem value="super_admin">Super Admin</SelectItem>
                                )}
                                <SelectItem value="nursery_admin">Nursery Admin</SelectItem>
                                <SelectItem value="staff">Staff Member</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              This determines their permissions within the system.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {isSuperAdmin && (
                        <FormField
                          control={staffForm.control}
                          name="nurseryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assigned Nursery</FormLabel>
                              <Select 
                                onValueChange={(value) => field.onChange(parseInt(value))} 
                                defaultValue={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a nursery" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {nurseries.map((nursery: any) => (
                                    <SelectItem 
                                      key={nursery.id} 
                                      value={nursery.id.toString()}
                                    >
                                      {nursery.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                The nursery this staff member will be associated with.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <DialogFooter className="mt-6">
                        <Button type="submit">Add Staff Member</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="grid gap-6">
            {/* Role Management Section - Only visible to super admins */}
            {isSuperAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Role Management</CardTitle>
                  <CardDescription>
                    Create and manage roles for staff members across nurseries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Available Roles</h3>
                      <div className="space-y-4 border rounded-lg p-4">
                        <div className="flex justify-between items-center p-2 bg-primary/5 rounded">
                          <div>
                            <p className="font-medium">Super Admin</p>
                            <p className="text-sm text-muted-foreground">Full access to all nurseries and settings</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-8">
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-2 bg-primary/5 rounded">
                          <div>
                            <p className="font-medium">Nursery Admin</p>
                            <p className="text-sm text-muted-foreground">Manage a specific nursery and its staff</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-8">
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-2 bg-primary/5 rounded">
                          <div>
                            <p className="font-medium">Staff Member</p>
                            <p className="text-sm text-muted-foreground">Basic access to add content</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-8">
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Create New Role</h3>
                      <div className="border rounded-lg p-4">
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="role-name">Role Name</Label>
                            <Input id="role-name" placeholder="Enter role name" />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="role-description">Description</Label>
                            <Input id="role-description" placeholder="Role description" />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label>Permissions</Label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <input type="checkbox" id="perm-content" className="h-4 w-4 rounded border-gray-300" />
                                <label htmlFor="perm-content" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Manage content
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input type="checkbox" id="perm-gallery" className="h-4 w-4 rounded border-gray-300" />
                                <label htmlFor="perm-gallery" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Add gallery images
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input type="checkbox" id="perm-events" className="h-4 w-4 rounded border-gray-300" />
                                <label htmlFor="perm-events" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Manage events
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input type="checkbox" id="perm-users" className="h-4 w-4 rounded border-gray-300" />
                                <label htmlFor="perm-users" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Manage users
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          <Button className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Role
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Staff Directory */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Directory</CardTitle>
                <CardDescription>
                  Manage staff accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search by name or email..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {isSuperAdmin && (
                    <div className="w-full md:w-1/3">
                      <Select 
                        onValueChange={(value) => setSelectedNurseryId(value === 'all' ? null : parseInt(value))}
                        defaultValue="all"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by nursery" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Nurseries</SelectItem>
                          {nurseries.map((nursery: any) => (
                            <SelectItem key={nursery.id} value={nursery.id.toString()}>
                              {nursery.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        {isSuperAdmin && <TableHead>Nursery</TableHead>}
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.length > 0 ? (
                        filteredStaff.map((staffMember: any) => (
                          <TableRow key={staffMember.id}>
                            <TableCell className="font-medium">
                              {staffMember.firstName} {staffMember.lastName}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <AtSign className="mr-1 h-3.5 w-3.5 text-gray-500" />
                                {staffMember.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Briefcase className="mr-1 h-3.5 w-3.5 text-gray-500" />
                                {roleDisplayNames[staffMember.role as keyof typeof roleDisplayNames]}
                              </div>
                            </TableCell>
                            {isSuperAdmin && (
                              <TableCell>
                                {staffMember.nurseryId && (
                                  <div className="flex items-center">
                                    <Building className="mr-1 h-3.5 w-3.5 text-gray-500" />
                                    {getNurseryNameById(staffMember.nurseryId)}
                                  </div>
                                )}
                              </TableCell>
                            )}
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="mr-1">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={isSuperAdmin ? 5 : 4} className="text-center py-6">
                            {searchQuery 
                              ? "No staff members matching your search criteria" 
                              : "No staff members found"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}