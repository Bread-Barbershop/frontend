'use client';
import { Canvas } from 'fabric';
import { createContext, ReactNode, useContext, useRef } from 'react';

type FabricContextType = {
  saveHistory: () => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
};

const FabricContext = createContext<FabricContextType | null>(null);

export const FabricProvider = ({
  children,
  canvas,
}: {
  children: ReactNode;
  canvas: Canvas;
}) => {
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const isUpdating = useRef<boolean>(false);

  const saveHistory = () => {
    if (isUpdating.current) return;

    const json = JSON.stringify(canvas.toJSON());
    undoStack.current.push(json);

    if (redoStack.current.length > 0) {
      redoStack.current.length = 0;
    }
  };

  const undo = async () => {
    if (undoStack.current.length <= 1 || isUpdating.current) return;

    isUpdating.current = true;
    const current = undoStack.current.pop();
    if (current) redoStack.current.push(current);

    const prevState = undoStack.current[undoStack.current.length - 1];

    await canvas.loadFromJSON(prevState);
    canvas.requestRenderAll();
    isUpdating.current = false;
  };

  const redo = async () => {
    if (redoStack.current.length === 0 || isUpdating.current) return;

    isUpdating.current = true;
    const nextState = redoStack.current.pop();
    if (nextState) {
      undoStack.current.push(nextState);
      await canvas.loadFromJSON(nextState);
      canvas.requestRenderAll();
    }
    isUpdating.current = false;
  };
  return (
    <FabricContext.Provider value={{ saveHistory, undo, redo }}>
      {children}
    </FabricContext.Provider>
  );
};

export function useFabricState() {
  const context = useContext(FabricContext);
  if (!context) {
    throw new Error(
      'useFabricState는 <FabricContextProvider> 안에서 사용해야 합니다'
    );
  }
  return context;
}
