import { useEffect } from 'react';

import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

export const useInitFabricData = () => {
  const { canvas, initialData } = useFabricContext();

  useEffect(() => {
    if (!canvas || !initialData) return;

    canvas.loadFromJSON(initialData).then(() => {
      canvas.renderAll();
    });
  }, [canvas, initialData]);
};
