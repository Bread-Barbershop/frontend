import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import type { BulkData, EditorBlock } from '@/shared/types/block';
import { createDefaultProps } from '@/shared/utils/createDefaultProps';

import { INVITATION_TEMPLATES } from './catalog';

import type {
  InvitationTemplate,
  InvitationTemplateType,
  PosterElement,
  PosterTextElement,
  PreparedInvitationTemplate,
} from './types';
import type { JSONContent } from '@tiptap/core';

const FABRIC_VERSION = '7.1.0';

const GALLERY_VARIANTS: Record<string, string> = {
  'wedding-classic-letter': 'galleryType1',
  'wedding-green-editorial': 'galleryType6',
  'wedding-rose-ceremony': 'galleryType5',
  'first-birthday-little-sunshine': 'galleryType3',
  'first-birthday-first-year-story': 'galleryType7',
  'first-birthday-peach-bloom': 'galleryType4',
  'birthday-lilac-memory': 'galleryType6',
};

const CALENDAR_VARIANTS: Record<string, string> = {
  'wedding-classic-letter': 'calendarType1',
  'wedding-green-editorial': 'calendarType2',
  'wedding-rose-ceremony': 'calendarType3',
  'first-birthday-little-sunshine': 'calendarType4',
  'first-birthday-first-year-story': 'calendarType5',
  'first-birthday-peach-bloom': 'calendarType2',
  'birthday-color-pop-party': 'calendarType3',
  'birthday-lilac-memory': 'calendarType4',
  'birthday-cozy-dinner': 'calendarType1',
  'seminar-focus-conference': 'calendarType2',
  'seminar-green-network': 'calendarType3',
  'seminar-creative-workshop': 'calendarType5',
};

const TITLE_FONTS: Record<string, string> = {
  'wedding-classic-letter': 'Hahmlet',
  'wedding-green-editorial': 'SUIT',
  'wedding-rose-ceremony': 'Hahmlet',
  'first-birthday-little-sunshine': 'LINESeedKR',
  'first-birthday-first-year-story': '고운 바탕',
  'first-birthday-peach-bloom': 'SUIT',
  'birthday-color-pop-party': 'SUIT',
  'birthday-lilac-memory': 'LINESeedKR',
  'birthday-cozy-dinner': 'Hahmlet',
  'seminar-focus-conference': 'SUIT',
  'seminar-green-network': 'SUIT',
  'seminar-creative-workshop': 'SUIT',
};

const GREETING_COPY: Record<InvitationTemplateType, string> = {
  wedding:
    '서로의 삶을 따뜻하게 보듬으며 새로운 시작을 함께하려 합니다.\n기쁜 날에 함께해 주시면 감사하겠습니다.',
  firstBirthday:
    '아이의 첫 번째 생일을 맞아 늘 사랑을 보내주신 분들과 기쁨을 나누고 싶습니다.\n함께 축하해 주세요.',
  birthday:
    '소중한 하루를 함께 보내고 싶습니다.\n편안한 마음으로 오셔서 즐거운 시간을 나눠 주세요.',
  seminar:
    '배움과 대화가 이어지는 자리에 여러분을 초대합니다.\n함께 생각을 나눠 주세요.',
};

const TIMELINE_TITLES: Record<string, string[]> = {
  'wedding-classic-letter': ['예식', '축하 인사', '피로연'],
  'wedding-green-editorial': ['예식', '축하 인사', '피로연'],
  'wedding-rose-ceremony': ['예식', '축하 인사', '피로연'],
  'first-birthday-little-sunshine': ['환영', '성장 기록', '돌잡이'],
  'first-birthday-first-year-story': ['환영', '성장 기록', '돌잡이'],
  'first-birthday-peach-bloom': ['환영', '성장 기록', '돌잡이'],
  'birthday-color-pop-party': ['환영', '생일 축하', '함께하는 시간'],
  'birthday-lilac-memory': ['환영', '생일 축하', '함께하는 시간'],
  'birthday-cozy-dinner': ['환영', '생일 축하', '함께하는 시간'],
  'seminar-focus-conference': ['등록', '오프닝', '주제 발표', '질의응답'],
  'seminar-green-network': ['소개', '대화', '네트워킹'],
  'seminar-creative-workshop': ['주제 소개', '실습', '결과 공유'],
};

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

