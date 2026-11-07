import type { BulkData, EditorBlock, InvitationType } from '@/shared/types/block';
import type { BlockType } from '@/shared/types/editor';

export type InvitationTemplateType = Exclude<InvitationType, 'etc'>;

export type PosterTextElement = {
  kind: 'text';
  x: number;
  y: number;
  width: number;
  height?: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
};

export type PosterRectElement = {
  kind: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  photoSlot?: boolean;
};

export type PosterCircleElement = {
  kind: 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
};

export type PosterLineElement = {
  kind: 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  stroke: string;
  strokeWidth?: number;
};

export type PosterElement =
  | PosterTextElement
  | PosterRectElement
  | PosterCircleElement
  | PosterLineElement;

export type PosterDesign = {
  width: 375;
  height: 812;
  background: string;
  objects: PosterElement[];
};

export type InvitationTemplate = {
  id: string;
  type: InvitationTemplateType;
  name: string;
  eyebrow: string;
  description: string;
  tags: string[];
  colors: {
    background: string;
    accent: string;
    text: string;
  };
  poster: PosterDesign;
  blockTypes: BlockType[];
};

export type PreparedInvitationTemplate = {
  blocks: EditorBlock[];
  backgroundColor: string;
  titleData: BulkData;
  bodyData: BulkData;
  posterJson: Record<string, unknown>;
};
