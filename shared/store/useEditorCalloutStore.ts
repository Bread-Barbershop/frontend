import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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

const createClosedCallouts = (): EditorCalloutState =>
  Object.fromEntries(
    (Object.keys(DEFAULT_EDITOR_CALLOUTS) as EditorCalloutId[]).map(id => [
      id,
      false,
    ])
  ) as EditorCalloutState;

const createOpenCallouts = (): EditorCalloutState =>
  Object.fromEntries(
    (Object.keys(DEFAULT_EDITOR_CALLOUTS) as EditorCalloutId[]).map(id => [
      id,
      true,
    ])
  ) as EditorCalloutState;

export const useEditorCalloutStore = create<EditorCalloutStore>()(
  devtools(
    set => ({
      callouts: DEFAULT_EDITOR_CALLOUTS,
      setCalloutOpen: (id, open) =>
        set(
          state => ({
            callouts: {
              ...state.callouts,
              [id]: open,
            },
          }),
          false,
          'editorCallout/setOpen'
        ),
      showCallout: id =>
        set(
          state => ({
            callouts: {
              ...state.callouts,
              [id]: true,
            },
          }),
          false,
          'editorCallout/show'
        ),
      showAllCallouts: () => {
        clearAutoHideTimer();
        set(
          {
            callouts: createOpenCallouts(),
          },
          false,
          'editorCallout/showAll'
        );
      },
      showAllCalloutsFor: (durationMs = DEFAULT_AUTO_HIDE_MS) => {
        clearAutoHideTimer();
        set(
          {
            callouts: createOpenCallouts(),
          },
          false,
          'editorCallout/showAllFor'
        );
        autoHideTimer = setTimeout(() => {
          autoHideTimer = null;
          set(
            {
              callouts: createClosedCallouts(),
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
        set(
          {
            callouts: {
              ...createClosedCallouts(),
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
            callouts: createClosedCallouts(),
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
