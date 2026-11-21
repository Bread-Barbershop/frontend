export const selectorWidths = {
  fontFamily: 'w-[210px]',
  fontWeight: 'w-[112px]',
  fontSize: 'w-[78px]',
} as const;

export const selectorTriggerClass =
  'flex h-9 w-full items-center overflow-hidden rounded-lg border border-border-divider bg-bg-base text-sm select-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary';

export const selectorListClass =
  'fixed inset-auto z-10 m-0 list-none overflow-y-auto rounded-lg border border-border-neutral bg-bg-base p-0 font-normal text-sm shadow-lg';

export const selectorOptionClass =
  'flex min-h-8 w-full cursor-pointer select-none items-center gap-1 pr-1 text-left text-sm text-text-primary transition-colors';
