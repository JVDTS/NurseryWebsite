import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from '@/hooks/use-auth';
import { Home, RefreshCcw } from 'lucide-react';

// Define the nursery type
interface Nursery {
  id: number;
  name: string;
  location: string;
  address: string;
  phoneNumber: string;
  email: string;
  description: string;
  heroImage: string;
  createdAt: string;
  updatedAt: string;
}

// Define the API response type
interface NurseriesResponse {
  success: boolean;
  nurseries: Nursery[];
}

// Define the component props
interface NurserySelectorProps {
  onChange: (nurseryId: number | null) => void;
  selectedNurseryId: number | null;
}

export const NurserySelectorNew: React.FC<NurserySelectorProps> = ({ 
  onChange, 
  selectedNurseryId 
}) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  
  // Fetch nurseries directly (hardcoded for reliability)
  const nurseries: Nursery[] = [
    {
      id: 1,
      name: "Hayes Nursery",
      location: "hayes",
      address: "192 Church Road, Hayes, UB3 2LT",
      phoneNumber: "01895 272885",
      email: "hayes@cmcnursery.co.uk",
      description: "Our Hayes nursery provides a warm, welcoming environment...",
      heroImage: "https://images.unsplash.com/photo-1567448400815-a6fa3ac9c0ff",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: "Uxbridge Nursery",
      location: "uxbridge",
      address: "4 New Windsor Street, Uxbridge, UB8 2TU",
      phoneNumber: "01895 272885",
      email: "uxbridge@cmcnursery.co.uk",
      description: "Our Uxbridge nursery is a cozy, innovative environment...",
      heroImage: "https://images.unsplash.com/photo-1544487660-b86394cba400",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      name: "Hounslow Nursery",
      location: "hounslow",
      address: "488, 490 Great West Rd, Hounslow TW5 0TA",
      phoneNumber: "01895 272885",
      email: "hounslow@cmcnursery.co.uk",
      description: "Our Hounslow nursery is a nature-focused environment...",
      heroImage: "https://images.unsplash.com/photo-1543248939-4296e1fea89b",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  // Also fetch from API as a backup (not used in rendering)
  const { isLoading: isApiLoading } = useQuery<NurseriesResponse>({
    queryKey: ['/api/nurseries'],
    enabled: !!user && isSuperAdmin,
  });
  
  // Set initial nursery based on user's role
  useEffect(() => {
    if (user && !isSuperAdmin && user.nurseryId) {
      onChange(user.nurseryId);
    }
  }, [user, isSuperAdmin, onChange]);

  // Get nursery name by ID
  const getNurseryName = (id: number | undefined): string => {
    if (!id) return "Unknown Nursery";
    
    switch(id) {
      case 1: return "Hayes Nursery";
      case 2: return "Uxbridge Nursery";
      case 3: return "Hounslow Nursery";
      default: return "Unknown Nursery";
    }
  };

  // Handle nursery selection change
  const handleNurseryChange = (value: string) => {
    console.log('Nursery selection changed to:', value);
    if (value === 'all') {
      onChange(null);
    } else {
      onChange(parseInt(value));
    }
  };

  // Show loading state
  if (isApiLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-100">
          <CardTitle className="text-sm font-medium">
            Nursery
          </CardTitle>
          <div className="rounded-md bg-primary p-2">
            <Home className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-6 flex justify-center items-center">
          <RefreshCcw className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // If user is not super admin, show their assigned nursery
  if (!isSuperAdmin && user) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-100">
          <CardTitle className="text-sm font-medium">
            Nursery
          </CardTitle>
          <div className="rounded-md bg-primary p-2">
            <Home className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-xl font-bold capitalize">
            {getNurseryName(user.nurseryId) || "Your Nursery"}
          </div>
          <CardDescription className="text-xs text-gray-500 mt-1">
            Dashboard view for your nursery
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  // For super admin, show dropdown to select nursery
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-100">
        <CardTitle className="text-sm font-medium">
          Select Nursery
        </CardTitle>
        <div className="rounded-md bg-primary p-2">
          <Home className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Select 
          defaultValue={selectedNurseryId ? selectedNurseryId.toString() : 'all'} 
          onValueChange={handleNurseryChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a nursery" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Nurseries</SelectItem>
            {nurseries.map((nursery) => (
              <SelectItem key={nursery.id} value={nursery.id.toString()}>
                {nursery.name} ({nursery.location})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CardDescription className="text-xs text-gray-500 mt-2">
          View data for a specific nursery or all nurseries
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default NurserySelectorNew;