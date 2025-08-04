import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import NewDashboardLayout from "@/components/admin/NewDashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, Trash, Check, X, RefreshCw, UserPlus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NewUser {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: "admin" | "super_admin";
  nurseryId: number | null; // Single nursery assignment instead of array
}

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Form data states
  const [newUser, setNewUser] = useState<NewUser>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "admin",
    nurseryId: null
  });

  const [editUser, setEditUser] = useState({
    id: 0,
    email: "",
    firstName: "",
    lastName: "",
    role: "",
    isActive: true
  });

  const [userNurseryAssignments, setUserNurseryAssignments] = useState<number[]>([]);

  // Fetch users and nurseries data
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: nurseries = [], isLoading: nurseriesLoading } = useQuery({
    queryKey: ["/api/nurseries"],
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: NewUser) => {
      // Client-side validation
      if (!userData.email || !userData.password || !userData.firstName) {
        throw new Error("Please fill out all required fields.");
      }

      // For admin/editor roles, nursery assignment is required
      if ((userData.role === "admin" || userData.role === "editor") && !userData.nurseryId) {
        throw new Error("Please select a nursery for admin/editor users.");
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      const text = await response.text();
      if (!response.ok) throw new Error(text);

      try {
        return JSON.parse(text);
      } catch {
        throw new Error("Server returned an invalid response.");
      }
    },
    onSuccess: () => {
      toast({
        title: "User created",
        description: "The user has been created successfully.",
      });
      setCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      resetNewUserForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return await apiRequest("PATCH", `/api/admin/users/${userData.id}`, userData);
    },
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "The user has been updated successfully.",
      });
      setEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Deactivate user mutation
  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest("POST", `/api/admin/users/${userId}/deactivate`);
    },
    onSuccess: () => {
      toast({
        title: "User deactivated",
        description: "The user has been deactivated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reactivate user mutation
  const reactivateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest("POST", `/api/admin/users/${userId}/reactivate`);
    },
    onSuccess: () => {
      toast({
        title: "User reactivated",
        description: "The user has been reactivated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reactivate user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Assign nurseries mutation
  const assignNurseryMutation = useMutation({
    mutationFn: async ({ userId, nurseryIds }: { userId: number; nurseryIds: number[] }) => {
      return await apiRequest("POST", `/api/admin/users/${userId}/nurseries`, { nurseryIds });
    },
    onSuccess: () => {
      toast({
        title: "Nurseries assigned",
        description: "The nurseries have been assigned to the user successfully.",
      });
      setAssignDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign nurseries. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "The user has been permanently deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reset form for creating a new user
  const resetNewUserForm = () => {
    setNewUser({
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      role: "admin",
      nurseryId: null
    });
  };

  // Handle selecting a user for editing
  const handleEditUser = (user: any) => {
    setEditUser({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive
    });
    setEditDialogOpen(true);
  };

  // Handle selecting a user for nursery assignment
  const handleAssignNurseries = async (user: any) => {
    setSelectedUserId(user.id);
    
    try {
      // Fetch current assignments for this user
      const response = await fetch(`/api/admin/users/${user.id}/nurseries`);
      if (!response.ok) throw new Error('Failed to fetch nursery assignments');
      
      const data = await response.json();
      setUserNurseryAssignments(data.map((n: any) => n.id));
      setAssignDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch nursery assignments. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle creating a new user
  const handleCreateUser = () => {
    // Basic validation
    if (!newUser.email || !newUser.firstName || !newUser.lastName || !newUser.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate(newUser);
  };

  // Handle updating a user
  const handleUpdateUser = () => {
    // Basic validation
    if (!editUser.email || !editUser.firstName || !editUser.lastName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    updateUserMutation.mutate(editUser);
  };

  // Handle nursery assignment submission
  const handleSubmitNurseryAssignment = () => {
    if (selectedUserId) {
      assignNurseryMutation.mutate({
        userId: selectedUserId,
        nurseryIds: userNurseryAssignments
      });
    }
  };

  // Filter users based on search query and active status
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (currentTab === "all") return matchesSearch;
    if (currentTab === "active") return matchesSearch && user.isActive;
    if (currentTab === "inactive") return matchesSearch && !user.isActive;
    return false;
  });

  // Handle selecting a single nursery for assignment (for existing users)
  const handleNurseryAssignmentSelection = (nurseryId: string) => {
    setUserNurseryAssignments([parseInt(nurseryId)]);
  };
  
  // Handle selecting a single nursery when creating a new user
  const handleNewUserNurserySelection = (nurseryId: string) => {
    setNewUser({
      ...newUser,
      nurseryId: parseInt(nurseryId)
    });
  };

  return (
    <ProtectedRoute>
      <NewDashboardLayout>
        <div className="flex flex-col gap-6">
          {/* Page header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <p className="text-gray-500">
              Manage users and their access to the system.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => refetchUsers()}
                title="Refresh"
                className="h-9 px-3 flex-shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              onClick={() => {
                resetNewUserForm();
                setCreateDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>

          {/* User Management Table */}
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="all" onValueChange={setCurrentTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <UsersTable 
                    users={filteredUsers} 
                    nurseries={nurseries}
                    onEdit={handleEditUser} 
                    onDeactivate={(id) => deactivateUserMutation.mutate(id)}
                    onReactivate={(id) => reactivateUserMutation.mutate(id)}
                    onAssignNurseries={handleAssignNurseries}
                    onDelete={(id) => deleteUserMutation.mutate(id)}
                  />
                </TabsContent>
                <TabsContent value="active">
                  <UsersTable 
                    users={filteredUsers} 
                    nurseries={nurseries}
                    onEdit={handleEditUser} 
                    onDeactivate={(id) => deactivateUserMutation.mutate(id)}
                    onReactivate={(id) => reactivateUserMutation.mutate(id)}
                    onAssignNurseries={handleAssignNurseries}
                    onDelete={(id) => deleteUserMutation.mutate(id)}
                  />
                </TabsContent>
                <TabsContent value="inactive">
                  <UsersTable 
                    users={filteredUsers} 
                    nurseries={nurseries}
                    onEdit={handleEditUser} 
                    onDeactivate={(id) => deactivateUserMutation.mutate(id)}
                    onReactivate={(id) => reactivateUserMutation.mutate(id)}
                    onAssignNurseries={handleAssignNurseries}
                    onDelete={(id) => deleteUserMutation.mutate(id)}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. They'll receive an email with login instructions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  placeholder="First Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Create a password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    <SelectItem value="super_admin">Super Administrator</SelectItem>
                    <SelectItem value="admin">Nursery Administrator</SelectItem>
                    <SelectItem value="editor">Content Editor</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {(newUser.role === "admin" || newUser.role === "editor") && (
              <div className="space-y-2">
                <Label>Assign to Nursery</Label>
                <Select
                  value={newUser.nurseryId?.toString() || ""}
                  onValueChange={handleNewUserNurserySelection}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a nursery" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Nurseries</SelectLabel>
                      {nurseries.map((nursery: any) => (
                        <SelectItem key={nursery.id} value={nursery.id.toString()}>
                          {nursery.location} - {nursery.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {newUser.role === "admin" ? "Administrator" : "Editor"} can only be assigned to one nursery
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetNewUserForm();
                setCreateDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={editUser.firstName}
                  onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={editUser.lastName}
                  onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editRole">Role</Label>
              <Select
                value={editUser.role}
                onValueChange={(value) => setEditUser({ ...editUser, role: value })}
              >
                <SelectTrigger id="editRole">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    <SelectItem value="super_admin">Super Administrator</SelectItem>
                    <SelectItem value="admin">Nursery Administrator</SelectItem>
                    <SelectItem value="editor">Content Editor</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isActive"
                checked={editUser.isActive}
                onCheckedChange={(value) => 
                  setEditUser({ ...editUser, isActive: value === true })
                }
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active Account
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Nursery Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Nursery</DialogTitle>
            <DialogDescription>
              Select the nursery this user can manage. Each user can only be assigned to one nursery.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Select Nursery</Label>
              <Select
                value={userNurseryAssignments[0]?.toString() || ""}
                onValueChange={handleNurseryAssignmentSelection}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a nursery" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Nurseries</SelectLabel>
                    {nurseries.map((nursery: any) => (
                      <SelectItem key={nursery.id} value={nursery.id.toString()}>
                        {nursery.location} - {nursery.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                User will be assigned to only one nursery
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitNurseryAssignment} 
              disabled={assignNurseryMutation.isPending}
            >
              {assignNurseryMutation.isPending ? "Saving..." : "Save Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </NewDashboardLayout>
    </ProtectedRoute>
  );
}

interface UsersTableProps {
  users: any[];
  nurseries: any[];
  onEdit: (user: any) => void;
  onDeactivate: (id: number) => void;
  onReactivate: (id: number) => void;
  onAssignNurseries: (user: any) => void;
  onDelete: (id: number) => void;
}

function UsersTable({ 
  users, 
  nurseries,
  onEdit, 
  onDeactivate, 
  onReactivate,
  onAssignNurseries,
  onDelete
}: UsersTableProps) {
  // Function to get nursery names for a user
  const getNurseryNames = (user: any) => {
    if (!user.assignedNurseries || user.assignedNurseries.length === 0) {
      return 'None';
    }
    
    return user.assignedNurseries
      .map((nursery: any) => nursery.location)
      .join(", ");
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Assigned Nurseries</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    {user.profileImageUrl ? (
                      <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
                    ) : (
                      <AvatarFallback>
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span>{user.firstName} {user.lastName}</span>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={
                    user.role === 'super_admin' ? 'default' : 
                    user.role === 'admin' ? 'secondary' : 'outline'
                  }>
                    {user.role === 'super_admin' ? 'Super Admin' : 
                     user.role === 'admin' ? 'Administrator' : 'Editor'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {getNurseryNames(user)}
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAssignNurseries(user)}>
                        <UserPlus className="mr-2 h-4 w-4" /> Assign Nurseries
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.isActive ? (
                        <DropdownMenuItem onClick={() => onDeactivate(user.id)}>
                          <X className="mr-2 h-4 w-4" /> Deactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onReactivate(user.id)}>
                          <Check className="mr-2 h-4 w-4" /> Reactivate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(user.id)} 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}