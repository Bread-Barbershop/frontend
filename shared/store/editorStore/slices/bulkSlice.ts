import { StateCreator } from 'zustand';

import {
  DEFAULT_SCROLL_ANIMATION,
  resolveScrollAnimation,
} from '@/components/molecules/scroll-fade-in/animationConfig';
import {
  BODY_BULK_DATA,
  DEFAULT_BACKGROUND_COLOR,
  TITLE_BULK_DATA,
} from '@/shared/data/sample/bulkData';
import { BulkData, BulkSlice, EditorState } from '@/shared/types/block';

export const createBulkSlice: StateCreator<EditorState, [], [], BulkSlice> = (
  set,
  _
) => ({
  sectionStyle: undefined,
  setSectionStyle: sectionStyle => set({ sectionStyle }),
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  titleData: TITLE_BULK_DATA,
  bodyData: BODY_BULK_DATA,
  isZoom: false,
  scrollAnimation: DEFAULT_SCROLL_ANIMATION,
  setBackgroundColor: (color: string) => set({ backgroundColor: color }),
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
