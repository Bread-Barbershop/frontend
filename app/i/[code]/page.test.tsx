/**
 * @jest-environment node
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import ShortGuestPage, { generateMetadata } from './page';

const notFoundMock = jest.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

jest.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}));

const resolveShortCodeMock = jest.fn();

jest.mock('@/app/api/short-url/_lib/shortUrlStore', () => ({
  resolveShortCode: (code: string) => resolveShortCodeMock(code),
}));

const loadGuestPayloadMock = jest.fn();

jest.mock('@/app/guest/[id]/server/loadGuestPayload', () => ({
  loadGuestPayload: (id: string) => loadGuestPayloadMock(id),
}));

const guestInvitationViewMock = jest.fn((props: unknown) => {
  return React.createElement(
    'div',
    { 'data-testid': 'short-guest-view' },
    JSON.stringify(props)
  );
});

jest.mock('@/app/guest/[id]/components/GuestInvitationView', () => ({
  __esModule: true,
  default: (props: unknown) => guestInvitationViewMock(props),
}));

const payload = {
  shareUrl: {
    urlTitle: 'Short URL Title',
    urlDescription: 'Short URL Description',
    urlImage: ['image-file-id'],
  },
  blocks: [],
  bulkData: {},
  bgm: null,
  mainPoster: {},
};

describe('ShortGuestPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resolveShortCodeMock.mockResolvedValue('data-json-file-id');
    loadGuestPayloadMock.mockResolvedValue({
      status: 'ok',
      payload,
      warnings: [],
    });
  });

  it('resolves short code and renders guest invitation directly', async () => {
    const pageElement = await ShortGuestPage({
      params: Promise.resolve({ code: 'aB7kQ2x' }),
    });
    const html = renderToStaticMarkup(pageElement);

    expect(resolveShortCodeMock).toHaveBeenCalledWith('aB7kQ2x');
    expect(loadGuestPayloadMock).toHaveBeenCalledWith('data-json-file-id');
    expect(guestInvitationViewMock).toHaveBeenCalledWith({
      payload,
      mode: 'guest',
    });
    expect(html).toContain('data-testid="short-guest-view"');
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it('returns notFound when short code cannot be resolved', async () => {
    resolveShortCodeMock.mockResolvedValue(null);

    await expect(
      ShortGuestPage({
        params: Promise.resolve({ code: 'missing' }),
      })
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(loadGuestPayloadMock).not.toHaveBeenCalled();
  });

  it('generates metadata from the resolved guest payload', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ code: 'aB7kQ2x' }),
    });

    expect(metadata).toMatchObject({
      title: 'Short URL Title',
      description: 'Short URL Description',
      robots: {
        index: false,
        follow: false,
        nocache: true,
      },
      openGraph: {
        title: 'Short URL Title',
        description: 'Short URL Description',
        images: 'https://lh3.googleusercontent.com/d/image-file-id',
      },
    });
    expect(loadGuestPayloadMock).toHaveBeenCalledWith('data-json-file-id');
  });
});
