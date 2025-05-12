import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface NurserySelectorContextType {
  selectedNurseryId: number | null;
  setSelectedNurseryId: (id: number | null) => void;
  nurseryName: string;
}

const NurserySelectorContext = createContext<NurserySelectorContextType | undefined>(undefined);

interface NurserySelectorProviderProps {
  children: ReactNode;
}

export const NurserySelectorProvider: React.FC<NurserySelectorProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [selectedNurseryId, setSelectedNurseryId] = useState<number | null>(null);
  const [nurseryName, setNurseryName] = useState<string>('');
  
  // Initialize nursery selection based on user role
  useEffect(() => {
    if (user && user.role !== 'super_admin' && user.nurseryId) {
      setSelectedNurseryId(user.nurseryId);
    }
  }, [user]);
  
  // Update nursery name when selection changes
  useEffect(() => {
    if (selectedNurseryId) {
      setNurseryName(getNurseryNameById(selectedNurseryId));
    } else if (user && user.role === 'super_admin') {
      setNurseryName('All Nurseries');
    } else {
      setNurseryName('');
    }
  }, [selectedNurseryId, user]);
  
  // Helper function to get nursery name by ID
  function getNurseryNameById(id: number): string {
    switch(id) {
      case 1: return 'Hayes Nursery';
      case 2: return 'Uxbridge Nursery';
      case 3: return 'Hounslow Nursery';
      default: return 'Unknown Nursery';
    }
  }
  
  return (
    <NurserySelectorContext.Provider value={{ selectedNurseryId, setSelectedNurseryId, nurseryName }}>
      {children}
    </NurserySelectorContext.Provider>
  );
};

export const useNurserySelector = (): NurserySelectorContextType => {
  const context = useContext(NurserySelectorContext);
  if (context === undefined) {
    throw new Error('useNurserySelector must be used within a NurserySelectorProvider');
  }
  return context;
};