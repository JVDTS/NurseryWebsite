import { useState } from "react";
import NewDashboardLayout from "@/components/admin/NewDashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, RefreshCw, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ActivityLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [nurseryFilter, setNurseryFilter] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  // Fetch activity logs
  const { data: logs = [], isLoading, refetch: refetchLogs } = useQuery<any[]>({
    queryKey: ["/api/admin/activity-logs"],
  });

  // Fetch users for filter dropdown
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch nurseries for filtering
  const { data: nurseries = [] } = useQuery<any[]>({
    queryKey: ["/api/nurseries"],
  });

  // Get unique actions for filtering
  const getUniqueActions = () => {
    const actionsSet = new Set();
    logs.forEach((log: any) => {
      if (log.action) {
        actionsSet.add(log.action);
      }
    });
    return Array.from(actionsSet);
  };

  // Filter logs based on search and filter criteria
  const filteredLogs = logs.filter((log: any) => {
    // Text search
    const searchMatches = 
      !searchQuery || 
      log.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.action?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // User filter
    const userMatches = !userFilter || userFilter === 'all' || log.userId === parseInt(userFilter);
    
    // Nursery filter
    const nurseryMatches = !nurseryFilter || nurseryFilter === 'all' || log.nurseryId === parseInt(nurseryFilter);
    
    // Action filter
    const actionMatches = !actionFilter || actionFilter === 'all' || log.action === actionFilter;
    
    // Date filter
    let dateMatches = true;
    if (dateFilter && log.createdAt) {
      const logDate = new Date(log.createdAt);
      dateMatches = 
        logDate.getFullYear() === dateFilter.getFullYear() &&
        logDate.getMonth() === dateFilter.getMonth() &&
        logDate.getDate() === dateFilter.getDate();
    }
    
    return searchMatches && userMatches && nurseryMatches && actionMatches && dateMatches;
  });

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "PPP · h:mm a");
    } catch (e) {
      return 'Unknown Date';
    }
  };

  // Helper function to get user name
  const getUserName = (userId: number) => {
    const user = users.find((u: any) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };

  // Helper function to get nursery name
  const getNurseryName = (nurseryId: number) => {
    const nursery = nurseries.find((n: any) => n.id === nurseryId);
    return nursery ? nursery.location : 'Unknown Location';
  };

  // Helper function to get badge color based on action
  const getActionBadgeColor = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'create':
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case 'update':
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case 'delete':
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case 'login':
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case 'logout':
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setUserFilter("all");
    setNurseryFilter("all");
    setActionFilter("all");
    setDateFilter(null);
  };

  return (
    <NewDashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Page header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-gray-500">
            Track user actions and monitor admin activities across the platform.
          </p>
        </div>

        {/* Filters and actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              placeholder="Search activity logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
            <Button variant="outline" type="submit" className="h-9 px-3 flex-shrink-0">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button onClick={() => refetchLogs()} size="sm" variant="outline" className="h-9">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-4">
          {/* User filter */}
          <div className="w-[200px]">
            <Select value={userFilter || "all"} onValueChange={setUserFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {users.map((user: any) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nursery filter */}
          <div className="w-[200px]">
            <Select value={nurseryFilter || "all"} onValueChange={setNurseryFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Filter by nursery" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All nurseries</SelectItem>
                {nurseries.map((nursery: any) => (
                  <SelectItem key={nursery.id} value={nursery.id.toString()}>
                    {nursery.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action filter */}
          <div className="w-[180px]">
            <Select value={actionFilter || "all"} onValueChange={setActionFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {getUniqueActions().map((action: any) => (
                  <SelectItem key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date filter */}
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[180px] h-9 justify-start text-left font-normal",
                    !dateFilter && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFilter || undefined}
                  onSelect={(date) => setDateFilter(date || null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Clear filters button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="h-9 px-3"
          >
            Clear Filters
          </Button>
        </div>

        {/* Activity logs content */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Activity History</CardTitle>
            <CardDescription>
              {filteredLogs.length} {filteredLogs.length === 1 ? 'activity' : 'activities'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-muted-foreground">Loading activity logs...</div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-muted-foreground">No activity logs found</div>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(log.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{getUserName(log.userId)}</div>
                          {log.ipAddress && (
                            <div className="text-xs text-muted-foreground">{log.ipAddress}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={getActionBadgeColor(log.action)}
                          >
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.nurseryId ? getNurseryName(log.nurseryId) : 'System'}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="text-sm">{log.description}</div>
                          {log.details && typeof log.details === 'object' && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {Object.entries(log.details).map(([key, value]: [string, any]) => (
                                <div key={key}>
                                  <span className="font-medium">{key}:</span> {String(value)}
                                </div>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </NewDashboardLayout>
  );
}