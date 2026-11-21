import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { act, renderHook } from '@testing-library/react';
import { Canvas, Rect } from 'fabric';

import { renewOriginalPosterIds } from '@/shared/data/invitationTemplates/originalPosterLoader';

import { useFabric } from '../hooks/useFabric';

import { restoreLegacyPosterBackground } from './legacyPosterBackground';

type PosterTemplate = {
  version: string;
  objects: {
    id?: string;
    type: string;
    slot?: { key: string; label: string; filled: boolean };
  }[];
  background: string;
  backgroundImage?: Record<string, unknown>;
};

function readTemplate(name: string): PosterTemplate {
  const path = join(
    process.cwd(),
    'public',
    'templates',
    'json',
    `${name}.v1.json`
  );
  return JSON.parse(readFileSync(path, 'utf8'));
}

function asLegacyPoster(template: PosterTemplate) {
  const legacy = renewOriginalPosterIds({ ...template, background: '#ffffff' });
  delete legacy.backgroundImage;
  return legacy;
}

describe('저장된 포스터 배경 호환 처리', () => {
  it.each([
    'wedding_02_eng',
    'wedding_02_kor',
    'wedding_07',
    'wedding_08',
    'wedding_12',
    'seminar_03',
    'seminar_04',
    'seminar_05',
  ])('%s의 저장본을 현재 템플릿과 같은 배경으로 복원한다', name => {
    const template = readTemplate(name);
    const legacy = asLegacyPoster(template);

    const restored = restoreLegacyPosterBackground(legacy);

    expect(legacy.objects.find(object => object.slot)?.slot?.key).not.toBe(
      template.objects.find(object => object.slot)?.slot?.key
    );
    expect(restored.background).toBe(template.background);
    expect(restored.backgroundImage).toEqual(template.backgroundImage);
    expect(restored.objects).toBe(legacy.objects);
    expect(restoreLegacyPosterBackground(restored)).toBe(restored);
  });

  it('다른 사진 칸이 삭제된 웨딩 07 저장본의 사진을 보존한다', () => {
    const template = readTemplate('wedding_07');
    const legacy = asLegacyPoster(template);
    const remainingSlot = legacy.objects.filter(object => object.slot).at(-1)!;
    const photo = {
      ...remainingSlot,
      type: 'Image',
      src: 'data:image/jpeg;base64,example',
      slot: { ...remainingSlot.slot, filled: true },
    };
    const withPhoto = {
      ...legacy,
      objects: [...legacy.objects.filter(object => !object.slot), photo],
    };

    const restored = restoreLegacyPosterBackground(withPhoto);

    expect(restored.background).toBe(template.background);
    expect(restored.objects).toBe(withPhoto.objects);
  });

  it('알려진 사진 칸이 없는 흰색 포스터의 배경을 보존한다', () => {
    const unrelated = asLegacyPoster(readTemplate('wedding_01'));

    expect(restoreLegacyPosterBackground(unrelated)).toBe(unrelated);
  });

  it('사용자가 고른 배경색을 보존한다', () => {
    const custom = {
      ...asLegacyPoster(readTemplate('wedding_08')),
      background: '#012345',
    };

    expect(restoreLegacyPosterBackground(custom)).toBe(custom);
  });

  it('사용자가 추가한 Fabric 배경 이미지를 보존한다', () => {
    const custom = {
      ...asLegacyPoster(readTemplate('wedding_02_kor')),
      backgroundImage: { type: 'Image', src: '/custom-image.png' },
    };

    expect(restoreLegacyPosterBackground(custom)).toBe(custom);
  });

  it('이미지 레이어를 추가한 웨딩 저장본의 배경을 보존한다', () => {
    const legacy = asLegacyPoster(readTemplate('wedding_08'));
    const custom = {
      ...legacy,
      objects: [{ id: 'background-layer', type: 'Image' }, ...legacy.objects],
    };

    expect(restoreLegacyPosterBackground(custom)).toBe(custom);
  });

  it.each([
    { src: '/custom-image.png' },
    { opacity: 0.5 },
    { left: 195 },
    { imageBaseScale: 1, scaleX: 1.2, scaleY: 1.2 },
  ])('이미지 레이어를 편집한 세미나 저장본의 배경을 보존한다', edits => {
    const legacy = asLegacyPoster(readTemplate('seminar_03'));
    const custom = {
      ...legacy,
      objects: legacy.objects.map(object =>
        object.id === 'background-layer' ? { ...object, ...edits } : object
      ),
    };

    expect(restoreLegacyPosterBackground(custom)).toBe(custom);
  });

  it('기본 이미지 레이어를 제거한 세미나 저장본에 배경색을 복원한다', () => {
    const template = readTemplate('seminar_03');
    const legacy = asLegacyPoster(template);
    const withoutLayer = {
      ...legacy,
      objects: legacy.objects.filter(
        object => object.id !== 'background-layer'
      ),
    };

    const restored = restoreLegacyPosterBackground(withoutLayer);

    expect(restored.background).toBe(template.background);
    expect(restored.objects).toBe(withoutLayer.objects);
  });

  it('복원한 템플릿의 배경을 흰색으로 편집해 다시 저장하면 재실행 시 흰색을 보존한다', async () => {
    const getContext = jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({
        clearRect: jest.fn(),
        scale: jest.fn(),
      } as unknown as CanvasRenderingContext2D);
    const canvas = new Canvas(undefined, {
      width: 375,
      height: 812,
      renderOnAddRemove: false,
    });
    jest.spyOn(canvas, 'requestRenderAll').mockReturnValue(canvas);
    const { result } = renderHook(() => useFabric());
    act(() => result.current.setCanvas(canvas));

    try {
      const template = readTemplate('wedding_02_eng');
      const legacy = asLegacyPoster(template);
      const legacySlot = legacy.objects.find(object => object.slot)!;
      await canvas.loadFromJSON(
        restoreLegacyPosterBackground({
          ...legacy,
          objects: [{ ...legacySlot, fill: '#999999' }],
        })
      );
      expect(canvas.backgroundImage).toBeInstanceOf(Rect);

      canvas.set({ backgroundImage: undefined, backgroundColor: '#ffffff' });
      act(() => result.current.saveHistory());
      await act(async () => {
        await result.current.runHistoryTransaction(
          async () => {
            await canvas.loadFromJSON({ background: '#314952', objects: [] });
          },
          { save: true }
        );
        await result.current.undo();
      });

      const saved = JSON.parse(
        JSON.stringify(result.current.exportIntersectedJSON())
      );
      await canvas.loadFromJSON(restoreLegacyPosterBackground(saved));

      expect(canvas.backgroundColor).toBe('#ffffff');
      expect(canvas.backgroundImage).toBeUndefined();
      expect(canvas.getObjects()).toHaveLength(1);
    } finally {
      await canvas.dispose();
      getContext.mockRestore();
    }
  });
});
