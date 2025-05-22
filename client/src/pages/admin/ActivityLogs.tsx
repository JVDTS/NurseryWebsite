import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Activity, Filter, Download } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAdmin } from "@/hooks/useAdmin";

// Action badge colors
const actionBadgeColors = {
  login: "bg-blue-100 text-blue-800 border-blue-300",
  logout: "bg-gray-100 text-gray-800 border-gray-300",
  create: "bg-green-100 text-green-800 border-green-300",
  update: "bg-amber-100 text-amber-800 border-amber-300",
  delete: "bg-red-100 text-red-800 border-red-300",
  view: "bg-purple-100 text-purple-800 border-purple-300",
  download: "bg-indigo-100 text-indigo-800 border-indigo-300",
  upload: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

export default function ActivityLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const { isSuperAdmin, isAdmin } = useAdmin();
  
  // Fetch activity logs
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["/api/activity"],
    enabled: isSuperAdmin || isAdmin,
  });
  
  // Fetch users for display names
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    enabled: isSuperAdmin || isAdmin,
  });
  
  // Fetch nurseries for display names
  const { data: nurseries = [] } = useQuery({
    queryKey: ["/api/nurseries"],
    enabled: isSuperAdmin || isAdmin,
  });
  
  // Process the logs data to include user and nursery names
  const processedLogs = logs.map((log: any) => {
    const user = users.find((u: any) => u.id === log.userId);
    const nursery = nurseries.find((n: any) => n.id === log.nurseryId);
    
    return {
      ...log,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
      nurseryName: nursery ? nursery.name : 'All Nurseries',
    };
  });
  
  // Filter logs based on search and filters
  const filteredLogs = processedLogs.filter((log: any) => {
    // Search filter
    const searchMatch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entityType && log.entityType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.nurseryName && log.nurseryName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Action filter
    const actionMatch = actionFilter === 'all' || 
      (log.action.toLowerCase().includes(actionFilter.toLowerCase()));
    
    // Entity filter
    const entityMatch = entityFilter === 'all' || 
      (log.entityType && log.entityType.toLowerCase() === entityFilter.toLowerCase());
    
    // Date filter
    let dateMatch = true;
    const today = new Date();
    const logDate = new Date(log.createdAt);
    
    if (dateFilter === 'today') {
      dateMatch = logDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      dateMatch = logDate.toDateString() === yesterday.toDateString();
    } else if (dateFilter === 'thisWeek') {
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      dateMatch = logDate >= lastWeek;
    } else if (dateFilter === 'thisMonth') {
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      dateMatch = logDate >= lastMonth;
    }
    
    return searchMatch && actionMatch && entityMatch && dateMatch;
  });
  
  // Sort logs by date (newest first)
  const sortedLogs = [...filteredLogs].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Get unique action types for filter
  const actionTypes = [...new Set(logs.map((log: any) => log.action))];
  
  // Get unique entity types for filter
  const entityTypes = [...new Set(logs.map((log: any) => log.entityType).filter(Boolean))];
  
  // Export logs as CSV
  const exportCSV = () => {
    if (sortedLogs.length === 0) return;
    
    const headers = ['Date', 'Time', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Nursery'];
    const csvRows = [headers];
    
    sortedLogs.forEach((log: any) => {
      const date = new Date(log.createdAt);
      const row = [
        format(date, 'yyyy-MM-dd'),
        format(date, 'HH:mm:ss'),
        log.userName,
        log.action,
        log.entityType || '',
        log.entityId || '',
        log.ipAddress || '',
        log.nurseryName,
      ];
      csvRows.push(row);
    });
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Format the log action for display
  const formatAction = (action: string) => {
    // Check action prefixes
    if (action.startsWith('create_')) {
      return 'Create';
    } else if (action.startsWith('update_')) {
      return 'Update';
    } else if (action.startsWith('delete_')) {
      return 'Delete';
    } else if (action.startsWith('view_')) {
      return 'View';
    } else if (action.startsWith('download_')) {
      return 'Download';
    } else if (action.startsWith('upload_')) {
      return 'Upload';
    } else if (action === 'login') {
      return 'Login';
    } else if (action === 'logout') {
      return 'Logout';
    }
    
    // If no match, capitalize first letter
    return action.charAt(0).toUpperCase() + action.slice(1);
  };
  
  // Get action category for badge coloring
  const getActionCategory = (action: string) => {
    if (action.startsWith('create_')) return 'create';
    if (action.startsWith('update_')) return 'update';
    if (action.startsWith('delete_')) return 'delete';
    if (action.startsWith('view_')) return 'view';
    if (action.startsWith('download_')) return 'download';
    if (action.startsWith('upload_')) return 'upload';
    if (action === 'login') return 'login';
    if (action === 'logout') return 'logout';
    return 'view'; // default
  };
  
  // Format entity type for display
  const formatEntityType = (type: string | undefined) => {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };
  
  return (
    <AdminLayout
      title="Activity Logs"
      description="View and monitor user activity across the system"
      icon={<Activity className="h-6 w-6" />}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Activity Logs</h2>
          
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={exportCSV}
            disabled={sortedLogs.length === 0}
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>
              Audit trail of all user actions in the CMS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="logout">Logout</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="view">View</SelectItem>
                      <SelectItem value="download">Download</SelectItem>
                      <SelectItem value="upload">Upload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={entityFilter} onValueChange={setEntityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Entity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Entities</SelectItem>
                      {entityTypes.map((type: any) => (
                        <SelectItem key={type} value={type}>
                          {formatEntityType(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="thisWeek">This Week</SelectItem>
                      <SelectItem value="thisMonth">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {sortedLogs.length} of {logs.length} logs
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>Advanced Filters</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Action Type</DropdownMenuLabel>
                      {actionTypes.map((action: string) => (
                        <DropdownMenuItem 
                          key={action}
                          onClick={() => setActionFilter(action)}
                        >
                          {formatAction(action)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Entity Type</DropdownMenuLabel>
                      {entityTypes.map((type: string) => (
                        <DropdownMenuItem 
                          key={type}
                          onClick={() => setEntityFilter(type)}
                        >
                          {formatEntityType(type)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <ScrollArea className="h-[500px] border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-[180px]">Date & Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-right">Nursery</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading activity logs...
                        </TableCell>
                      </TableRow>
                    ) : sortedLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No activity logs found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedLogs.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="font-medium">
                              {format(new Date(log.createdAt), 'dd MMM yyyy')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(log.createdAt), 'HH:mm:ss')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{log.userName}</div>
                            {log.ipAddress && (
                              <div className="text-xs text-muted-foreground">
                                IP: {log.ipAddress}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={
                                actionBadgeColors[getActionCategory(log.action) as keyof typeof actionBadgeColors] || 
                                "bg-gray-100 text-gray-800 border-gray-300"
                              }
                            >
                              {formatAction(log.action)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {log.entityType && (
                              <div className="font-medium">
                                {formatEntityType(log.entityType)}
                                {log.entityId && ` #${log.entityId}`}
                              </div>
                            )}
                            {log.details && Object.keys(log.details).length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                                {Object.entries(log.details).map(([key, value]) => (
                                  <span key={key} className="mr-2">
                                    {key}: {value?.toString().substring(0, 20)}{value?.toString().length > 20 ? '...' : ''}
                                  </span>
                                ))}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{log.nurseryName}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}