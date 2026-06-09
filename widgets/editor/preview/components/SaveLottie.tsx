import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const SAVE_LOTTIE = {
  loading: '/assets/lottie/loading.lottie',
  success: '/assets/lottie/success.lottie',
  fail: '/assets/lottie/error.lottie',
} as const;

const SAVE_LOTTIE_SIZE_CLASS = {
  loading: 'w-[200px] h-[200px]',
  success: 'w-[100px] h-[100px]',
  fail: 'w-[100px] h-[100px]',
} as const;

export type SaveLottieVariant = keyof typeof SAVE_LOTTIE;

export const SaveLottie = ({
  variant,
  loop = false,
}: {
  variant: SaveLottieVariant;
  loop?: boolean;
}) => (
  <DotLottieReact
    key={`${variant}-${loop ? 'loop' : 'once'}`}
    src={SAVE_LOTTIE[variant]}
    autoplay
    loop={loop}
    className={SAVE_LOTTIE_SIZE_CLASS[variant]}
    aria-label={`${variant} animation`}
  />
);
