export const DASHBOARD_CAROUSEL_START_GUTTER_PX = -20;

export const DASHBOARD_CAROUSEL_CONTROLS_CONTAINER_CLASS =
  'absolute bottom-0 left-1/2 z-20 flex h-[68px] w-screen -translate-x-1/2 items-center justify-center border-t border-white/30 bg-white/10 px-6 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md supports-backdrop-filter:bg-white/10';

export const INVITATION_SECTION_CLASS =
  'relative h-186.75 w-[56.82%] translate-y-20.5 overflow-x-hidden overflow-y-hidden';

export const INVITATION_VIEWPORT_CLASS = 'h-full overflow-hidden pr-5';

export const INVITATION_TRACK_CLASS =
  'flex h-full touch-pan-y touch-pinch-zoom items-end';

export const INVITATION_SLIDE_CLASS =
  'flex h-full min-w-0 shrink-0 basis-[19.5rem] items-end';

export const INVITATION_ITEM_WRAPPER_CLASS =
  'relative flex w-[19.5rem] shrink-0 justify-start overflow-visible pt-10';

export const INVITATION_DELETE_BUTTON_POSITION_CLASS =
  'absolute right-2 z-20';

export const INVITATION_CARD_CLASS =
  'relative flex h-118.75 w-65 items-end overflow-hidden rounded-2xl p-1';

export const INVITATION_ITEM_IMAGE_SIZES = '260px';

export const DASHBOARD_TITLE_SECTION_CLASS =
  'absolute top-1/2 right-10 z-10 flex -translate-y-1/2';

export const DASHBOARD_TITLE_CARD_CLASS =
  'flex w-133.75 flex-col items-end gap-2 rounded-4xl border-x border-white/30 bg-white/6 p-8 text-right shadow-[inset_0_8px_24px_rgba(255,255,255,0.14),inset_0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-xs supports-backdrop-filter:bg-white/6';

export const DELETE_INVITATION_BUTTON_CLASS =
  'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white text-[#F32E2E] shadow-[0_6px_14px_rgba(0,0,0,0.16)]';

export const PUBLISHED_URL_ACTIONS_CLASS =
  'flex w-55 items-center overflow-hidden rounded-lg border border-border-neutral bg-white px-2';

export const DASHBOARD_COPY = {
  archiveEyebrow: 'Archive',
  title: '\uCD08\uB300\uC7A5',
  description:
    '\uB2E4\uC591\uD55C \uCD08\uB300\uC7A5\uC744 \uB2E4\uC2DC \uD3B8\uC9D1\uD558\uAC70\uB098 \uC0AC\uC6A9\uD560 \uC218 \uC788\uC5B4\uC694.',
  deleteInvitationAriaLabel: '\uCD08\uB300\uC7A5 \uC0AD\uC81C',
  editInvitationLabel: '\uC7AC\uD3B8\uC9D1\uD558\uAE30',
  publishInvitationLabel: 'URL \uB9C1\uD06C \uD655\uC778\uD558\uAE30',
  publishingLabel: 'Publishing...',
  copyUrlLabel: '\uBCF5\uC0AC\uD558\uAE30',
  invitationLoadingMessage:
    '\uCD08\uB300\uC7A5\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4.',
  invitationEmptyMessage:
    '\uD45C\uC2DC\uD560 \uCD08\uB300\uC7A5\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.',
  loadInvitationsFailedMessage:
    '\uCD08\uB300\uC7A5 \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.',
  unknownErrorMessage:
    '\uC54C \uC218 \uC5C6\uB294 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.',
  publishRequestFailedMessage: 'Publish request failed.',
  previousSlideAriaLabel: '\uC774\uC804 \uBC84\uD2BC',
  nextSlideAriaLabel: '\uB2E4\uC74C \uBC84\uD2BC',
} as const;
