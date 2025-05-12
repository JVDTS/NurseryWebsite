import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { 
  Users, 
  RefreshCcw,
  User,
  Shield,
  Home,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

// Role badge colors
const roleBadgeColors = {
  super_admin: 'bg-red-100 text-red-800',
  nursery_admin: 'bg-blue-100 text-blue-800',
  staff: 'bg-green-100 text-green-800',
  regular: 'bg-gray-100 text-gray-800'
};

// Get role display name
const getRoleName = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'nursery_admin':
      return 'Nursery Admin';
    case 'staff':
      return 'Staff';
    default:
      return 'Regular User';
  }
};

// Get initials for avatar
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

interface StaffSectionProps {
  nurseryId?: number;
  limit?: number;
}

export const StaffSection: React.FC<StaffSectionProps> = ({ nurseryId, limit = 5 }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  
  // Fetch staff based on nursery selection or all staff for super admin
  const { data: response, isLoading, error } = useQuery({
    queryKey: nurseryId 
      ? ['/api/admin/staff/nursery', nurseryId]
      : ['/api/admin/staff'],
    enabled: !!user && isSuperAdmin
  });
  
  // Extract staff data from response
  const staffData = response?.success ? response.data : [];

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-100">
          <CardTitle className="text-sm font-medium">
            Staff
          </CardTitle>
          <div className="rounded-md bg-indigo-500 p-2">
            <Users className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-40">
            <RefreshCcw className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !staffData) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-100">
          <CardTitle className="text-sm font-medium">
            Staff
          </CardTitle>
          <div className="rounded-md bg-indigo-500 p-2">
            <Users className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            {isSuperAdmin ? 
              "There was an error loading staff data. Please try again later." :
              "Staff management is only available for Super Admins."}
          </div>
        </CardContent>
      </Card>
    );
  }

  // If not super admin, show message about staff management
  if (!isSuperAdmin) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-100">
          <CardTitle className="text-sm font-medium">
            Staff
          </CardTitle>
          <div className="rounded-md bg-indigo-500 p-2">
            <Users className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Staff management is only available for Super Admins.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="text-center">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Staff Management</CardTitle>
          <Button size="sm" variant="outline" className="h-8">
            <Plus className="mr-2 h-3.5 w-3.5" />
            Add Staff
          </Button>
        </div>
        <CardDescription>
          {nurseryId 
            ? 'Staff assigned to this nursery' 
            : 'All staff across nurseries'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {staffData?.length > 0 ? (
            staffData.slice(0, limit).map((staffMember) => (
              <div key={staffMember.id} className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={staffMember.profileImageUrl} alt={`${staffMember.firstName} ${staffMember.lastName}`} />
                  <AvatarFallback>{getInitials(staffMember.firstName, staffMember.lastName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium">
                      {staffMember.firstName} {staffMember.lastName}
                    </h4>
                    <Badge className={`ml-2 ${roleBadgeColors[staffMember.role] || 'bg-gray-100 text-gray-800'}`}>
                      {getRoleName(staffMember.role)}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    {staffMember.nurseryName && (
                      <>
                        <Home className="h-3 w-3 mr-1" />
                        <span>{staffMember.nurseryName}</span>
                      </>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="ml-auto" asChild>
                  <Link href={`/admin/staff/${staffMember.id}`}>
                    <User className="h-4 w-4 mr-1" />
                    <span>View</span>
                  </Link>
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">
              No staff members found
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-3 flex justify-center">
        <Link href="/admin/staff">
          <a className="text-sm text-primary font-medium flex items-center hover:underline">
            Manage All Staff
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default StaffSection;