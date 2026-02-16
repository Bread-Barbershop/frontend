'use client';

import { createContext, useContext, ReactNode } from 'react';

import { useFabric } from '../hooks/useFabric';

// useFabric 훅의 반환 타입 정의
type FabricContextType = ReturnType<typeof useFabric>;

const FabricContext = createContext<FabricContextType | null>(null);

export const FabricProvider = ({ children }: { children: ReactNode }) => {
  const fabricValues = useFabric();

  return (
    <FabricContext.Provider value={fabricValues}>
      {children}
    </FabricContext.Provider>
  );
};

export const useFabricContext = () => {
  const context = useContext(FabricContext);
  if (!context) {
    throw new Error('useFabricContext must be used within a FabricProvider');
  }
  return context;
};
