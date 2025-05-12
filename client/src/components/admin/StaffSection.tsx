import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users,
  User,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface StaffMember {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  nurseryId: number | null;
  profileImageUrl?: string;
}

interface StaffSectionProps {
  nurseryId?: number;
  limit?: number;
}

export default function StaffSection({
  nurseryId,
  limit = 5
}: StaffSectionProps) {
  // Get the API endpoint based on the nurseryId
  const getEndpoint = () => {
    if (nurseryId) {
      return `/api/admin/staff/nursery/${nurseryId}`;
    } else {
      return '/api/admin/staff';
    }
  };

  // Fetch staff data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['staff', nurseryId],
    queryFn: async () => {
      const endpoint = getEndpoint();
      console.log("Fetching staff from:", endpoint);
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch staff data');
      return response.json();
    },
  });

  // Maps for role names with friendly display
  const roleNames = {
    super_admin: 'Super Admin',
    nursery_admin: 'Nursery Admin',
    staff: 'Staff Member',
    regular: 'Regular User'
  };

  // Get initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'nursery_admin':
        return 'default';
      case 'staff':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-center text-center">
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>
            {nurseryId
              ? 'Staff assigned to this nursery'
              : 'Staff across all nurseries'
            }
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2">
        <div className="space-y-3">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-2 rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))
          ) : isError ? (
            <div className="text-center text-red-500 py-4">
              Failed to load staff information
            </div>
          ) : data?.staff?.length > 0 ? (
            // Render staff list
            data.staff.slice(0, limit).map((staffMember) => (
              <div 
                key={staffMember.id} 
                className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Avatar>
                  <AvatarImage src={staffMember.profileImageUrl} alt={`${staffMember.firstName} ${staffMember.lastName}`} />
                  <AvatarFallback>{getInitials(staffMember.firstName, staffMember.lastName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {staffMember.firstName} {staffMember.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{staffMember.email}</p>
                </div>
                <Badge variant={getRoleBadgeVariant(staffMember.role)}>
                  {roleNames[staffMember.role]}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4 w-full">
              No staff members found
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-2 border-t">
        <div className="flex gap-2">
          <Button variant="link" size="sm">
            View all staff <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          <Button variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-1" /> Add Staff
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}