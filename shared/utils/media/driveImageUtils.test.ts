import {
  previewDriveFileUrl,
  publicDriveFileUrl,
  resolveDriveImageSource,
} from './driveImageUtils';

describe('driveImageUtils', () => {
  it('resolves Drive file ids to public image URLs by default', () => {
    expect(resolveDriveImageSource('drive-file-id-123')).toBe(
      publicDriveFileUrl('drive-file-id-123')
    );
  });

  it('resolves Drive file ids to preview asset URLs in dashboard preview mode', () => {
    expect(
      resolveDriveImageSource('drive-file-id-123', {
        folderId: 'invitation-folder-id',
        mode: 'dashboard-preview',
      })
    ).toBe(
      previewDriveFileUrl('drive-file-id-123', {
        folderId: 'invitation-folder-id',
      })
    );
  });

  it('keeps absolute URLs unchanged', () => {
    expect(
      resolveDriveImageSource('https://example.com/image.png', {
        mode: 'dashboard-preview',
      })
    ).toBe('https://example.com/image.png');
  });
});
