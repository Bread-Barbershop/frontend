'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { blockRegistry } from '@/shared/data/registry/registry';
import { preloadFontFamilyWeights } from '@/shared/fonts/fontLoader';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { resolveGuestFontFamiliesToPreload } from './guestFontPreload';

import type { NormalizedGuestPayload } from '../validation/parseGuestPayload';

type GuestRendererBlock = NormalizedGuestPayload['blocks'][number];
type GuestRendererBulkData = NormalizedGuestPayload['bulkData'];
type GuestRendererRenderHints = NormalizedGuestPayload['renderHints'];

const GUEST_PAGE_PROP_COMPONENTS = new Set<GuestRendererBlock['component']>([
  'coupleIntroduction',
  'gallery',
  'myChild',
  'myFamily',
  'organizerInformation',
  'picture',
  'speakerInformation',
  'sponsorshipInfomation',
  'video',
]);

function GuestRenderer({
  blocks,
  bulkData,
  renderHints,
}: {
  blocks: NormalizedGuestPayload['blocks'];
  bulkData: GuestRendererBulkData;
  renderHints?: GuestRendererRenderHints;
}) {
  const { titleData, bodyData } = bulkData;
  const { setTitleData, setBodyData } = useEditorStore(
    useShallow(state => ({
      setTitleData: state.setTitleData,
      setBodyData: state.setBodyData,
    }))
  );
  const [fontsReady, setFontsReady] = useState(false);
  const pathname = usePathname();
  const isGuestPage = pathname.startsWith('/guest');
  // renderHints가 있으면 그 값을 쓰고, 없으면 기존 block 스캔 방식으로 fallback한다.
  const fontFamiliesToPreload = useMemo(
    () =>
      resolveGuestFontFamiliesToPreload({
        blocks,
        bulkData,
        renderHints,
      }),
    [blocks, bulkData, renderHints]
  );

  useEffect(() => {
    setTitleData(titleData);
    setBodyData(bodyData);
  }, [setTitleData, setBodyData, titleData, bodyData]);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      setFontsReady(false);

      await Promise.allSettled(
        fontFamiliesToPreload.map(fontFamily =>
          preloadFontFamilyWeights(fontFamily)
        )
      );

      if (mounted) {
        setFontsReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [fontFamiliesToPreload]);

  useEffect(() => {
    if (bulkData.isZoom) {
      document.addEventListener(
        'gesturestart',
        e => {
          e.preventDefault();
        },
        { passive: false }
      );

      document.addEventListener(
        'gesturechange',
        e => {
          e.preventDefault();
        },
        { passive: false }
      );

      document.addEventListener(
        'gestureend',
        e => {
          e.preventDefault();
        },
        { passive: false }
      );
    }
  }, [bulkData.isZoom]);
  return (
    <div
      className="flex flex-col transition-opacity duration-150"
      style={{
        opacity: fontsReady ? 1 : 0,
      }}
    >
      {blocks.map(block => {
        const registryItem =
          blockRegistry[block.component as keyof typeof blockRegistry];

        if (!registryItem || !registryItem.viewComponent) return null;

        const View = registryItem.viewComponent as React.ComponentType<{
          blockInfo: GuestRendererBlock;
          className?: string;
          isGuestPage?: boolean;
        }>;

        return (
          <div key={block.id} className="w-full">
            <View
              blockInfo={block}
              className=""
              {...(isGuestPage &&
              GUEST_PAGE_PROP_COMPONENTS.has(block.component)
                ? { isGuestPage: true }
                : {})}
            />
          </div>
        );
      })}
    </div>
  );
}

export default GuestRenderer;
