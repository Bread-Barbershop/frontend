/**
 * @jest-environment node
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const notFoundMock = jest.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

const loadGuestPayloadMock = jest.fn();

jest.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}));

jest.mock('@/app/guest/[id]/server/loadGuestPayload', () => ({
  loadGuestPayload: (id: string) => loadGuestPayloadMock(id),
}));

jest.mock('@/app/guest/[id]/components/GuestInvitationView', () => ({
  __esModule: true,
  default: ({ payload }: { payload: unknown; mode?: string }) => (
    <div data-testid="guest-invitation-view">
      {JSON.stringify(payload)}
    </div>
  ),
}));

import GuestPage, { generateMetadata } from './page';

describe('GuestPage (/guest/[id])', () => {
  const payload = {
    mainPoster: {
      version: '1.0.0',
      objects: [],
      thumbnailFileId: null,
    },
    blocks: [],
    bgm: {
      selectedBgmId: null,
      volume: 0.2,
      isLoop: true,
      userBgmTitle: null,
      userBgmDuration: null,
      userBgmFileId: null,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders guest invitation view when payload is loaded successfully without poster preload link', async () => {
    loadGuestPayloadMock.mockResolvedValue({
      status: 'ok',
      payload,
      warnings: [],
    });

    const pageElement = await GuestPage({
      params: Promise.resolve({ id: 'guest-file-123' }),
    });
    const html = renderToStaticMarkup(pageElement);

    expect(html).toContain('data-testid="guest-invitation-view"');
    expect(html).not.toContain('rel="preload"');
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it('renders a single preload link for the main poster image when thumbnailFileId is present', async () => {
    loadGuestPayloadMock.mockResolvedValue({
      status: 'ok',
      payload: {
        ...payload,
        mainPoster: {
          thumbnailFileId: 'poster-file-12345',
        },
      },
      warnings: [],
    });

    const pageElement = await GuestPage({
      params: Promise.resolve({ id: 'guest-file-123' }),
    });
    const html = renderToStaticMarkup(pageElement);

    expect(html).toContain('rel="preload"');
    expect(html).toContain('as="image"');
    expect(html).toContain(
      'https://lh3.googleusercontent.com/d/poster-file-12345'
    );
    expect(html.toLowerCase()).toContain('fetchpriority="high"');

    // Preload link should appear exactly once (no duplicate preload)
    const matches = html.match(/rel="preload"/g);
    expect(matches).toHaveLength(1);
  });

  it('calls notFound when payload status is not-found', async () => {
    loadGuestPayloadMock.mockResolvedValue({
      status: 'not-found',
    });

    await expect(
      GuestPage({
        params: Promise.resolve({ id: 'non-existing-id' }),
      })
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it('renders private notice when payload status is private', async () => {
    loadGuestPayloadMock.mockResolvedValue({
      status: 'private',
    });

    const pageElement = await GuestPage({
      params: Promise.resolve({ id: 'private-id' }),
    });
    const html = renderToStaticMarkup(pageElement);

    expect(html).toContain('비공개');
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it('generates metadata from the resolved guest payload', async () => {
    loadGuestPayloadMock.mockResolvedValue({
      status: 'ok',
      payload: {
        ...payload,
        share: {
          title: '소중한 분들을 초대합니다.',
          description: '뜻깊은 날, 귀한 걸음으로 저희와 함께해 주세요.',
        },
      },
      warnings: [],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: 'guest-file-123' }),
    });

    expect(metadata.title).toBe('소중한 분들을 초대합니다.');
    expect(metadata.description).toBe('뜻깊은 날, 귀한 걸음으로 저희와 함께해 주세요.');
  });
});
