// Keep saved guestbook data compatible while its write model is unavailable.
export function isBlockEnabled(component: string): boolean {
  return component !== 'guestbook';
}
