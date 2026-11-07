import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { normalizeTimelineItems } from '@/components/organisms/timeline/timelineItems';
import { componentCls } from '@/shared/data/componentsInfo/componentInfo';
import { blockRegistry } from '@/shared/data/registry/registry';

import {
  createInvitationTemplate,
  getInvitationTemplates,
  INVITATION_TEMPLATES,
} from './index';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('초대장 템플릿 카탈로그', () => {
  it('유형마다 세 개의 고유 템플릿을 제공한다', () => {
    expect(INVITATION_TEMPLATES).toHaveLength(12);
    expect(
      new Set(INVITATION_TEMPLATES.map(template => template.id)).size
    ).toBe(12);

    for (const type of [
      'wedding',
      'firstBirthday',
      'birthday',
      'seminar',
    ] as const) {
      expect(getInvitationTemplates(type)).toHaveLength(3);
    }
  });

  it('모든 템플릿이 블록 스키마의 필수 필드를 채운다', () => {
    for (const template of INVITATION_TEMPLATES) {
      const prepared = createInvitationTemplate(template.id);

      for (const block of prepared.blocks) {
        const props = block.props as unknown as Record<string, unknown>;
        const fields = blockRegistry[block.component].fields as Record<
          string,
          { required: boolean }
        >;

        for (const [fieldName, field] of Object.entries(fields)) {
          if (field.required) {
            expect(props[fieldName]).toBeDefined();
          }
        }
      }
    }
  });

  it('템플릿의 모든 페이지를 해당 분류에서 편집 가능한 이름으로 찾을 수 있다', () => {
    for (const template of INVITATION_TEMPLATES) {
      const category = componentCls.find(
        item => item.english === template.type
      );

      expect(category).toBeDefined();
      for (const blockType of template.blockTypes) {
        const block = category?.list.find(item => item.component === blockType);
        expect(block?.contents).toBeTruthy();
      }
    }
  });

  it('각 호출에 새 블록, poster 객체, 중첩 상태와 UUID를 만든다', () => {
    for (const template of INVITATION_TEMPLATES) {
      const first = createInvitationTemplate(template.id);
      const second = createInvitationTemplate(template.id);

      expect(first.blocks).not.toBe(second.blocks);
      expect(first.blocks[0]).not.toBe(second.blocks[0]);
      expect(first.blocks[0].props).not.toBe(second.blocks[0].props);
      expect(first.titleData).not.toBe(second.titleData);
      expect(first.bodyData).not.toBe(second.bodyData);

      const firstIds = first.blocks.map(block => block.id);
      const secondIds = second.blocks.map(block => block.id);
      expect(new Set(firstIds).size).toBe(firstIds.length);
      expect(firstIds.every(id => UUID_PATTERN.test(id))).toBe(true);
      expect(firstIds.some(id => secondIds.includes(id))).toBe(false);

      const firstObjects = first.posterJson.objects as Record<
        string,
        unknown
      >[];
      const secondObjects = second.posterJson.objects as Record<
        string,
        unknown
      >[];
      expect(firstObjects).not.toBe(secondObjects);
      expect(firstObjects[0]).toMatchObject({
        id: 'background-layer',
        type: 'rect',
        left: 0,
        top: 0,
        width: 375,
        height: 812,
        fill: template.poster.background,
      });

      const firstObjectIds = firstObjects
        .slice(1)
        .map(object => object.id as string);
      const secondObjectIds = secondObjects
        .slice(1)
        .map(object => object.id as string);
      expect(firstObjectIds.every(id => UUID_PATTERN.test(id))).toBe(true);
      expect(firstObjectIds.some(id => secondObjectIds.includes(id))).toBe(
        false
      );

      const firstSlot = firstObjects.find(
        object => object.name === 'slot-placeholder'
      );
      const secondSlot = secondObjects.find(
        object => object.name === 'slot-placeholder'
      );
      if (firstSlot && secondSlot) {
        expect(firstSlot.id).not.toBe(secondSlot.id);
        expect(firstSlot.slot).toMatchObject({
          label: '표지 사진',
          replaceable: true,
          aspectMode: 'cover',
          required: false,
          order: 1,
          filled: false,
        });
        expect((firstSlot.slot as { key: string }).key).not.toBe(
          (secondSlot.slot as { key: string }).key
        );
      }

      for (const firstBlock of first.blocks) {
        const secondBlock = second.blocks.find(
          block => block.component === firstBlock.component
        );
        if (!secondBlock) continue;

        const firstProps = firstBlock.props as unknown as Record<
          string,
          unknown
        >;
        const secondProps = secondBlock.props as unknown as Record<
          string,
          unknown
        >;
        if (firstBlock.component === 'timeline') {
          const firstItems = firstProps.items as { id: string }[];
          const secondItems = secondProps.items as { id: string }[];
          expect(firstItems.map(item => item.id)).not.toEqual(
            secondItems.map(item => item.id)
          );
        }
        if (firstBlock.component === 'speakerInformation') {
          const firstSpeakers = firstProps.speakers as { id: string }[];
          const secondSpeakers = secondProps.speakers as { id: string }[];
          expect(firstSpeakers[0].id).not.toBe(secondSpeakers[0].id);
        }
        if (firstBlock.component === 'coupleIntroduction') {
          const firstGroom = firstProps.groomImage as { id: string };
          const secondGroom = secondProps.groomImage as { id: string };
          expect(firstGroom.id).not.toBe(secondGroom.id);
        }
      }
    }
  });

  it('날짜, 이미지, 개인 정보를 비운 상태로 편집 블록을 준비한다', () => {
    for (const template of INVITATION_TEMPLATES) {
      const prepared = createInvitationTemplate(template.id);

      for (const block of prepared.blocks) {
        const props = block.props as unknown as Record<string, unknown>;

        if (block.component === 'calendar') {
          expect(props.date).toBe('');
          expect(props.time).toBe('');
        }
        if (block.component === 'gallery') {
          expect(props.images).toEqual([]);
        }
        if (block.component === 'myChild') {
          expect(props.name).toBe('');
          expect(props.nickname).toBe('');
          expect(props.birthday).toBe('');
          expect(props.image).toEqual([]);
        }
        if (block.component === 'coupleIntroduction') {
          expect(props.groom).toBe('');
          expect(props.bride).toBe('');
        }
        if (block.component === 'place') {
          expect(props.placeName).toBe('');
          expect(props.placeAddress).toBe('');
          expect(props.placeDetail).toBe('');
        }
        if (block.component === 'speakerInformation') {
          expect(props.speakers).toEqual([
            expect.objectContaining({ name: '', messageJson: null, image: [] }),
          ]);
        }
        if (block.component === 'notice') {
          expect(props.noticeList).toEqual([]);
        }
        if (block.component === 'timeline') {
          const items = props.items as {
            id: string;
            time: string;
            title: string;
            description: string;
          }[];
          expect(items.length).toBeGreaterThan(0);
          expect(items.every(item => item.time === '')).toBe(true);
          expect(items.every(item => item.description === '')).toBe(true);
          expect(items.every(item => UUID_PATTERN.test(item.id))).toBe(true);
          expect(normalizeTimelineItems(items)).toEqual(items);
        }
        if (block.component === 'rsvp') {
          expect(props.formUrl).toBe('');
        }
        if (block.component === 'transportation') {
          expect(props.navigationUrl).toBe('');
          expect(props.subwayLine).toBe('');
          expect(props.busRoutes).toBe('');
        }
      }
    }
  });

  it('인사말의 여러 문단을 HTML로 직렬화한다', () => {
    for (const template of INVITATION_TEMPLATES) {
      const greeting = createInvitationTemplate(template.id).blocks.find(
        block => block.component === 'greeting'
      );
      expect(greeting).toBeDefined();

      const props = greeting!.props as unknown as {
        messageJson: Parameters<typeof tiptapJsonToHtmlUniversal>[0];
        messageHtml: string;
      };
      expect(props.messageJson?.content).toHaveLength(2);
      expect(props.messageHtml).toMatch(/<\/p><p(?:\s|>)/);
      expect(props.messageHtml).toBe(
        tiptapJsonToHtmlUniversal(props.messageJson)
      );
    }
  });

  it('테마 색상과 제목 글꼴 설정을 bulk 데이터 및 블록 팔레트에 적용한다', () => {
    for (const template of INVITATION_TEMPLATES) {
      const prepared = createInvitationTemplate(template.id);
      expect(prepared.titleData).toMatchObject({
        color: template.colors.accent,
        fontSize: '22px',
      });
      expect(prepared.bodyData.color).toBe(template.colors.text);

      const divider = prepared.blocks.find(
        block => block.component === 'divider'
      );
      if (divider) {
        expect(divider.props.color).toBe(template.colors.accent);
      }

      const dressCode = prepared.blocks.find(
        block => block.component === 'dressCode'
      );
      if (dressCode) {
        expect(dressCode.props.colors).toEqual([
          template.colors.background,
          template.colors.accent,
          template.colors.text,
        ]);
      }
    }

    expect(
      createInvitationTemplate('wedding-classic-letter').titleData
    ).toMatchObject({
      font: 'Hahmlet',
      fontWeight: '500',
    });
    expect(
      createInvitationTemplate('first-birthday-first-year-story').titleData
    ).toMatchObject({
      font: '고운 바탕',
      fontWeight: '400',
    });
  });

  it('등록되지 않은 템플릿 ID는 오류를 던진다', () => {
    expect(() => createInvitationTemplate('unknown-template')).toThrow(
      'Invitation template not found: unknown-template'
    );
  });
});
