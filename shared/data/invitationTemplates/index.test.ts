import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { normalizeGuestBlock } from '@/app/guest/[id]/validation/normalizeGuestBlock';
import { parseGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';
import { buildShowcaseInvitation } from '../buildShowcaseInvitation';
import { SHOWCASE_INVITATIONS } from '../showcaseInvitations';

import {
  createInvitationTemplate,
  getInvitationTemplates,
  INVITATION_TEMPLATES,
} from './index';

describe('홈과 편집기가 공유하는 초대장 컬렉션', () => {
  it('홈의 23개 디자인을 실제 제작 가능한 카테고리별 템플릿으로 제공한다', () => {
    expect(INVITATION_TEMPLATES.map(item => item.id)).toEqual(
      SHOWCASE_INVITATIONS.map(item => item.id)
    );
    expect(getInvitationTemplates('wedding')).toHaveLength(12);
    expect(getInvitationTemplates('seminar')).toHaveLength(5);
    expect(getInvitationTemplates('birthday')).toHaveLength(4);
    expect(getInvitationTemplates('firstBirthday')).toHaveLength(2);
    expect(
      new Set(
        INVITATION_TEMPLATES.map(item => JSON.stringify(item.poster.objects))
      ).size
    ).toBe(23);
  });

  it.each(SHOWCASE_INVITATIONS)(
    '$name의 미리보기와 편집기에 같은 내용과 테마를 적용하고 저장 후 복원한다',
    design => {
      const preview = buildShowcaseInvitation(design);
      const editor = createInvitationTemplate(design.id);
      expect(editor.backgroundColor).toBe(preview.bulkData.backgroundColor);
      expect(editor.titleData).toEqual(preview.bulkData.titleData);
      expect(editor.bodyData).toEqual(preview.bulkData.bodyData);
      expect(editor.blocks.map(block => block.component)).toEqual(
        preview.blocks.map(block => block.component)
      );
      expect(
        editor.blocks.find(block => block.component === 'greeting')?.props
          .messageHtml
      ).toBe(
        preview.blocks.find(block => block.component === 'greeting')?.props
          .messageHtml
      );
      const saved = JSON.parse(JSON.stringify(editor));
      saved.blocks.forEach((block: unknown, index: number) => {
        const normalized = normalizeGuestBlock(block, index);
        expect(normalized.ok).toBe(true);
        if (normalized.ok)
          expect(normalized.block.props.collectionStyle).toBe(design.id);
      });
      expect(saved.posterJson).toEqual(editor.posterJson);
      const guest = parseGuestPayload({
        blocks: saved.blocks,
        mainPoster: saved.posterJson,
        bulkData: {
          backgroundColor: saved.backgroundColor,
          titleData: saved.titleData,
          bodyData: saved.bodyData,
          isZoom: false,
        },
        bgm: {
          selectedBgmId: null,
          isLoop: false,
          volume: 0.5,
          userBgmTitle: null,
          userBgmDuration: null,
          userBgmFileId: null,
        },
      });
      expect(guest.ok).toBe(true);
      if (guest.ok) {
        expect(guest.warnings).toEqual([]);
        expect(guest.payload.blocks).toHaveLength(editor.blocks.length);
        expect(guest.payload.mainPoster.objects).toEqual(
          saved.posterJson.objects
        );
      }
    }
  );

  it('재적용할 때 블록과 중첩 이미지·타임라인 ID를 새로 만들어 이전 편집 내용과 충돌하지 않는다', () => {
    for (const design of SHOWCASE_INVITATIONS) {
      const a = createInvitationTemplate(design.id);
      const b = createInvitationTemplate(design.id);
      const ids = (value: unknown): string[] => {
        if (Array.isArray(value)) return value.flatMap(ids);
        if (!value || typeof value !== 'object') return [];
        return Object.entries(value).flatMap(([key, child]) =>
          key === 'id' ? [String(child)] : ids(child)
        );
      };
      const first = ids(a);
      expect(first.length).toBeGreaterThan(10);
      expect(new Set(first).size).toBe(first.length);
      expect(first.every(id => !ids(b).includes(id))).toBe(true);
    }
  });

  it('완성 포스터를 사진 한 장으로 굳히지 않고 수정 가능한 글자와 로컬 사진으로 구성한다', () => {
    for (const template of INVITATION_TEMPLATES) {
      const prepared = createInvitationTemplate(template.id);
      const objects = prepared.posterJson.objects as Record<string, unknown>[];
      expect(
        objects.filter(object => object.type === 'textbox').length
      ).toBeGreaterThanOrEqual(3);
      expect(
        objects
          .filter(object => object.type === 'textbox')
          .every(object => object.editable)
      ).toBe(true);
      objects
        .filter(object => object.type === 'image')
        .forEach(object => {
          expect(
            existsSync(join(process.cwd(), 'public', String(object.src)))
          ).toBe(true);
          expect(object.slot).toMatchObject({
            replaceable: true,
            filled: true,
          });
          expect(object.scaleX).toBe(object.scaleY);
          expect(Number(object.cropX)).toBeGreaterThanOrEqual(0);
        });
    }
  });

  it('유효하지 않은 템플릿으로 빈 편집기를 만들지 않는다', () => {
    expect(() => createInvitationTemplate('unknown-template')).toThrow(
      'Unknown template'
    );
  });
});
