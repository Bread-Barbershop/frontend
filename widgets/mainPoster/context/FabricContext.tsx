'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';

import { useFabric } from '../hooks/useFabric';
import { useFabricBackground } from '../hooks/useFabricBackground';
import { useFabricGraphic } from '../hooks/useFabricGraphic';
import { useFabricImage } from '../hooks/useFabricImage';
import { useFabricShape } from '../hooks/useFabricShape';
import { useFabricSlot } from '../hooks/useFabricSlot';
import { useFabricText } from '../hooks/useFabricText';
import { useTemplate } from '../hooks/useTemplate';

type FabricContextType = ReturnType<typeof useFabric> &
  ReturnType<typeof useFabricGraphic> &
  ReturnType<typeof useFabricImage> &
  ReturnType<typeof useFabricSlot> &
  ReturnType<typeof useFabricBackground> &
  ReturnType<typeof useFabricText> &
  ReturnType<typeof useFabricShape> &
  ReturnType<typeof useTemplate> & {
    initialData?: string;
    canUndo: boolean;
    canRedo: boolean;
    clipboard: any;
  };

type FabricViewContextType = Pick<
  FabricContextType,
  'canvas' | 'activeInfo' | 'canUndo' | 'canRedo' | 'clipboard' | 'initialData'
>;

type FabricActionsContextType = Omit<FabricContextType, keyof FabricViewContextType>;

const FabricViewContext = createContext<FabricViewContextType | null>(null);
const FabricActionsContext = createContext<FabricActionsContextType | null>(null);

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

  const fabricSlotValues = useFabricSlot({
    canvas: fabricValues.canvas,
    syncActiveObjectInfo: fabricValues.syncActiveObjectInfo,
    saveHistory: fabricValues.saveHistory,
  });

  const fabricBackgroundValues = useFabricBackground({
    canvas: fabricValues.canvas,
    saveHistory: fabricValues.saveHistory,
  });

  const fabricShapeValues = useFabricShape();

  const fabricTemplateValues = useTemplate({
    runHistoryTransaction: fabricValues.runHistoryTransaction,
  });

  const viewValue = useMemo(
    () => ({
      canvas: fabricValues.canvas,
      activeInfo: fabricValues.activeInfo,
      canUndo: fabricValues.canUndo,
      canRedo: fabricValues.canRedo,
      clipboard: fabricValues.clipboard,
      initialData,
    }),
    [
      fabricValues.canvas,
      fabricValues.activeInfo,
      fabricValues.canUndo,
      fabricValues.canRedo,
      fabricValues.clipboard,
      initialData,
    ]
  );

  const actionsValue = useMemo(
    () => ({
      setCanvas: fabricValues.setCanvas,
      isUpdating: fabricValues.isUpdating,
      isDeleting: fabricValues.isDeleting,
      setupEventListeners: fabricValues.setupEventListeners,
      syncActiveObjectInfo: fabricValues.syncActiveObjectInfo,
      handleDeleteShape: fabricValues.handleDeleteShape,
      handleDeleteEmptyShape: fabricValues.handleDeleteEmptyShape,
      copy: fabricValues.copy,
      paste: fabricValues.paste,
      redo: fabricValues.redo,
      undo: fabricValues.undo,
      moveUp: fabricValues.moveUp,
      moveDown: fabricValues.moveDown,
      moveTop: fabricValues.moveTop,
      moveBottom: fabricValues.moveBottom,
      lock: fabricValues.lock,
      unLock: fabricValues.unLock,
      saveHistory: fabricValues.saveHistory,
      runHistoryTransaction: fabricValues.runHistoryTransaction,
      exportIntersectedJSON: fabricValues.exportIntersectedJSON,
      exportCanvasPreview: fabricValues.exportCanvasPreview,
      ...fabricDiagramValues,
      ...fabricImageValues,
      ...fabricSlotValues,
      ...fabricTextValues,
      ...fabricBackgroundValues,
      ...fabricShapeValues,
      ...fabricTemplateValues,
    }),
    [
      fabricValues.setCanvas,
      fabricValues.isUpdating,
      fabricValues.isDeleting,
      fabricValues.setupEventListeners,
      fabricValues.syncActiveObjectInfo,
      fabricValues.handleDeleteShape,
      fabricValues.handleDeleteEmptyShape,
      fabricValues.copy,
      fabricValues.paste,
      fabricValues.redo,
      fabricValues.undo,
      fabricValues.moveUp,
      fabricValues.moveDown,
      fabricValues.moveTop,
      fabricValues.moveBottom,
      fabricValues.lock,
      fabricValues.unLock,
      fabricValues.saveHistory,
      fabricValues.runHistoryTransaction,
      fabricValues.exportIntersectedJSON,
      fabricValues.exportCanvasPreview,
      fabricDiagramValues,
      fabricImageValues,
      fabricSlotValues,
      fabricTextValues,
      fabricBackgroundValues,
      fabricShapeValues,
      fabricTemplateValues,
    ]
  );

  return (
    <FabricViewContext.Provider value={viewValue}>
      <FabricActionsContext.Provider value={actionsValue}>
        {children}
      </FabricActionsContext.Provider>
    </FabricViewContext.Provider>
  );
};

export const useFabricViewContext = () => {
  const context = useContext(FabricViewContext);
  if (!context) {
    throw new Error('useFabricViewContext must be used within a FabricProvider');
  }
  return context;
};

export const useFabricActionsContext = () => {
  const context = useContext(FabricActionsContext);
  if (!context) {
    throw new Error(
      'useFabricActionsContext must be used within a FabricProvider'
    );
  }
  return context;
};

export const useFabricContext = () => ({
  ...useFabricViewContext(),
  ...useFabricActionsContext(),
});
