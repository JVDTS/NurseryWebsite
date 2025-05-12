import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ALL_NURSERIES } from '@/hooks/use-nursery-selector';

interface Nursery {
  id: number;
  name: string;
  location: string;
}

interface NurserySelectorProps {
  selectedNurseryId: number | null;
  onChange: (id: number | null) => void;
}

export default function NurserySelector({ selectedNurseryId, onChange }: NurserySelectorProps) {
  const { user } = useAuth();
  const [nurseries, setNurseries] = useState<Nursery[]>([]);
  
  // Only super_admin can see all nurseries
  const canSelectNursery = user?.role === 'super_admin';
  
  // Fetch nurseries
  const { data: nurseriesData, isLoading } = useQuery<{ nurseries: Nursery[] }>({
    queryKey: ['/api/nurseries'],
    queryFn: async () => {
      const response = await fetch('/api/nurseries');
      if (!response.ok) throw new Error('Failed to fetch nurseries');
      return response.json();
    },
    enabled: !!user,
  });
  
  // Initialize nurseries when data is loaded
  useEffect(() => {
    console.log("Nurseries data:", nurseriesData);
    if (nurseriesData?.nurseries) {
      setNurseries(nurseriesData.nurseries);
    }
  }, [nurseriesData]);
  
  // Initialize selection based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'super_admin') {
        // For super_admin, default to all nurseries
        onChange(selectedNurseryId !== null ? selectedNurseryId : ALL_NURSERIES);
      } else if (user.nurseryId) {
        // For nursery_admin, always use their assigned nursery
        onChange(user.nurseryId);
      }
    }
  }, [user, onChange]);
  
  // Handle selection change
  const handleSelectionChange = (value: string) => {
    console.log("NurserySelector: Selection changed to", value);
    if (value === 'all') {
      onChange(ALL_NURSERIES);
    } else {
      const nurseryId = parseInt(value, 10);
      onChange(nurseryId);
    }
  };
  
  // Get the currently selected nursery name
  const getSelectedNurseryName = () => {
    if (selectedNurseryId === ALL_NURSERIES || selectedNurseryId === null) {
      return 'All Nurseries';
    }
    
    const selectedNursery = nurseries.find(n => n.id === selectedNurseryId);
    return selectedNursery ? selectedNursery.name : 'Select a nursery';
  };
  
  // Don't show selector for non-super_admin users
  if (!canSelectNursery && user?.nurseryId) {
    // Just show the fixed nursery name for nursery_admin
    const currentNursery = nurseries.find(n => n.id === user.nurseryId);
    
    return (
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-purple-100 bg-opacity-50">
          <CardTitle className="text-sm font-medium">
            Your Nursery
          </CardTitle>
          <div className="rounded-md bg-purple-500 p-2">
            <Building2 className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-xl font-bold">{currentNursery?.name || 'Loading...'}</div>
          <p className="text-xs text-gray-500 mt-1">
            {currentNursery?.location || ''}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // For super_admin, show selector with all nurseries
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-purple-100 bg-opacity-50">
        <CardTitle className="text-sm font-medium">
          Select Nursery
        </CardTitle>
        <div className="rounded-md bg-purple-500 p-2">
          <Building2 className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Select 
          onValueChange={handleSelectionChange} 
          value={selectedNurseryId === ALL_NURSERIES || selectedNurseryId === null ? 'all' : selectedNurseryId?.toString()}
        >
          <SelectTrigger>
            <SelectValue placeholder={getSelectedNurseryName()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Nurseries</SelectItem>
            {nurseries.map(nursery => (
              <SelectItem key={nursery.id} value={nursery.id.toString()}>
                {nursery.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-2">
          View data for a specific nursery location
        </p>
      </CardContent>
    </Card>
  );
}