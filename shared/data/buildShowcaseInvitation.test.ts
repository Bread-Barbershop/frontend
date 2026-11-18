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
      expect(
        sample.blocks.find(block => block.component === 'place')?.props
      ).toMatchObject({ placeName: design.venue });
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

  it.each(
    [
      { previousCount: 4, ids: [2, 5, 6, 17, 20] },
      {
        previousCount: 5,
        ids: [
          0, 1, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 21, 22, 23, 24,
        ],
      },
      { previousCount: 6, ids: [3] },
    ].flatMap(({ previousCount, ids }) =>
      ids.map(id => ({ id: `showcase-${id}`, previousCount }))
    )
  )(
    '$id의 본문은 첫 판의 $previousCount개 블록에서 3~5개 늘어난다',
    ({ id, previousCount }) => {
      const design = getShowcaseInvitation(id);
      if (!design) throw new Error(`초대장 샘플을 찾을 수 없습니다: ${id}`);
      const added =
        buildShowcaseInvitation(design).blocks.length - previousCount;
      expect(added).toBeGreaterThanOrEqual(3);
      expect(added).toBeLessThanOrEqual(5);
    }
  );

  it('표지마다 서로 다른 블록 순서를 제공한다', () => {
    const layouts = SHOWCASE_INVITATIONS.map(design => {
      const { blocks } = buildShowcaseInvitation(design);
      return blocks.map(block => block.component).join(',');
    });
    expect(new Set(layouts).size).toBe(layouts.length);
  });

  it.each(SHOWCASE_INVITATIONS)(
    '$name의 본문 사진은 로컬 파일로 열 수 있다',
    design => {
      const { blocks } = buildShowcaseInvitation(design);
      // 사진 블록뿐 아니라 인터뷰·연사·후원사 등 중첩된 이미지 필드도 확인한다.
      function checkImages(value: unknown): void {
        if (!value || typeof value !== 'object') return;
        for (const [key, child] of Object.entries(value)) {
          if (key === 'image' || key === 'images') {
            expect(Array.isArray(child)).toBe(true);
            for (const image of child as string[]) {
              expect(image).toMatch(/^\/(images|samples|templates)\//);
              expect(
                existsSync(path.join(process.cwd(), 'public', image))
              ).toBe(true);
            }
          } else {
            checkImages(child);
          }
        }
      }
      checkImages(blocks);
    }
  );
});
