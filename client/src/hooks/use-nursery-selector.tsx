import React, { createContext, useContext, useState } from 'react';

// Special value to indicate "all nurseries"
export const ALL_NURSERIES = -1;

interface NurseryContextProps {
  selectedNurseryId: number | null;
  setSelectedNurseryId: (id: number | null) => void;
  isAllNurseries: boolean;
}

const NurseryContext = createContext<NurseryContextProps | undefined>(undefined);

export function NurserySelectorProvider({ children }: { children: React.ReactNode }) {
  const [selectedNurseryId, setSelectedNurseryId] = useState<number | null>(null);

  const value = {
    selectedNurseryId,
    setSelectedNurseryId,
    isAllNurseries: selectedNurseryId === ALL_NURSERIES
  };

  return <NurseryContext.Provider value={value}>{children}</NurseryContext.Provider>;
}

export function useNurserySelector() {
  const context = useContext(NurseryContext);
  if (!context) {
    throw new Error('useNurserySelector must be used within a NurserySelectorProvider');
  }
  return context;
}

// Utility functions to work with nurseries
export function getNurseryName(nurseryId: number | null): string {
  if (nurseryId === null) return 'No Nursery Selected';
  if (nurseryId === ALL_NURSERIES) return 'All Nurseries';
  
  switch(nurseryId) {
    case 1: return 'Hayes';
    case 2: return 'Uxbridge';
    case 3: return 'Hounslow';
    default: return 'Unknown Nursery';
  }
}

export function getNurseryColor(nurseryId: number | null): string {
  if (nurseryId === null) return 'gray';
  if (nurseryId === ALL_NURSERIES) return 'purple';
  
  switch(nurseryId) {
    case 1: return 'red';
    case 2: return 'blue';
    case 3: return 'green';
    default: return 'gray';
  }
}

export const nurseryOptions = [
  { id: 1, name: 'Hayes', color: 'red' },
  { id: 2, name: 'Uxbridge', color: 'blue' },
  { id: 3, name: 'Hounslow', color: 'green' },
];