import { existsSync } from 'node:fs';
import path from 'node:path';

import { showcaseItems } from '@/app/(home)/components/showcaseItems';
import { normalizeGuestBlock } from '@/app/guest/[id]/validation/normalizeGuestBlock';

import { buildShowcaseInvitation } from './buildShowcaseInvitation';
import { getShowcasePresentation } from './showcasePresentation';
import {
  getShowcaseInvitation,
  SHOWCASE_INVITATIONS,
} from './showcaseInvitations';

describe('첫 화면 초대장 샘플', () => {
  it('25개 카드 모두 고유한 본문과 일대일로 연결된다', () => {
    expect(showcaseItems).toHaveLength(25);
    expect(SHOWCASE_INVITATIONS).toHaveLength(showcaseItems.length);
    expect(new Set(SHOWCASE_INVITATIONS.map(item => item.id)).size).toBe(25);
    expect(new Set(SHOWCASE_INVITATIONS.map(item => item.heading)).size).toBe(
      25
    );
    for (const card of showcaseItems)
      expect(getShowcaseInvitation(card.id)).toBeDefined();
    expect(getShowcaseInvitation('unknown')).toBeUndefined();
  });

  it.each(SHOWCASE_INVITATIONS)(
    '$name 샘플의 모든 블록을 게스트 화면에서 손실 없이 표시할 수 있다',
    design => {
      const sample = buildShowcaseInvitation(design);
      expect(sample.blocks.length).toBeGreaterThanOrEqual(9);
      expect(new Set(sample.blocks.map(block => block.id)).size).toBe(
        sample.blocks.length
      );
      for (const [index, block] of sample.blocks.entries()) {
        const result = normalizeGuestBlock(block, index);
        expect(result).toMatchObject({ ok: true });
      }
      const calendar = sample.blocks.find(
        block => block.component === 'calendar'
      );
      expect(calendar?.props).toMatchObject({
        date: design.date,
        showDday: false,
      });
      const greeting = sample.blocks.find(
        block => block.component === 'greeting'
      );
      expect(greeting?.props).toMatchObject({ title: design.heading });
    }
  );

  it('사진은 인증이나 외부 네트워크 없이 제공할 수 있는 로컬 파일이다', () => {
    for (const design of SHOWCASE_INVITATIONS) {
      const picture = buildShowcaseInvitation(design).blocks.find(
        block => block.component === 'picture'
      );
      if (!picture) continue;
      const images = (picture.props as { image: string[] }).image;
      expect(images.length).toBeGreaterThan(0);
      for (const image of images) {
        expect(image).toMatch(/^\/images\/showcase\//);
        expect(existsSync(path.join(process.cwd(), 'public', image))).toBe(
          true
        );
      }
    }
  });

  it('7가지 편집 구성과 행사에 맞는 이야기 블록, 실제 갤러리 사진을 제공한다', () => {
    expect(
      new Set(
        SHOWCASE_INVITATIONS.map(
          design => getShowcasePresentation(design).family
        )
      ).size
    ).toBe(7);
    for (const design of SHOWCASE_INVITATIONS) {
      const { blocks } = buildShowcaseInvitation(design);
      const expected =
        design.type === 'wedding'
          ? ['coupleIntroduction', 'gallery', 'interview']
          : design.type === 'firstBirthday'
            ? ['myChild', 'gallery', 'interview']
            : design.type === 'seminar'
              ? ['speakerInformation', 'picture', 'transportation']
              : ['gallery', 'interview'];
      expect(blocks.map(block => block.component)).toEqual(
        expect.arrayContaining(expected)
      );
      for (const image of getShowcasePresentation(design).photos)
        expect(existsSync(path.join(process.cwd(), 'public', image))).toBe(
          true
        );
    }
  });
});
