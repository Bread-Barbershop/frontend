import { FabricImage, Rect } from 'fabric';

import { exportPosterImage } from './previewExport';

import type { StaticCanvas } from 'fabric';

describe('포스터 발행 이미지', () => {
  it.each(['webp', 'png'] as const)(
    '%s 이미지에서는 빈 사진 칸만 숨기고 편집용 사진 칸을 보존한다',
    format => {
      const slot = { key: 'cover', replaceable: true };
      const frame = new Rect().set({ slot, name: 'slot-placeholder' });
      const unnamedFrame = new Rect().set({ slot });
      const photo = new FabricImage(document.createElement('img')).set({
        slot: { ...slot, filled: true },
      });
      const decoration = new Rect();
      const background = new FabricImage(document.createElement('img')).set({
        id: 'background-layer',
      });
      const objects = [background, frame, photo, unnamedFrame, decoration];
      const toDataURL = jest.fn<string, Parameters<StaticCanvas['toDataURL']>>();

      exportPosterImage({ toDataURL }, format);

      const [options] = toDataURL.mock.calls[0];
      expect(options?.format).toBe(format);
      expect(objects.filter(object => options?.filter?.(object))).toEqual([
        background,
        photo,
        decoration,
      ]);
      expect(frame.visible).toBe(true);
      expect(frame.get('slot')).toBe(slot);
    }
  );
});
