import { compressImage, compressImages } from './imageCompression';

function createFile(sizeBytes: number, type: string, name = 'test.jpg') {
  const buffer = new Uint8Array(sizeBytes);
  return new File([buffer], name, { type });
}

describe('compressImage', () => {
  const LARGE_SIZE = 2 * 1024 * 1024; // 2MB (임계값 1.5MB 초과)
  const SMALL_SIZE = 100 * 1024; // 100KB (임계값 이하)

  let toBlobSpy: jest.SpyInstance;

  beforeEach(() => {
    (global as unknown as { createImageBitmap: jest.Mock }).createImageBitmap =
      jest.fn().mockResolvedValue({
        width: 4000,
        height: 3000,
        close: jest.fn(),
      });

    toBlobSpy = jest
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation((callback: any) => {
        callback(new Blob([new Uint8Array(500 * 1024)], { type: 'image/jpeg' }));
      });

    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ drawImage: jest.fn() } as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('임계값 이하 파일은 압축을 건너뛰고 원본을 그대로 반환한다', async () => {
    const file = createFile(SMALL_SIZE, 'image/jpeg');
    const result = await compressImage(file);

    expect(result).toBe(file);
    expect(
      (global as unknown as { createImageBitmap: jest.Mock }).createImageBitmap
    ).not.toHaveBeenCalled();
  });

  it('임계값을 초과하는 파일은 압축되어 크기가 줄어든다', async () => {
    const file = createFile(LARGE_SIZE, 'image/jpeg');
    const result = await compressImage(file);

    expect(result.size).toBeLessThan(file.size);
    expect(result.type).toBe('image/jpeg');
    expect(result.name).toBe(file.name);
  });

  it('GIF는 임계값과 무관하게 압축 대상에서 제외한다', async () => {
    const file = createFile(LARGE_SIZE, 'image/gif');
    const result = await compressImage(file);

    expect(result).toBe(file);
  });

  it('SVG는 임계값과 무관하게 압축 대상에서 제외한다', async () => {
    const file = createFile(LARGE_SIZE, 'image/svg+xml');
    const result = await compressImage(file);

    expect(result).toBe(file);
  });

  it('createImageBitmap 디코딩 실패 시 원본 File로 폴백한다', async () => {
    (
      global as unknown as { createImageBitmap: jest.Mock }
    ).createImageBitmap.mockRejectedValue(new Error('decode failed'));

    const file = createFile(LARGE_SIZE, 'image/jpeg');
    const result = await compressImage(file);

    expect(result).toBe(file);
  });

  it('압축 결과가 원본보다 크면 원본을 그대로 반환한다', async () => {
    toBlobSpy.mockImplementation((callback: any) => {
        callback(new Blob([new Uint8Array(LARGE_SIZE * 2)], { type: 'image/jpeg' }));
      });

    const file = createFile(LARGE_SIZE, 'image/jpeg');
    const result = await compressImage(file);

    expect(result).toBe(file);
  });
});

describe('compressImages', () => {
  beforeEach(() => {
    (global as unknown as { createImageBitmap: jest.Mock }).createImageBitmap =
      jest.fn().mockResolvedValue({
        width: 4000,
        height: 3000,
        close: jest.fn(),
      });

    jest
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation((callback: any) => {
        callback(new Blob([new Uint8Array(500 * 1024)], { type: 'image/jpeg' }));
      });

    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ drawImage: jest.fn() } as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('여러 파일을 병렬로 압축하여 반환한다', async () => {
    const files = [
      createFile(2 * 1024 * 1024, 'image/jpeg', 'a.jpg'),
      createFile(2 * 1024 * 1024, 'image/jpeg', 'b.jpg'),
    ];
    const results = await compressImages(files);

    expect(results).toHaveLength(2);
    results.forEach((result, index) => {
      expect(result.size).toBeLessThan(files[index].size);
    });
  });
});
