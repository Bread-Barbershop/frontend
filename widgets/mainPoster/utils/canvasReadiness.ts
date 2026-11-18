const readyCanvases = new WeakSet<object>();
export function isCanvasInitialized(canvas: object) {
  return readyCanvases.has(canvas);
}
export function markCanvasInitialized(canvas: object) {
  readyCanvases.add(canvas);
  window.dispatchEvent(
    new CustomEvent('invia-canvas-ready', { detail: canvas })
  );
}
