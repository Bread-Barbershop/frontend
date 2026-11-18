import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { normalizeGuestBlock } from '@/app/guest/[id]/validation/normalizeGuestBlock';
import { parseGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';
import { showcaseItems } from '@/app/(home)/components/showcaseItems';
import { buildShowcaseInvitation } from '../buildShowcaseInvitation';
import { SHOWCASE_INVITATIONS } from '../showcaseInvitations';
import { SHOWCASE_ORIGINAL_TEMPLATES } from '../showcaseOriginalTemplates';
import { resolveSectionStyle } from '../sectionStyles';

import {
  createInvitationTemplate,
  getInvitationTemplates,
  INVITATION_TEMPLATES,
} from './index';

const originalFetch = global.fetch;

const readOriginal = (url: string) =>
  JSON.parse(
    readFileSync(join(process.cwd(), 'public', url.replace(/^\//, '')), 'utf8')
  ) as Record<string, unknown>;

const withoutFreshIds = (value: unknown, key?: string): unknown => {
  if (Array.isArray(value)) return value.map(item => withoutFreshIds(item));
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value).flatMap(([childKey, child]) => {
      if (childKey === 'id' || (key === 'slot' && childKey === 'key'))
        return [];
      return [[childKey, withoutFreshIds(child, childKey)]];
    })
  );
};

const collectIds = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(collectIds);
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) =>
    key === 'id' && typeof child === 'string' && child !== 'background-layer'
      ? [child]
      : collectIds(child)
  );
};

