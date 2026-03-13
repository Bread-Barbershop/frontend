/**
 * @param {Object} item - 서버에서 넘어온 이미지 객체 { name, mimeType, dataUrl }
 * @returns {File} - 브라우저용 File 객체
 */
export const blobToFile = async (item: {
  name: string;
  mimeType: string;
  dataUrl: string;
}) => {
  const res = await fetch(item.dataUrl);
  const blob = await res.blob();

  // 2. 변환된 Blob을 사용하여 File 객체 생성
  // (서버에서 준 이름과 타입을 그대로 사용)
  const file = new File([blob], item.name, { type: item.mimeType });

  return file;
};
