export function extractFileGroups(data: {
  id: string;
  props: Record<string, any>;
}): Record<string, any>[] {
  const results: Record<string, any>[] = [];

  const isFile = (v: unknown): v is File => v instanceof File;
  const isFileArr = (v: unknown): v is File[] =>
    Array.isArray(v) && v.length > 0 && v.every(isFile);

  // 객체에서 File/File[] 필드만 추출
  function pickFiles(obj: Record<string, any>) {
    const out: Record<string, File | File[]> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'id') continue;
      if (isFile(v) || isFileArr(v)) out[k] = v;
    }
    return Object.keys(out).length ? out : null;
  }

  // props 직속 File → 최상위 id로 묶기
  const direct = pickFiles(data.props);
  if (direct) {
    results.push({ id: data.id, ...direct });
  }

  // 재귀 탐색
  function traverse(value: any, parentId: string | number) {
    if (value == null || typeof value !== 'object' || isFile(value)) return;

    if (Array.isArray(value)) {
      value.forEach(item => {
        if (typeof item === 'object' && item !== null && !isFile(item)) {
          const id = item.id ?? parentId;
          const files = pickFiles(item);
          if (files) results.push({ id, ...files });

          // 더 깊은 중첩 탐색
          Object.values(item).forEach(v => traverse(v, id));
        }
      });
    } else {
      Object.values(value).forEach(v => traverse(v, parentId));
    }
  }

  // props의 비-File 값들을 재귀 탐색
  for (const [, v] of Object.entries(data.props)) {
    if (!isFile(v) && !isFileArr(v)) traverse(v, data.id);
  }

  return results;
}
