import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// This constant is used to represent "All Nurseries" selection
export const ALL_NURSERIES = -1;

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
  const [selectedNurseryId, setSelectedNurseryId] = useState<number | null>(null);
  const [nurseryName, setNurseryName] = useState<string>('');
  
  // Update nursery name when selection changes
  useEffect(() => {
    if (selectedNurseryId) {
      setNurseryName(getNurseryNameById(selectedNurseryId));
    } else {
      setNurseryName('All Nurseries');
    }
  }, [selectedNurseryId]);
  
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