function createGreetingJson(type: InvitationTemplateType): JSONContent {
  return {
    type: 'doc',
    content: GREETING_COPY[type].split('\n').map(text => ({
      type: 'paragraph',
      content: [{ type: 'text', text }],
    })),
  };
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(item => cloneValue(item)) as T;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneValue(item)])
    ) as T;
  }
  return value;
}

function createBlocks(template: InvitationTemplate): EditorBlock[] {
  return template.blockTypes.map(component => {
    const props = cloneValue(
      createDefaultProps(component, template.type)
    ) as Record<string, unknown>;

    if (component === 'greeting') {
      const messageJson = createGreetingJson(template.type);
      props.messageJson = messageJson;
      props.messageHtml = tiptapJsonToHtmlUniversal(messageJson);
    }

    if (component === 'gallery') {
      props.images = [];
      props.template = GALLERY_VARIANTS[template.id] ?? 'galleryType1';
      props.isAutoPlay = false;
    }

    if (component === 'calendar') {
      props.date = '';
      props.time = '';
      props.template = CALENDAR_VARIANTS[template.id] ?? 'calendarType1';
      props.showCalendar = true;
      props.showDday = false;
      props.messageJson = null;
      props.messageHtml = null;
    }

    if (component === 'myChild') {
      props.name = '';
      props.nickname = '';
      props.birthday = '';
      props.image = [];
    }

    if (component === 'coupleIntroduction') {
      props.groom = '';
      props.bride = '';
      props.groomImage = { id: createUuid(), image: [] };
      props.brideImage = { id: createUuid(), image: [] };
    }

    if (component === 'place') {
      props.placeName = '';
      props.placeDetail = '';
      props.placeAddress = '';
      props.placeTel = '';
      props.lng = 0;
      props.lat = 0;
    }

    if (component === 'divider') {
      props.color = template.colors.accent;
    }

    if (component === 'speakerInformation') {
      props.speakers = [
        {
          id: createUuid(),
          name: '',
          messageJson: null,
          messageHtml: null,
          image: [],
        },
      ];
    }

    if (component === 'notice') {
      props.noticeList = [];
    }

    if (component === 'timeline') {
      props.items = (TIMELINE_TITLES[template.id] ?? []).map(title => ({
        id: createUuid(),
        time: '',
        title,
        description: '',
      }));
    }

    if (component === 'transportation') {
      props.subwayLine = '';
      props.subwayStation = '';
      props.subwayExit = '';
      props.subwayWalk = '';
      props.busRoutes = '';
      props.shuttleStop = '';
      props.shuttleInterval = '';
      props.parkingHours = '';
      props.alternativeParking = '';
      props.navigationUrl = '';
    }

    if (component === 'rsvp') {
      props.formUrl = '';
    }

    if (component === 'dressCode') {
      props.guidelines = [];
      props.colors = [
        template.colors.background,
        template.colors.accent,
        template.colors.text,
      ];
    }

    return {
      id: createUuid(),
      type: template.type,
      component,
      props,
    } as unknown as EditorBlock;
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
    y1: -height / 2,
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

function createBulkData(
  font: string,
  fontSize: string,
  fontWeight: string,
  color: string
): BulkData {
  return {
    font,
    fontSize,
    fontWeight,
    color,
    isDefault: false,
  };
}

export function createInvitationTemplate(
  id: string
): PreparedInvitationTemplate {
  const template = INVITATION_TEMPLATES.find(item => item.id === id);
  if (!template) {
    throw new Error(`Invitation template not found: ${id}`);
  }

  const titleFont = TITLE_FONTS[template.id] ?? 'SUIT';
  const bodyFont = 'SUIT';
  const titleFontWeight =
    template.type === 'wedding'
      ? '500'
      : template.id === 'first-birthday-first-year-story'
        ? '400'
        : '700';

  return {
    blocks: createBlocks(template),
    backgroundColor: template.colors.background,
    titleData: createBulkData(
      titleFont,
      '22px',
      titleFontWeight,
      template.colors.accent
    ),
    bodyData: createBulkData(bodyFont, '14px', '400', template.colors.text),
    posterJson: createPosterJson(template),
  };
}
