export type ShapeType = 'image' | 'text';

export interface BaseShape {
  id: string;
  type: ShapeType;
  left: number;
  top: number;
  originX?: 'left' | 'center' | 'right';
  originY?: 'top' | 'center' | 'bottom';

  // --- 트랜스포머(조절 핸들) 커스텀 스타일 ---
  cornerColor?: string; // 핸들 색상
  cornerStyle?: 'rect' | 'circle'; // 원형 핸들
  cornerSize?: number; // 핸들 크기
  transparentCorners?: boolean; // 핸들 내부 채우기
  borderColor?: string; // 선택 테두리 색상
  borderDashArray?: number[]; // 테두리 점선 효과
  padding?: number; // 컨텐츠와 테두리 사이 여백
}

/**
 * 필터에 사용할 옵션 인터페이스
 */
export interface PhotoPresetOptions {
  exposure?: number;
  contrast?: number;
  saturation?: number;
  temperature?: number;
  tint?: number;
  fade?: number;
  vignette?: number;
  grain?: number;
  bw?: number;
}

export interface Image extends BaseShape {
  type: 'image';
  src: string;
  width: number;
  height: number;
  filters?: PhotoPresetOptions;
}

export interface Text extends BaseShape {
  type: 'text';
  text: string;
  width?: number;
  height?: number;
  fontSize?: number;
  fill?: string;
}

export interface TextBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Shape = Image | Text;

// Shape 업데이트를 위한 타입 (id와 type은 변경 불가)
export type ShapeUpdate = Partial<Omit<Image, 'id' | 'type'>> &
  Partial<Omit<Text, 'id' | 'type'>>;

export interface LayoutStyle {
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  charSpacing?: number;
}

export interface AllStyle {
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic';
  fontWeight?: string | number;
  fontSize?: number;
  linethrough?: boolean;
  overline?: boolean;
  underline?: boolean;
  textBackgroundColor?: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
}

export type RichStyle = LayoutStyle | AllStyle;
