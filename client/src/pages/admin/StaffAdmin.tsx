import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import DashboardLayout from '@/components/admin/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Trash2, PencilLine, Search, Shield } from 'lucide-react';

// Create user schema
const userSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  role: z.string(),
  nurseryId: z.string().optional()
});

export default function StaffAdmin() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Create form
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "editor"
    }
  });
  
  // Sample data
  const staffUsers = [
    { id: 1, firstName: "John", lastName: "Doe", email: "admin@nurseries.com", role: "super_admin", nurseryId: null },
    { id: 2, firstName: "Jane", lastName: "Smith", email: "jane@example.com", role: "admin", nurseryId: 1 },
    { id: 3, firstName: "Mike", lastName: "Johnson", email: "mike@example.com", role: "editor", nurseryId: 2 }
  ];
  
  const nurseries = [
    { id: 1, name: "Hayes Nursery" },
    { id: 2, name: "Uxbridge Nursery" },
    { id: 3, name: "Hounslow Nursery" }
  ];
  
  const activities = [
    { id: 1, action: "User Created", details: "New user Jane Smith (jane@example.com) was created with role Admin", username: "John Doe", timestamp: new Date().toISOString() },
    { id: 2, action: "User Updated", details: "User permissions changed for Mike Johnson from Editor to Admin", username: "John Doe", timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, action: "User Removed", details: "User Alex Wilson (alex@example.com) was removed from the system", username: "John Doe", timestamp: new Date(Date.now() - 86400000).toISOString() }
  ];
  
  // Filter users based on search
  const filteredUsers = staffUsers.filter(user => {
    if (!searchQuery) return true;
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           user.email.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  // Get nursery name
  const getNurseryName = (id) => {
    if (!id) return "All Nurseries";
    const nursery = nurseries.find(n => n.id === id);
    return nursery ? nursery.name : "Unknown";
  };
  
  // Handle form submission
  const onSubmit = (data) => {
    console.log(data);
    setIsCreateDialogOpen(false);
    form.reset();
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Staff Management">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Staff Management</h1>
              <p className="text-muted-foreground">
                Manage user accounts, roles, and permissions
              </p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new staff account with appropriate permissions.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
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
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="user@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            This determines what actions the user can perform.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nurseryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nursery</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            The nursery this user will be assigned to.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit">Create User</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Users Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>
                    Manage staff accounts and access permissions
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Nursery</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {user.role === 'super_admin' ? 'Super Admin' : 
                             user.role === 'admin' ? 'Admin' : 'Editor'}
                          </Badge>
                        </TableCell>
                        <TableCell>{getNurseryName(user.nurseryId)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="mr-1">
                            <PencilLine className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {searchQuery ? 'No users matching your search' : 'No users found'}
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
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Recent user management activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {activities.map(activity => (
                    <div key={activity.id} className="flex gap-4 items-start border-b pb-4">
                      <div className={`${activity.action.includes('Removed') ? 'bg-red-100' : 'bg-primary/10'} p-2 rounded-full`}>
                        {activity.action.includes('Created') ? (
                          <UserPlus className="h-4 w-4 text-primary" />
                        ) : activity.action.includes('Updated') ? (
                          <PencilLine className="h-4 w-4 text-primary" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.details}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          By: {activity.username}, {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}