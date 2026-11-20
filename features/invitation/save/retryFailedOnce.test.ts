import { retryFailedOnce } from './retryFailedOnce';
import { uploadFileToDrive } from './uploadFileToDrive';

jest.mock('./uploadFileToDrive');

it('재시도도 빈자리에서 이어가며 파일별 성공과 실패를 보존한다', async () => {
  jest.useFakeTimers();
  const uploads = jest.mocked(uploadFileToDrive);
  const files = Array.from({ length: 8 }, (_, i) => new File([], `photo-${i}.jpg`));
  const failures = files.map((file, i) => ({
    file: i === 0 ? file : { id: `image-${i}`, file },
    error: { status: i === 0 ? 401 : 503 },
  }));
  const skipped = { file: new File([], 'invalid.jpg'), error: { status: 400 } };
  const error = new Error('Drive upload failed: 503');
  const refreshAccessToken = jest.fn().mockResolvedValue('new-token');
  uploads.mockImplementation(async file => {
    await new Promise(resolve => setTimeout(resolve, file === files[0] ? 4000 : 1000));
    if (file === files[2]) throw error;
    return { fileId: file.name, name: file.name };
  });

  try {
    const retry = retryFailedOnce({
      failures: [...failures, skipped],
      folderId: 'folder',
      accessToken: 'old-token',
      refreshAccessToken,
      concurrency: 5,
    });
    await jest.advanceTimersByTimeAsync(0);
    expect(uploads).toHaveBeenCalledTimes(5);
    await jest.advanceTimersByTimeAsync(1000);
    expect(uploads.mock.calls).toEqual(files.map(file => [file, 'folder', 'new-token']));
    await jest.runAllTimersAsync();

    const result = await retry;
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(result.ok.map(item => item.file)).toEqual(files.filter(file => file !== files[2]));
    expect(result.ok[0].id).toBeUndefined();
    expect(result.ok[1].id).toBe('image-1');
    expect(result.fail).toEqual([skipped, { file: failures[2].file, error }]);
  } finally {
    jest.useRealTimers();
  }
});
