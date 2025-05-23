import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
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
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, Trash, Check, X, RefreshCw, UserPlus, Edit } from "lucide-react";
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

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form data states
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "admin",
    assignedNurseries: [] as number[]
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
    mutationFn: async (userData: any) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.statusText}`);
      }
      
      return response.json();
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
      return await apiRequest(`/api/admin/users/${userData.id}`, {
        method: "PATCH",
        body: userData,
      });
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
      return await apiRequest(`/api/admin/users/${userId}/deactivate`, {
        method: "POST",
      });
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
      return await apiRequest(`/api/admin/users/${userId}/reactivate`, {
        method: "POST",
      });
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
      return await apiRequest(`/api/admin/users/${userId}/nurseries`, {
        method: "POST",
        body: { nurseryIds },
      });
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

  // Reset form for creating a new user
  const resetNewUserForm = () => {
    setNewUser({
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      role: "admin",
      assignedNurseries: []
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

    createUserMutation.mutate({
      ...newUser,
      nurseryIds: newUser.assignedNurseries.length > 0 ? newUser.assignedNurseries : undefined
    });
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

  // Handle toggling a nursery selection for assignment
  const toggleNurserySelection = (nurseryId: number) => {
    if (userNurseryAssignments.includes(nurseryId)) {
      setUserNurseryAssignments(userNurseryAssignments.filter(id => id !== nurseryId));
    } else {
      setUserNurseryAssignments([...userNurseryAssignments, nurseryId]);
    }
  };
  
  // Handle toggling a nursery selection when creating a new user
  const toggleNewUserNurserySelection = (nurseryId: number) => {
    if (newUser.assignedNurseries.includes(nurseryId)) {
      setNewUser({
        ...newUser,
        assignedNurseries: newUser.assignedNurseries.filter(id => id !== nurseryId)
      });
    } else {
      setNewUser({
        ...newUser,
        assignedNurseries: [...newUser.assignedNurseries, nurseryId]
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <Button onClick={() => {
            resetNewUserForm();
            setCreateDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Users</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => refetchUsers()}
                    title="Refresh"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Manage users and their access to the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
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
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Create a password"
              />
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
            <div className="space-y-2">
              <Label>Assign to Nurseries</Label>
              <ScrollArea className="h-36 border rounded-md p-2">
                <div className="space-y-2">
                  {nurseries.map((nursery: any) => (
                    <div key={nursery.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`nursery-${nursery.id}`}
                        checked={newUser.assignedNurseries.includes(nursery.id)}
                        onCheckedChange={() => toggleNewUserNurserySelection(nursery.id)}
                      />
                      <Label 
                        htmlFor={`nursery-${nursery.id}`}
                        className="cursor-pointer"
                      >
                        {nursery.location}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
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

      {/* Assign Nurseries Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Nurseries</DialogTitle>
            <DialogDescription>
              Select the nurseries this user can manage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <ScrollArea className="h-60 border rounded-md p-4">
              <div className="space-y-3">
                {nurseries.map((nursery: any) => (
                  <div key={nursery.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`assign-nursery-${nursery.id}`}
                      checked={userNurseryAssignments.includes(nursery.id)}
                      onCheckedChange={() => toggleNurserySelection(nursery.id)}
                    />
                    <Label 
                      htmlFor={`assign-nursery-${nursery.id}`}
                      className="cursor-pointer flex-grow"
                    >
                      {nursery.location}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
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
              {assignNurseryMutation.isPending ? "Saving..." : "Save Assignments"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

interface UsersTableProps {
  users: any[];
  nurseries: any[];
  onEdit: (user: any) => void;
  onDeactivate: (id: number) => void;
  onReactivate: (id: number) => void;
  onAssignNurseries: (user: any) => void;
}

function UsersTable({ 
  users, 
  nurseries,
  onEdit, 
  onDeactivate, 
  onReactivate,
  onAssignNurseries
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