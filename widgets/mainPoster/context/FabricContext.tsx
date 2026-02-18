'use client';

import { createContext, useContext, ReactNode } from 'react';

import { useFabric } from '../hooks/useFabric';
import { useFabricDiagram } from '../hooks/useFabricDiagram';
import { useFabricImage } from '../hooks/useFabricImage';

// useFabric, useFabricDiagram, useFabricImage 훅의 반환 타입 정의 (Intersection)
type FabricContextType = ReturnType<typeof useFabric> &
  ReturnType<typeof useFabricDiagram> &
  ReturnType<typeof useFabricImage>;

const FabricContext = createContext<FabricContextType | null>(null);

export const FabricProvider = ({ children }: { children: ReactNode }) => {
  const fabricValues = useFabric();

  const fabricDiagramValues = useFabricDiagram({
    setDrawingMode: fabricValues.setDrawingMode,
  });

  const fabricImageValues = useFabricImage({
    syncActiveObjectInfo: fabricValues.syncActiveObjectInfo,
  });

  const value = {
    ...fabricValues,
    ...fabricDiagramValues,
    ...fabricImageValues,
  };

  return (
    <FabricContext.Provider value={value}>{children}</FabricContext.Provider>
  );
};

export const useFabricContext = () => {
  const context = useContext(FabricContext);
  if (!context) {
    throw new Error('useFabricContext must be used within a FabricProvider');
  }
  return context;
};
