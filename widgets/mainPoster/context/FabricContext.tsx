'use client';

import { createContext, useContext, ReactNode } from 'react';

import { useFabric } from '../hooks/useFabric';
import { useFabricGraphic } from '../hooks/useFabricGraphic';
import { useFabricImage } from '../hooks/useFabricImage';
import { useFabricText } from '../hooks/useFabricText';

type FabricContextType = ReturnType<typeof useFabric> &
  ReturnType<typeof useFabricGraphic> &
  ReturnType<typeof useFabricImage> &
  ReturnType<typeof useFabricText>;

const FabricContext = createContext<FabricContextType | null>(null);

export const FabricProvider = ({ children }: { children: ReactNode }) => {
  const fabricValues = useFabric();

  const fabricTextValues = useFabricText({
    syncActiveObjectInfo: fabricValues.syncActiveObjectInfo,
    saveHistory: fabricValues.saveHistory,
  });

  const fabricDiagramValues = useFabricGraphic();

  const fabricImageValues = useFabricImage({
    syncActiveObjectInfo: fabricValues.syncActiveObjectInfo,
    saveHistory: fabricValues.saveHistory,
  });

  const value = {
    ...fabricValues,
    ...fabricDiagramValues,
    ...fabricImageValues,
    ...fabricTextValues,
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
