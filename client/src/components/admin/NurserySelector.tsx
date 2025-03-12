import { useAuth } from '@/hooks/use-auth';
import { 
  useNurserySelector, 
  getNurseryName, 
  nurseryOptions, 
  ALL_NURSERIES 
} from '@/hooks/use-nursery-selector';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useEffect } from 'react';

export default function NurserySelector() {
  const { user } = useAuth();
  const { selectedNurseryId, setSelectedNurseryId } = useNurserySelector();

  // Auto-select the nursery based on user role when the component mounts
  useEffect(() => {
    // For nursery admins, always use their assigned nursery
    if (user?.role === 'nursery_admin' && user?.nurseryId) {
      setSelectedNurseryId(user.nurseryId);
    } 
    // For super admins, select the "All Nurseries" option by default
    else if (user?.role === 'super_admin' && selectedNurseryId === null) {
      setSelectedNurseryId(ALL_NURSERIES);
    }
  }, [user, selectedNurseryId, setSelectedNurseryId]);

  // If the user is a nursery admin, they can only see their own nursery
  if (user?.role === 'nursery_admin') {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">Managing:</span>
        <Badge variant="outline">{getNurseryName(user.nurseryId)}</Badge>
      </div>
    );
  }

  // Super admin can select any nursery or all nurseries
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Select Nursery:</span>
      <Select
        value={selectedNurseryId?.toString() || ''}
        onValueChange={(value) => {
          setSelectedNurseryId(parseInt(value));
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a nursery" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_NURSERIES.toString()}>
            All Nurseries
          </SelectItem>
          {nurseryOptions.map((nursery) => (
            <SelectItem key={nursery.id} value={nursery.id.toString()}>
              {nursery.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}