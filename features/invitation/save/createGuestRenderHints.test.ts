/**
 * @jest-environment node
 */

import { createGuestRenderHints } from './createGuestRenderHints';

import type { PersistedEditorBlock, ShareUrlState } from '@/shared/types/block';
import type { BulkJson, MainPosterData } from '@/shared/types/invitationSave';

const bulkData: BulkJson = {
  backgroundColor: '#ffffff',
  titleData: {
    font: 'font-lineseed',
    fontSize: '20px',
    fontWeight: '700',
    color: '#111111',
    bold: false,
    italic: false,
    underline: false,
    align: 'center',
    isDefault: false,
  },
  bodyData: {
    font: 'font-pretendard',
    fontSize: '16px',
    fontWeight: '400',
    color: '#222222',
    bold: false,
    italic: false,
    underline: false,
    align: 'center',
    isDefault: false,
  },
  isZoom: false,
};

const shareUrl: ShareUrlState = {
  title: '',
  description: '',
  images: ['share-image-file-id-12345'],
  urlTitle: '',
  urlDescription: '',
  urlImage: ['url-image-file-id-12345'],
  showLocationButton: false,
};

const mainPoster: MainPosterData = {
  version: '1.0.0',
  objects: [],
  thumbnailFileId: 'poster-thumbnail-file-id-12345',
};

const blocks = [
  {
    id: 'first-block',
    type: 'wedding',
    component: 'greeting',
    props: {
      title: '초대합니다',
      messageHtml: '<p style="font-family: Pretendard">첫 번째 블록입니다.</p>',
    },
  },
  {
    id: 'second-block',
    type: 'wedding',
    component: 'gallery',
    props: {
      images: ['gallery-image-file-id-12345'],
    },
  },
  {
    id: 'third-block',
    type: 'wedding',
    component: 'picture',
    props: {
      image: ['below-fold-image-file-id-12345'],
    },
  },
] as PersistedEditorBlock[];

describe('createGuestRenderHints', () => {
  it('게스트 렌더링에 필요한 font, primary image, above-the-fold block 힌트를 만든다', () => {
    const renderHints = createGuestRenderHints({
      bulkData,
      blocks,
      shareUrl,
      mainPoster,
    });

    expect(renderHints.schemaVersion).toBe(1);
    expect(renderHints.fonts).toEqual(
      expect.arrayContaining(['LINESeedKR', 'Pretendard'])
    );
    expect(renderHints.primaryImageFileIds).toEqual(
      expect.arrayContaining([
        'poster-thumbnail-file-id-12345',
        'url-image-file-id-12345',
        'share-image-file-id-12345',
        'gallery-image-file-id-12345',
      ])
    );
    expect(renderHints.primaryImageFileIds).not.toContain(
      'below-fold-image-file-id-12345'
    );
    expect(renderHints.aboveTheFoldBlockIds).toEqual([
      'first-block',
      'second-block',
    ]);
  });
});
