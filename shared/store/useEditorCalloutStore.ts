import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { DESKTOP_CONTENT_MIN_WIDTH } from '@/shared/config/layout';

export type EditorCalloutId = 'order-panel' | 'preview-panel';

export type EditorCalloutState = Record<EditorCalloutId, boolean>;

type EditorCalloutStore = {
  callouts: EditorCalloutState;
  setCalloutOpen: (id: EditorCalloutId, open: boolean) => void;
  showCallout: (id: EditorCalloutId) => void;
  showAllCallouts: () => void;
  showAllCalloutsFor: (durationMs?: number) => void;
  hideCallout: (id: EditorCalloutId) => void;
  showOnlyCallout: (id: EditorCalloutId) => void;
  hideAllCallouts: () => void;
  resetCallouts: () => void;
};

export const DEFAULT_EDITOR_CALLOUTS: EditorCalloutState = {
  'order-panel': false,
  'preview-panel': false,
};

const DEFAULT_AUTO_HIDE_MS = 6000;
let autoHideTimer: ReturnType<typeof setTimeout> | null = null;

const clearAutoHideTimer = () => {
  if (!autoHideTimer) return;

  clearTimeout(autoHideTimer);
  autoHideTimer = null;
};

const isDesktopViewport = () =>
  typeof window === 'undefined' ||
  window.innerWidth >= DESKTOP_CONTENT_MIN_WIDTH;

const createCallouts = (open: boolean): EditorCalloutState =>
  Object.fromEntries(
    (Object.keys(DEFAULT_EDITOR_CALLOUTS) as EditorCalloutId[]).map(id => [
      id,
      open,
    ])
  ) as EditorCalloutState;

export const useEditorCalloutStore = create<EditorCalloutStore>()(
  devtools(
    set => ({
      callouts: DEFAULT_EDITOR_CALLOUTS,
      setCalloutOpen: (id, open) => {
        if (open && !isDesktopViewport()) return;
        set(
          state => ({
            callouts: {
              ...state.callouts,
              [id]: open,
            },
          }),
          false,
          'editorCallout/setOpen'
        );
      },
      showCallout: id => {
        if (!isDesktopViewport()) return;
        set(
          state => ({
            callouts: {
              ...state.callouts,
              [id]: true,
            },
          }),
          false,
          'editorCallout/show'
        );
      },
      showAllCallouts: () => {
        clearAutoHideTimer();
        if (!isDesktopViewport()) return;
        set(
          {
            callouts: createCallouts(true),
          },
          false,
          'editorCallout/showAll'
        );
      },
      showAllCalloutsFor: (durationMs = DEFAULT_AUTO_HIDE_MS) => {
        clearAutoHideTimer();
        if (!isDesktopViewport()) return;
        set(
          {
            callouts: createCallouts(true),
          },
          false,
          'editorCallout/showAllFor'
        );
        autoHideTimer = setTimeout(() => {
          autoHideTimer = null;
          set(
            {
              callouts: createCallouts(false),
            },
            false,
            'editorCallout/autoHideAll'
          );
        }, durationMs);
      },
      hideCallout: id =>
        set(
          state => ({
            callouts: {
              ...state.callouts,
              [id]: false,
            },
          }),
          false,
          'editorCallout/hide'
        ),
      showOnlyCallout: id => {
        clearAutoHideTimer();
        if (!isDesktopViewport()) return;
        set(
          {
            callouts: {
              ...createCallouts(false),
              [id]: true,
            },
          },
          false,
          'editorCallout/showOnly'
        );
      },
      hideAllCallouts: () => {
        clearAutoHideTimer();
        set(
          {
            callouts: createCallouts(false),
          },
          false,
          'editorCallout/hideAll'
        );
      },
      resetCallouts: () => {
        clearAutoHideTimer();
        set(
          {
            callouts: DEFAULT_EDITOR_CALLOUTS,
          },
          false,
          'editorCallout/reset'
        );
      },
    }),
    { name: 'editor-callout-store' }
  )
);
