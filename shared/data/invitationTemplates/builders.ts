import type { EditorBlock } from '@/shared/types/block';

import { buildShowcaseInvitation } from '../buildShowcaseInvitation';
import { getShowcaseInvitation } from '../showcaseInvitations';

import { INVITATION_TEMPLATES } from './catalog';

import type {
  PosterElement,
  PosterTextElement,
  PreparedInvitationTemplate,
  InvitationTemplate,
} from './types';
const FABRIC_VERSION = '7.1.0';
function createUuid(): string {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function commonFabricProps(id: string) {
  return {
    id,
    originX: 'left',
    originY: 'top',
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    visible: true,
    selectable: true,
    evented: true,
    objectCaching: false,
    skewX: 0,
    skewY: 0,
  };
}

function textElementToFabric(element: PosterTextElement) {
  const fontSize = element.fontSize;
  const object: Record<string, unknown> = {
    ...commonFabricProps(createUuid()),
    type: 'textbox',
    left: element.x,
    top: element.y,
    width: element.width,
    text: element.text,
    fontFamily: element.fontFamily,
    fontSize,
    fontWeight: element.fontWeight ?? '400',
    textAlign: element.textAlign ?? 'center',
    lineHeight: element.lineHeight ?? 1.16,
    charSpacing: element.letterSpacing
      ? Math.round((element.letterSpacing / fontSize) * 1000)
      : 0,
    fill: element.fill ?? '#000000',
    stroke: element.stroke ?? null,
    strokeWidth: element.strokeWidth ?? 0,
    editable: true,
  };

  if (element.height !== undefined) object.height = element.height;
  return object;
}

function rectElementToFabric(
  element: Extract<PosterElement, { kind: 'rect' }>
) {
  const id = createUuid();
  const object: Record<string, unknown> = {
    ...commonFabricProps(id),
    type: 'rect',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    fill: element.fill ?? 'transparent',
    stroke: element.photoSlot ? null : (element.stroke ?? null),
    strokeWidth: element.photoSlot ? 0 : (element.strokeWidth ?? 0),
    rx: 0,
    ry: 0,
  };

  if (element.photoSlot) {
    object.name = 'slot-placeholder';
    object.slot = {
      key: createUuid(),
      label: '표지 사진',
      replaceable: true,
      aspectMode: 'cover',
      required: false,
      order: 1,
      filled: false,
    };
  }

  return object;
}

function circleElementToFabric(
  element: Extract<PosterElement, { kind: 'circle' }>
) {
  return {
    ...commonFabricProps(createUuid()),
    type: 'circle',
    left: element.x,
    top: element.y,
    radius: element.width / 2,
    fill: element.fill ?? 'transparent',
    stroke: element.stroke ?? null,
    strokeWidth: element.strokeWidth ?? 0,
    startAngle: 0,
    endAngle: 360,
  };
}

function lineElementToFabric(
  element: Extract<PosterElement, { kind: 'line' }>
) {
  const height = element.height;
  return {
    ...commonFabricProps(createUuid()),
    type: 'line',
    left: element.x + element.width / 2,
    top: element.y + height / 2,
    originX: 'center',
    originY: 'center',
    x1: -element.width / 2,
    y1: height === 0 ? 0 : -height / 2,
    x2: element.width / 2,
    y2: height / 2,
    width: element.width,
    height,
    fill: null,
    stroke: element.stroke,
    strokeWidth: element.strokeWidth ?? 1,
    strokeLineCap: 'butt',
    strokeLineJoin: 'miter',
    strokeDashArray: null,
  };
}

function posterElementToFabric(element: PosterElement) {
  switch (element.kind) {
    case 'text':
      return textElementToFabric(element);
    case 'rect':
      return rectElementToFabric(element);
    case 'circle':
      return circleElementToFabric(element);
    case 'line':
      return lineElementToFabric(element);
    case 'image': {
      const scale = Math.max(
        element.width / element.sourceWidth,
        element.height / element.sourceHeight
      );
      const width = element.width / scale;
      const height = element.height / scale;
      return {
        ...commonFabricProps(createUuid()),
        type: 'image',
        src: element.src,
        crossOrigin: 'anonymous',
        left: element.x,
        top: element.y,
        width,
        height,
        scaleX: scale,
        scaleY: scale,
        cropX: (element.sourceWidth - width) / 2,
        cropY: (element.sourceHeight - height) / 2,
        // Uses the editor's existing photograph replacement controls.
        slot: {
          key: createUuid(),
          label: '표지 사진',
          replaceable: true,
          aspectMode: 'cover',
          required: false,
          order: 1,
          filled: true,
        },
      };
    }
  }
}

function createPosterJson(template: InvitationTemplate) {
  return {
    version: FABRIC_VERSION,
    width: template.poster.width,
    height: template.poster.height,
    background: template.poster.background,
    objects: template.poster.objects.map(posterElementToFabric),
  };
}

export function createInvitationTemplate(
  id: string
): PreparedInvitationTemplate {
  const template = INVITATION_TEMPLATES.find(item => item.id === id);
  if (!template) throw new Error('Unknown template: ' + id);
  const design = getShowcaseInvitation(id);
  if (design) {
    const { blocks, bulkData } = buildShowcaseInvitation(design);
    const renewIds = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(renewIds);
      if (!value || typeof value !== 'object') return value;
      return Object.fromEntries(
        Object.entries(value).map(([key, child]) => [
          key,
          key === 'id' ? createUuid() : renewIds(child),
        ])
      );
    };
    return {
      blocks: renewIds(blocks) as EditorBlock[],
      backgroundColor: bulkData.backgroundColor,
      sectionStyle: bulkData.sectionStyle,
      titleData: bulkData.titleData,
      bodyData: bulkData.bodyData,
      posterJson: createPosterJson(template),
    };
  }

  throw new Error('Invitation design not found: ' + id);
}
