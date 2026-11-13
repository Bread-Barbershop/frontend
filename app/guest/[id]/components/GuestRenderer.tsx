'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';

import { ScrollFadeIn } from '@/components/molecules/scroll-fade-in/ScrollFadeIn';
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
  'countdown',
  'calendar',
  'divider',
  'dressCode',
  'gallery',
  'myChild',
  'myFamily',
  'organizerInformation',
  'picture',
  'rsvp',
  'spacer',
  'speakerInformation',
  'sponsorshipInfomation',
  'timeline',
  'transportation',
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
  const pathname = usePathname();
  const isGuestPage =
    pathname.startsWith('/guest/') || pathname.startsWith('/i/');
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
    // 폰트는 본문 표시를 막지 않고 백그라운드에서 준비한다.
    void Promise.allSettled(
      fontFamiliesToPreload.map(fontFamily =>
        preloadFontFamilyWeights(fontFamily)
      )
    );
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
    <div className="flex flex-col">
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
          <ScrollFadeIn key={block.id} className="w-full">
            <View
              blockInfo={block}
              className=""
              {...(isGuestPage &&
              GUEST_PAGE_PROP_COMPONENTS.has(block.component)
                ? { isGuestPage: true }
                : {})}
            />
          </ScrollFadeIn>
        );
      })}
    </div>
  );
}

export default GuestRenderer;
