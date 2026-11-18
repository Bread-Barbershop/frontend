import { StateCreator } from 'zustand';

import {
  DEFAULT_SCROLL_ANIMATION,
  resolveScrollAnimation,
} from '@/components/molecules/scroll-fade-in/animationConfig';
import {
  DEFAULT_BACKGROUND_TEXTURE,
  resolveBackgroundTexture,
} from '@/shared/data/backgroundTextures';
import {
  BODY_BULK_DATA,
  DEFAULT_BACKGROUND_COLOR,
  TITLE_BULK_DATA,
} from '@/shared/data/sample/bulkData';
import { BulkData, BulkSlice, EditorState } from '@/shared/types/block';
import { resolveInvitationTextColors } from '@/shared/utils/invitationBackgroundColor';

export const createBulkSlice: StateCreator<EditorState, [], [], BulkSlice> = (
  set,
  _
) => ({
  sectionStyle: undefined,
  setSectionStyle: sectionStyle => set({ sectionStyle }),
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  backgroundTexture: DEFAULT_BACKGROUND_TEXTURE,
  setBackgroundTexture: settings =>
    set(state => {
      const backgroundTexture = resolveBackgroundTexture(settings);
      return state.backgroundTexture.material === backgroundTexture.material &&
        state.backgroundTexture.strength === backgroundTexture.strength
        ? state
        : { backgroundTexture };
    }),
  titleData: TITLE_BULK_DATA,
  bodyData: BODY_BULK_DATA,
  isZoom: false,
  scrollAnimation: DEFAULT_SCROLL_ANIMATION,
  invitationEffectsReplay: 0,
  replayInvitationEffects: () =>
    set(state => ({ invitationEffectsReplay: state.invitationEffectsReplay + 1 })),
  setInvitationEffects: invitationEffects =>
    set({ invitationEffects, invitationEffectsReplay: 0 }),
  updateInvitationEffects: settings =>
    set(state => ({
      invitationEffects: { ...state.invitationEffects, ...settings },
      invitationEffectsReplay: 0,
    })),
  setBackgroundColor: (color: string) => set({ backgroundColor: color }),
  selectBackgroundColor: backgroundColor =>
    set(({ titleData, bodyData }) => ({
      backgroundColor,
      ...resolveInvitationTextColors(backgroundColor, titleData, bodyData),
    })),
  setTitleData: (data: BulkData) => set({ titleData: data }),
  setBodyData: (data: BulkData) => set({ bodyData: data }),
  setIsZoom: (isZoom: boolean) => set({ isZoom }),
  setInvitationPrivacy: invitationPrivacy => set({ invitationPrivacy }),
  setScrollAnimation: settings =>
    set({ scrollAnimation: resolveScrollAnimation(settings) }),
  updateScrollAnimation: settings =>
    set(state => ({
      scrollAnimation: resolveScrollAnimation({
        ...state.scrollAnimation,
        ...settings,
      }),
    })),
});
