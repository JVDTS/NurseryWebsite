import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from '@/hooks/useAuth';
import { Home, RefreshCcw } from 'lucide-react';

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

interface NurserySelectorProps {
  onChange: (nurseryId: number | null) => void;
  selectedNurseryId: number | null;
}

export const NurserySelector: React.FC<NurserySelectorProps> = ({ 
  onChange, 
  selectedNurseryId 
}) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  
  // Define the API response type
  interface NurseriesResponse {
    success: boolean;
    nurseries: Nursery[];
  }
  
  // Fetch all nurseries (only for super admin)
  const { data: response, isLoading } = useQuery<NurseriesResponse, Error>({
    queryKey: ['/api/nurseries'],
    enabled: !!user && isSuperAdmin,
  });
  
  // Extract nurseries data from response
  const nurseriesData: Nursery[] = response?.nurseries || [];
  
  // For debugging
  console.log("Nurseries data:", nurseriesData);
  console.log("Selected nursery ID:", selectedNurseryId);
  
  // Set initial nursery based on user's role
  useEffect(() => {
    if (user && !isSuperAdmin && user.nurseryId) {
      onChange(user.nurseryId);
    }
  }, [user, isSuperAdmin, onChange]);

  // For super admin, handle nursery selection change
  const handleNurseryChange = (value: string) => {
    if (value === 'all') {
      onChange(null);
    } else {
      onChange(parseInt(value));
    }
  };

  if (isLoading) {
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
            {user.nurseryLocation || "Your Nursery"}
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
          value={selectedNurseryId ? selectedNurseryId.toString() : 'all'} 
          onValueChange={handleNurseryChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a nursery" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Nurseries</SelectItem>
            {nurseriesData?.map((nursery: Nursery) => (
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

export default NurserySelector;