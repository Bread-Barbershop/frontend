'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';

import { useFabric } from '../hooks/useFabric';
import { useFabricBackground } from '../hooks/useFabricBackground';
import { useFabricGraphic } from '../hooks/useFabricGraphic';
import { useFabricImage } from '../hooks/useFabricImage';
import { useFabricText } from '../hooks/useFabricText';

type FabricContextType = ReturnType<typeof useFabric> &
  ReturnType<typeof useFabricGraphic> &
  ReturnType<typeof useFabricImage> &
  ReturnType<typeof useFabricBackground> &
  ReturnType<typeof useFabricText> & {
    initialData?: string;
    canUndo: boolean;
    canRedo: boolean;
    clipboard: any; // FabricObject | null
  };

const FabricContext = createContext<FabricContextType | null>(null);

export const FabricProvider = ({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData?: string;
}) => {
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

  const fabricBackgroundValues = useFabricBackground({
    canvas: fabricValues.canvas,
    saveHistory: fabricValues.saveHistory,
  });

  const value = useMemo(
    () => ({
      ...fabricValues,
      ...fabricDiagramValues,
      ...fabricImageValues,
      ...fabricTextValues,
      ...fabricBackgroundValues,
      initialData,
    }),
    [
      fabricValues,
      fabricDiagramValues,
      fabricImageValues,
      fabricTextValues,
      fabricBackgroundValues,
      initialData,
    ]
  );

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
