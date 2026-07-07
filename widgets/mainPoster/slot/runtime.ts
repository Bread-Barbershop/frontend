import type { Canvas, FabricImage, FabricObject, Point, Rect } from 'fabric';

type SlotPlaceholderRuntimeState = {
  baseRender?: (ctx: CanvasRenderingContext2D) => void;
  modifiedHandler?: () => void;
};

type SlotImageRuntimeState = {
  movingHandler?: () => void;
  scalingHandler?: () => void;
  rotatingHandler?: () => void;
  modifiedHandler?: () => void;
  isSyncingTransform?: boolean;
  lastTransformMode?: 'move' | 'resize' | 'rotate';
  originalContainsPoint?: FabricObject['containsPoint'];
};

type SlotCanvasRuntimeState = {
  originalPointIsInObjectSelectionArea?: (obj: FabricObject, point: Point) => boolean;
};

const slotPlaceholderRuntime = new WeakMap<Rect, SlotPlaceholderRuntimeState>();
const slotImageRuntime = new WeakMap<FabricImage, SlotImageRuntimeState>();
const slotCanvasRuntime = new WeakMap<Canvas, SlotCanvasRuntimeState>();

export const getSlotPlaceholderRuntime = (rect: Rect) =>
  slotPlaceholderRuntime.get(rect);

export const ensureSlotPlaceholderRuntime = (rect: Rect) => {
  let runtime = slotPlaceholderRuntime.get(rect);
  if (!runtime) {
    runtime = {};
    slotPlaceholderRuntime.set(rect, runtime);
  }
  return runtime;
};

export const clearSlotPlaceholderRuntime = (rect: Rect) => {
  slotPlaceholderRuntime.delete(rect);
};

export const getSlotImageRuntime = (image: FabricImage) =>
  slotImageRuntime.get(image);

export const ensureSlotImageRuntime = (image: FabricImage) => {
  let runtime = slotImageRuntime.get(image);
  if (!runtime) {
    runtime = {};
    slotImageRuntime.set(image, runtime);
  }
  return runtime;
};

export const clearSlotImageRuntime = (image: FabricImage) => {
  slotImageRuntime.delete(image);
};

export const getSlotCanvasRuntime = (canvas: Canvas) =>
  slotCanvasRuntime.get(canvas);

export const ensureSlotCanvasRuntime = (canvas: Canvas) => {
  let runtime = slotCanvasRuntime.get(canvas);
  if (!runtime) {
    runtime = {};
    slotCanvasRuntime.set(canvas, runtime);
  }
  return runtime;
};

export const clearSlotCanvasRuntime = (canvas: Canvas) => {
  slotCanvasRuntime.delete(canvas);
};