beforeAll(() => {
  global.fetch = jest.fn(async input => {
    const pathname = new URL(String(input), 'http://localhost').pathname;
    return {
      ok: true,
      status: 200,
      json: async () => readOriginal(pathname),
    } as Response;
  }) as typeof fetch;
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('홈과 편집기가 공유하는 초대장 컬렉션', () => {
  it('홈의 모든 디자인을 실제 제작 가능한 카테고리별 템플릿으로 제공한다', () => {
    expect(showcaseItems.map(item => item.id)).toEqual(
      INVITATION_TEMPLATES.map(item => item.id)
    );
    expect(INVITATION_TEMPLATES.map(item => item.id)).toEqual(
      SHOWCASE_INVITATIONS.map(item => item.id)
    );
    expect(getInvitationTemplates('wedding')).toHaveLength(14);
    expect(getInvitationTemplates('seminar')).toHaveLength(9);
    expect(getInvitationTemplates('birthday')).toHaveLength(9);
    expect(getInvitationTemplates('firstBirthday')).toHaveLength(9);
    expect(Object.keys(SHOWCASE_ORIGINAL_TEMPLATES)).toEqual(
      SHOWCASE_INVITATIONS.map(item => item.id)
    );

    for (const template of INVITATION_TEMPLATES) {
      expect(
        existsSync(
          join(process.cwd(), 'public', template.posterImage.replace(/^\//, ''))
        )
      ).toBe(true);
      expect(
        existsSync(
          join(
            process.cwd(),
            'public',
            template.posterJsonUrl.replace(/^\//, '')
          )
        )
      ).toBe(true);
    }
  });

  it('원본 JSON 로드에 실패하면 문서 적용에 쓸 데이터를 만들지 않는다', async () => {
    const mockFetch = jest.mocked(global.fetch);
    mockFetch.mockRejectedValueOnce(new Error('network failure'));
    await expect(createInvitationTemplate('showcase-24')).rejects.toThrow(
      'network failure'
    );
    await expect(
      createInvitationTemplate('showcase-24')
    ).resolves.toMatchObject({
      posterJson: { objects: expect.any(Array) },
    });
  });

  it('원본 JSON 응답이 멈추면 제한 시간 후 다시 요청할 수 있다', async () => {
    const mockFetch = jest.mocked(global.fetch);
    mockFetch.mockImplementationOnce(() => new Promise<Response>(() => {}));
    jest.useFakeTimers();

    try {
      const pending = createInvitationTemplate('showcase-23');
      const pendingError = expect(pending).rejects.toThrow('timed out');
      await jest.advanceTimersByTimeAsync(15_000);
      await pendingError;
    } finally {
      jest.useRealTimers();
    }

    await expect(
      createInvitationTemplate('showcase-23')
    ).resolves.toMatchObject({
      posterJson: { objects: expect.any(Array) },
    });
  });

  it.each(SHOWCASE_INVITATIONS)(
    '$name의 원본 포스터와 본문을 편집해 저장 후 복원한다',
    async design => {
      const original = SHOWCASE_ORIGINAL_TEMPLATES[design.id];
      const sourcePoster = readOriginal(original.jsonUrl);
      const preview = buildShowcaseInvitation(design);
      const editor = await createInvitationTemplate(design.id);
      const template = INVITATION_TEMPLATES.find(
        item => item.id === design.id
      )!;
      const sourceFonts = new Set<string>();
      for (const object of sourcePoster.objects as Record<string, unknown>[]) {
        if (typeof object.fontFamily === 'string') {
          sourceFonts.add(object.fontFamily);
        }
        if (Array.isArray(object.styles)) {
          for (const run of object.styles as Record<string, unknown>[]) {
            const style = run.style as Record<string, unknown> | undefined;
            if (typeof style?.fontFamily === 'string') {
              sourceFonts.add(style.fontFamily);
            }
          }
        }
      }
      expect(template.fontFamilies).toEqual([...sourceFonts]);

      expect(editor.backgroundColor).toBe(preview.bulkData.backgroundColor);
      expect(editor.titleData).toEqual(preview.bulkData.titleData);
      expect(editor.bodyData).toEqual(preview.bulkData.bodyData);
      expect(editor.sectionStyle).toBe(preview.bulkData.sectionStyle);
      expect(resolveSectionStyle(editor.sectionStyle)).toBe(
        editor.sectionStyle
      );
      expect(editor.sectionStyle).toBeDefined();
      expect(editor.blocks.map(block => block.component)).toEqual(
        preview.blocks.map(block => block.component)
      );
      expect(
        editor.blocks
          .map(block => block.component)
          .filter(
            component => component !== 'spacer' && component !== 'divider'
          )
      ).toEqual(template.blockTypes);
      expect(withoutFreshIds(editor.blocks)).toEqual(
        withoutFreshIds(preview.blocks)
      );
      expect(editor.posterJson.objects).toHaveLength(
        (sourcePoster.objects as unknown[]).length
      );
      expect(withoutFreshIds(editor.posterJson)).toEqual(
        withoutFreshIds(sourcePoster)
      );

      const originalObjects = sourcePoster.objects as Record<string, unknown>[];
      const objects = editor.posterJson.objects as Record<string, unknown>[];
      expect(objects.map(object => object.type)).toEqual(
        originalObjects.map(object => object.type)
      );
      expect(
        objects.some(object => object.type === 'Textbox' && object.editable)
      ).toBe(true);
      expect(
        objects
          .filter(object => object.slot)
          .every(object => {
            const slot = object.slot as { filled?: boolean };
            return slot.filled === (object.type === 'Image');
          })
      ).toBe(true);
      expect(objects.some(object => object.id === 'background-layer')).toBe(
        originalObjects.some(object => object.id === 'background-layer')
      );

      const saved = JSON.parse(JSON.stringify(editor));
      saved.blocks.forEach((block: unknown, index: number) => {
        const normalized = normalizeGuestBlock(block, index);
        expect(normalized.ok).toBe(true);
        if (normalized.ok) {
          expect(normalized.block.props).not.toHaveProperty('collectionStyle');
          expect(normalized.block.props).toEqual(
            (block as { props: unknown }).props
          );
        }
      });
      const guest = parseGuestPayload({
        blocks: saved.blocks,
        mainPoster: saved.posterJson,
        bulkData: {
          backgroundColor: saved.backgroundColor,
          sectionStyle: saved.sectionStyle,
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
        expect(guest.payload.bulkData.sectionStyle).toBe(editor.sectionStyle);
        expect(guest.payload.mainPoster.objects).toEqual(
          saved.posterJson.objects
        );
      }
    }
  );

  it('같은 원본을 다시 적용해도 Fabric 오브젝트와 블록 ID를 새로 만든다', async () => {
    for (const design of SHOWCASE_INVITATIONS) {
      const a = await createInvitationTemplate(design.id);
      const b = await createInvitationTemplate(design.id);
      const first = collectIds(a);
      const second = collectIds(b);
      const firstObjects = a.posterJson.objects as Record<string, unknown>[];
      const secondObjects = b.posterJson.objects as Record<string, unknown>[];

      expect(a.blocks).toHaveLength(design.sections.length);
      for (const block of a.blocks) {
        expect(block.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
      }
      expect(second).toHaveLength(first.length);
      expect(new Set(first).size).toBe(first.length);
      expect(first.every(id => !second.includes(id))).toBe(true);
      const objectIds = firstObjects
        .map(object => object.id)
        .filter((id): id is string => typeof id === 'string');
      expect(new Set(objectIds).size).toBe(objectIds.length);
      expect(
        firstObjects.find(object => object.id === 'background-layer')?.id
      ).toBe(
        secondObjects.find(object => object.id === 'background-layer')?.id
      );
    }
  });

  it('유효하지 않은 템플릿으로 빈 편집기를 만들지 않는다', async () => {
    await expect(createInvitationTemplate('unknown-template')).rejects.toThrow(
      'Unknown template'
    );
  });
});
