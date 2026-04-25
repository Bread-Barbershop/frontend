import { cva, VariantProps } from 'class-variance-authority';

export const selectorVariants = cva(
  'flex items-center justify-between w-full text-sm transition-all overflow-hidden',
  {
    variants: {
      type: {
        normal: '',
        editor: '',
      },
      isOpen: {
        true: 'rounded-t-lg border-b-transparent',
        false: 'rounded-lg',
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
