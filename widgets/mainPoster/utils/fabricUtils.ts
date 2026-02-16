import { ICON_PATHS } from '../constants/fabric';

/**
 * SVG 문자열을 Data URL로 변환합니다.
 * utf8 인코딩을 사용하여 브라우저 호환성 및 Base64 인코딩 오류를 방지합니다.
 */
export const createSvgDataUrl = (svgString: string): string => {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
};

/**
 * Fabric 컨트롤에서 사용할 HTMLImageElement를 생성하고 로드합니다.
 */
export const createFabricControlImage = (
  svgString: string,
  onReady?: () => void
): HTMLImageElement => {
  const img = new Image();
  img.onload = () => {
    if (onReady) onReady();
  };
  img.src = createSvgDataUrl(svgString);
  return img;
};

/**
 * CanvasRenderingContext2D.drawImage를 안전하게 호출하기 위한 검사 함수입니다.
 * 이미지가 로드 완료되었고 'broken' 상태가 아닌지 확인합니다.
 */
export const isImageReadyForCanvas = (img: HTMLImageElement): boolean => {
  return img.complete && img.naturalWidth > 0;
};

/**
 * Fabric 컨트롤에서 사용할 HTMLImageElement를 생성하고 로드합니다.
 */
export const getRotatedCursorUrl = (angle: number) => {
  // 아이콘 크기(17x17)를 고려해 32x32 공간의 정중앙에 배치(7.5, 7.5 이동)하고 회전시킵니다.
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(${angle}, 16, 16) translate(7.5, 7.5)">
        ${ICON_PATHS}
      </g>
    </svg>
  `.trim();

  return `url('${createSvgDataUrl(svg)}') 16 16, auto`;
};
