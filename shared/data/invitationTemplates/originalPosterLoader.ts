const ORIGINAL_POSTER_TIMEOUT_MS = 15_000;
const originalPosterRequests = new Map<
  string,
  Promise<Record<string, unknown>>
>();

function createUuid() {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

const cloneWithFreshFabricIds = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(cloneWithFreshFabricIds);
  if (!value || typeof value !== 'object') return value;

  const source = value as Record<string, unknown>;
  const originalId = typeof source.id === 'string' ? source.id : undefined;
  const nextId =
    originalId && originalId !== 'background-layer' ? createUuid() : originalId;
  const cloned: Record<string, unknown> = {};

  for (const [key, child] of Object.entries(source)) {
    if (key === 'id' && originalId) {
      cloned.id = nextId;
    } else if (key === 'slot' && child && typeof child === 'object') {
      const slot = child as Record<string, unknown>;
      const clonedSlot = cloneWithFreshFabricIds(slot) as Record<
        string,
        unknown
      >;
      if (typeof slot.key === 'string') {
        clonedSlot.key =
          slot.key === originalId && nextId ? nextId : createUuid();
      }
      cloned.slot = clonedSlot;
    } else {
      cloned[key] = cloneWithFreshFabricIds(child);
    }
  }

  return cloned;
};

export function renewOriginalPosterIds<T extends Record<string, unknown>>(
  posterJson: T
): T {
  const cloned = cloneWithFreshFabricIds(posterJson) as T;
  if (!Array.isArray(cloned.objects)) {
    throw new Error('Original invitation template has no Fabric objects.');
  }
  return cloned;
}

const fetchOriginalPoster = async (jsonUrl: string) => {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new Error('Original invitation template request timed out.'));
    }, ORIGINAL_POSTER_TIMEOUT_MS);
  });

  try {
    return await Promise.race([
      (async () => {
        const response = await fetch(jsonUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(
            `Original invitation template request failed: ${response.status}`
          );
        }
        const posterJson = (await response.json()) as Record<string, unknown>;
        if (!Array.isArray(posterJson.objects)) {
          throw new Error(
            'Original invitation template has no Fabric objects.'
          );
        }
        return posterJson;
      })(),
      timeoutPromise,
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};

export async function loadOriginalPosterJson(jsonUrl: string) {
  const cached = originalPosterRequests.get(jsonUrl);
  if (cached) return renewOriginalPosterIds(await cached);

  const request = fetchOriginalPoster(jsonUrl);
  originalPosterRequests.set(jsonUrl, request);

  try {
    return renewOriginalPosterIds(await request);
  } catch (error) {
    if (originalPosterRequests.get(jsonUrl) === request) {
      originalPosterRequests.delete(jsonUrl);
    }
    throw error;
  }
}
