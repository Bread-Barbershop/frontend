import { existsSync } from 'node:fs';
import path from 'node:path';

import { showcaseItems } from '@/app/(home)/components/showcaseItems';
import { normalizeGuestBlock } from '@/app/guest/[id]/validation/normalizeGuestBlock';

import { buildShowcaseInvitation } from './buildShowcaseInvitation';
import {
  getShowcaseInvitation,
  SHOWCASE_INVITATIONS,
} from './showcaseInvitations';

describe('첫 화면 초대장 샘플', () => {
  it('23개 카드 모두 고유한 본문과 일대일로 연결된다', () => {
    expect(showcaseItems).toHaveLength(23);
    expect(SHOWCASE_INVITATIONS).toHaveLength(showcaseItems.length);
    expect(new Set(SHOWCASE_INVITATIONS.map(item => item.id)).size).toBe(23);
    expect(new Set(SHOWCASE_INVITATIONS.map(item => item.heading)).size).toBe(
      23
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
});
