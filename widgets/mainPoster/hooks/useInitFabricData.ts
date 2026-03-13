import { useEffect } from 'react';

import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

export const useInitFabricData = () => {
  const { canvas, initialData } = useFabricContext();

  useEffect(() => {
    if (!canvas || !initialData) return;

    const loadData = async () => {
      try {
        await canvas.loadFromJSON(initialData);
        canvas.requestRenderAll();
      } catch (error) {
        console.error('Failed to load canvas data:', error);
      }
    };

    loadData();
  }, [canvas, initialData]);
};
