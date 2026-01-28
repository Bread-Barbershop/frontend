import { ICON_PATHS } from './constants';

export const getRotatedCursorUrl = (angle: number) => {
  // 아이콘 크기(17x17)를 고려해 32x32 공간의 정중앙에 배치(7.5, 7.5 이동)하고 회전시킵니다.
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(${angle}, 16, 16) translate(7.5, 7.5)">
        ${ICON_PATHS}
      </g>
    </svg>
  `.trim();

  const base64 = window.btoa(unescape(encodeURIComponent(svg)));
  return `url('data:image/svg+xml;base64,${base64}') 16 16, auto`;
};
