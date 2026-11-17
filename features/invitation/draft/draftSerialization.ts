/** IndexedDB preserves blobs, but not custom File properties or object URLs. */
export async function packDraft(
  value: unknown,
  seen = new WeakMap<object, unknown>()
): Promise<unknown> {
  if (typeof value === 'string' && value.startsWith('blob:')) {
    const response = await fetch(value);
    if (!response.ok) throw new Error('사진 임시 파일을 읽지 못했습니다.');
    return { __inviaBlob: await response.blob() };
  }
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value);
  if (value instanceof File) {
    const packed = {
      __inviaFile: value,
      name: value.name,
      type: value.type,
      lastModified: value.lastModified,
      driveFileId: (value as File & { driveFileId?: string }).driveFileId,
    };
    seen.set(value, packed);
    return packed;
  }
  if (value instanceof Blob) return value;
  const packed: unknown[] | Record<string, unknown> = Array.isArray(value)
    ? []
    : {};
  seen.set(value, packed);
  for (const [key, item] of Object.entries(value)) {
    if (typeof item !== 'function')
      (packed as Record<string, unknown>)[key] = await packDraft(item, seen);
  }
  return packed;
}

export function unpackDraft<T>(
  value: unknown,
  objectUrls: string[],
  seen = new WeakMap<object, unknown>()
): T {
  if (!value || typeof value !== 'object') return value as T;
  if (seen.has(value)) return seen.get(value) as T;
  const entry = value as Record<string, unknown>;
  if (entry.__inviaFile instanceof Blob) {
    const file = new File([entry.__inviaFile], entry.name as string, {
      type: entry.type as string,
      lastModified: entry.lastModified as number,
    });
    if (entry.driveFileId)
      Object.defineProperty(file, 'driveFileId', {
        value: entry.driveFileId,
        configurable: true,
      });
    seen.set(value, file);
    return file as T;
  }
  if (entry.__inviaBlob instanceof Blob) {
    const url = URL.createObjectURL(entry.__inviaBlob);
    objectUrls.push(url);
    seen.set(value, url);
    return url as T;
  }
  if (value instanceof Blob) return value as T;
  const unpacked: unknown[] | Record<string, unknown> = Array.isArray(value)
    ? []
    : {};
  seen.set(value, unpacked);
  for (const [key, item] of Object.entries(value))
    (unpacked as Record<string, unknown>)[key] = unpackDraft(
      item,
      objectUrls,
      seen
    );
  return unpacked as T;
}
