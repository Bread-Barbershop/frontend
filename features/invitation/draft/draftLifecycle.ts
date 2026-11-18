let activeFlusher: (() => Promise<void>) | null = null;
export function registerDraftFlusher(flush: () => Promise<void>) {
  activeFlusher = flush;
  return () => {
    if (activeFlusher === flush) activeFlusher = null;
  };
}
export async function flushActiveDraft() {
  await activeFlusher?.();
}
