/** @jest-environment node */
import { packDraft, unpackDraft } from './draftSerialization';

describe('초안 미디어 복구', () => {
  it('사진과 음악의 내용, 이름, Drive ID와 중복 참조를 보존한다', async () => {
    const photo = new File(['photo-bytes'], '결혼사진.jpg', {
      type: 'image/jpeg',
      lastModified: 123,
    });
    Object.defineProperty(photo, 'driveFileId', { value: 'drive-photo' });
    const audio = new File(['music-bytes'], '음악.mp3', { type: 'audio/mpeg' });
    const value = { images: [photo], block: { file: photo }, bgm: audio };
    const restored = unpackDraft<typeof value>(
      structuredClone(await packDraft(value)),
      []
    );
    expect(restored.images[0]).toBe(restored.block.file);
    expect(await restored.images[0].text()).toBe('photo-bytes');
    expect(restored.images[0].name).toBe('결혼사진.jpg');
    expect(restored.images[0].lastModified).toBe(123);
    expect(
      (restored.images[0] as File & { driveFileId: string }).driveFileId
    ).toBe('drive-photo');
    expect(await restored.bgm.text()).toBe('music-bytes');
  });
  it('포스터 blob URL을 파일로 보관하고 복구 시 새 URL을 만든다', async () => {
    const source = URL.createObjectURL(new Blob(['poster-bytes']));
    const packed = structuredClone(await packDraft({ src: source }));
    URL.revokeObjectURL(source);
    const urls: string[] = [];
    const restored = unpackDraft<{ src: string }>(packed, urls);
    expect(restored.src).not.toBe(source);
    expect(await (await fetch(restored.src)).text()).toBe('poster-bytes');
    urls.forEach(url => URL.revokeObjectURL(url));
  });
});
