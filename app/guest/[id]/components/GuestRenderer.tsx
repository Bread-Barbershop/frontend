'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';

import { resolveScrollAnimation } from '@/components/molecules/scroll-fade-in/animationConfig';
import { ScrollFadeIn } from '@/components/molecules/scroll-fade-in/ScrollFadeIn';
import InvitationChapter, {
  getCollectionStyle,
  getBlockSectionStyle,
} from '@/components/organisms/invitation-chapter/InvitationChapter';
import { InvitationVisualEffects } from '@/components/organisms/visualEffects/VisualEffectsPreview';
import { isBlockEnabled } from '@/shared/data/registry/blockAvailability';
import { blockRegistry } from '@/shared/data/registry/registry';
import { preloadFontFamilyWeights } from '@/shared/fonts/fontLoader';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { usesDarkInvitationCards } from '@/shared/utils/invitationBackgroundColor';
import { resolveInvitationEffects } from '@/shared/utils/invitationEffects';

import { resolveGuestFontFamiliesToPreload } from './guestFontPreload';
import { GuestPrivacyNotice } from './GuestPrivacyNotice';

import type { NormalizedGuestPayload } from '../validation/parseGuestPayload';

type GuestRendererBlock = NormalizedGuestPayload['blocks'][number];
type GuestRendererBulkData = NormalizedGuestPayload['bulkData'];
type GuestRendererRenderHints = NormalizedGuestPayload['renderHints'];

const GUEST_PAGE_PROP_COMPONENTS = new Set<GuestRendererBlock['component']>([
  'coupleIntroduction',
  'countdown',
  'calendar',
  'divider',
  'faq',
  'guestbook',
  'afterParty',
  'dressCode',
  'gallery',
  'mealMenu',
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
  activePrivacyFields,
  isGuestPage: isGuestPageOverride,
  showVisualEffects = true,
  renderBlock,
}: {
  blocks: NormalizedGuestPayload['blocks'];
  bulkData: GuestRendererBulkData;
  renderHints?: GuestRendererRenderHints;
  activePrivacyFields?: NormalizedGuestPayload['activePrivacyFields'];
  isGuestPage?: boolean;
  showVisualEffects?: boolean;
  renderBlock?: (
    block: GuestRendererBlock,
    view: React.ReactNode
  ) => React.ReactNode;
}) {
  const { titleData, bodyData } = bulkData;
  const darkCards = usesDarkInvitationCards(
    bulkData.backgroundColor,
    titleData,
    bodyData
  );
  const scrollAnimation = resolveScrollAnimation(bulkData.scrollAnimation);
  const effects = showVisualEffects
    ? resolveInvitationEffects(bulkData.invitationEffects, blocks)
    : null;
  const { setTitleData, setBodyData } = useEditorStore(
    useShallow(state => ({
      setTitleData: state.setTitleData,
      setBodyData: state.setBodyData,
    }))
  );
  const pathname = usePathname();
  const isGuestPage =
    isGuestPageOverride ??
    (pathname.startsWith('/guest/') || pathname.startsWith('/i/'));
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
    <div
      className="flex flex-col"
      data-invitation-dark={darkCards || undefined}
    >
      {effects && (
        <InvitationVisualEffects
          effects={effects}
          backgroundColor={bulkData.backgroundColor}
        />
      )}
      {blocks.map(block => {
        if (block.component === 'visualEffects' || !isBlockEnabled(block.component))
          return null;
        const registryItem =
          blockRegistry[block.component as keyof typeof blockRegistry];

        if (!registryItem || !registryItem.viewComponent) return null;

        const View = registryItem.viewComponent as React.ComponentType<{
          blockInfo: GuestRendererBlock;
          className?: string;
          isGuestPage?: boolean;
          hideActions?: boolean;
        }>;

        const hideActions = block.component === 'account'
          ? activePrivacyFields?.includes('account')
          : ['phone', 'place'].includes(block.component) && activePrivacyFields?.includes('phone');
        const view = block.privacyPlaceholder ? (
          <GuestPrivacyNotice kind={block.privacyPlaceholder} />
        ) : (
          <>
            {block.privacyMediaHidden && <GuestPrivacyNotice kind="photo" />}
            <View
              blockInfo={block}
              className=""
              {...(hideActions ? { hideActions: true } : {})}
              {...(isGuestPage && GUEST_PAGE_PROP_COMPONENTS.has(block.component)
                ? { isGuestPage: true }
                : {})}
            />
          </>
        );
        return (
          <ScrollFadeIn
            key={block.id}
            className="w-full"
            {...scrollAnimation}
          >
            {renderBlock ? (
              renderBlock(block, view)
            ) : (
              <InvitationChapter
                component={block.component}
                collectionStyle={getCollectionStyle(block.props)}
                sectionStyle={getBlockSectionStyle(block.props)}
                defaultStyle={bulkData.sectionStyle}
              >
                {view}
              </InvitationChapter>
            )}
          </ScrollFadeIn>
        );
      })}
    </div>
  );
}

export default GuestRenderer;
