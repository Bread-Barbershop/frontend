import { EditorBlock } from '../types/block';

export function extractFileGroups(
  block: EditorBlock[],
  imageList: { id: string; file: any }[]
) {
  console.log(imageList);
  console.log(block);
  if (!block || !imageList || imageList.length === 0) return;

  // 빠른 조회를 위해 imageList를 Map으로 변환
  const imageMap = new Map(imageList.map(item => [item.id, item]));

  const isFile = (v: unknown): v is File => v instanceof File;
  const isFileArr = (v: unknown): v is File[] =>
    Array.isArray(v) && v.length > 0 && v.every(isFile);

  function traverse(obj: any) {
    if (!obj || typeof obj !== 'object') return;

    // 배열인 경우 각 요소를 탐색
    if (Array.isArray(obj)) {
      obj.forEach(traverse);
      return;
    }

    // id가 있고 imageList에 존재하는 경우
    const id = obj.id;
    if (id && imageMap.has(id)) {
      const target = imageMap.get(id)!;

      // 1. 같은 레벨에서 File 또는 File[] 찾기
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'id') continue;
        if (isFile(value) || isFileArr(value)) {
          target.file = value;
          break;
        }
      }

      // 2. EditorBlock의 경우 props 내부에서도 확인
      if (obj.props && typeof obj.props === 'object') {
        for (const [_, value] of Object.entries(obj.props)) {
          if (isFile(value) || isFileArr(value)) {
            target.file = value;
            break;
          }
        }
      }
    }

    // 모든 속성에 대해 재귀적으로 탐색 (File 객체는 제외)
    for (const key in obj) {
      const value = obj[key];
      if (
        key !== 'id' &&
        value &&
        typeof value === 'object' &&
        !(value instanceof File)
      ) {
        traverse(value);
      }
    }
  }

  traverse(block);
  return imageMap;
}
