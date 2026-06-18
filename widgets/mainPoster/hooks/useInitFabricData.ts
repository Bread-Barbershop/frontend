import { useEffect } from 'react';

import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';
import { stabilizeCanvasAfterLoad } from '@/widgets/mainPoster/hooks/useTemplate';

export const useInitFabricData = () => {
  const { canvas, initialData, runHistoryTransaction } = useFabricContext();

  useEffect(() => {
    if (!canvas || !initialData) return;

    const loadData = async () => {
      try {
        await runHistoryTransaction(
          async () => {
            await canvas.loadFromJSON(initialData);
          },
          { save: true }
        );
        await document.fonts.ready;
        await stabilizeCanvasAfterLoad(canvas);
      } catch (error) {
        console.error('Failed to load canvas data:', error);
      }
    };

    loadData();
  }, [canvas, initialData, runHistoryTransaction]);
};
