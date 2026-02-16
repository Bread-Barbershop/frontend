/**
 * 초 단위 시간을 `mm:ss` 형식 문자열로 변환한다.
 */
export const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '00:00';
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};
