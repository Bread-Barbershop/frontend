import { cva, VariantProps } from 'class-variance-authority';

export const selectorVariants = cva(
  'flex items-center justify-between w-full text-sm transition-all overflow-hidden select-none',
  {
    variants: {
      type: {
        normal: '',
        editor: '',
      },
      isOpen: {
        true: 'rounded-t-lg border-t border-l border-r',
        false: 'rounded-lg border border-transparent',
      },
      hasValue: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      // normal 타입: isOpen에 따라 배경색 결정
      {
        type: 'normal',
        isOpen: true,
        className: 'bg-bg-base',
      },
      {
        type: 'normal',
        isOpen: false,
        className: 'bg-border-neutral',
      },
      // editor 타입: hasValue에 따라 배경색 결정
      {
        type: 'editor',
        hasValue: true,
        className: 'bg-bg-base',
      },
      {
        type: 'editor',
        hasValue: false,
        className: 'bg-border-neutral',
      },
    ],
    defaultVariants: {
      type: 'editor',
      isOpen: false,
      hasValue: false,
    },
  }
);

export type SelectorVariants = VariantProps<typeof selectorVariants>;

export const selectorStyles = {
  fontFamily: {
    container: 'w-[210px] font-semibold',
    trigger: 'h-8 bg-white border-[#eaeaea]',
    triggerButton: 'pl-3 pr-1',
    label: 'justify-start text-left text-sm',
    optionLabel: 'justify-start text-left text-sm',
  },
  fontWeight: {
    container: 'w-[112px] font-semibold',
    trigger: 'h-8 bg-white border-[#eaeaea]',
    triggerButton: 'pl-3 pr-1',
    label: 'justify-start text-left text-sm',
    optionLabel: 'justify-start text-left text-sm',
  },
  fontSize: {
    container: 'w-[78px] font-semibold',
    trigger: 'h-8 bg-[#f3f3f3] rounded-sm',
    openTrigger: 'bg-white border-[#eaeaea]',
    triggerButton: 'pl-3 pr-1',
    label: 'justify-start text-left text-sm',
    optionLabel: 'justify-start text-left text-sm',
  },
} as const;

export type SelectorVariantType = keyof typeof selectorStyles;
