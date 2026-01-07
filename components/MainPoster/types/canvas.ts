export type ShapeType = 'text' | 'image';

export interface BaseShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface TextShape extends BaseShape {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  width?: number;
  height?: number;
  lineHeight?: number;
  wrap?: string;
  letterSpacing?: number;
}

export interface ImageShape extends BaseShape {
  type: 'image';
  src: string;
  width: number;
  height: number;
}

export interface TextBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Shape = TextShape | ImageShape;

// Shape 업데이트를 위한 타입 (id와 type은 변경 불가)
export type ShapeUpdate = Partial<Omit<TextShape, 'id' | 'type'>> &
  Partial<Omit<ImageShape, 'id' | 'type'>>;
