'use client';

import InviaLogo from '@/shared/assets/logo/invia-logo.svg';

import styles from './ScreenTransitionLoader.module.css';

type ScreenTransitionLoaderProps = {
  label: string;
};

export default function ScreenTransitionLoader({
  label,
}: ScreenTransitionLoaderProps) {
  return (
    <div className={styles.screen}>
      <span className="sr-only" role="status" aria-label={label}>
        {label}
      </span>
      <div className={styles.content}>
        <span className={styles.envelope} aria-hidden="true" />
        <div className={styles.wordmark} role="img" aria-label="Invite via Invia">
          <span aria-hidden="true">Invite via</span>
          <InviaLogo
            className={styles.logo}
            aria-hidden="true"
            focusable="false"
          />
        </div>
        <div
          className={styles.progress}
          role="progressbar"
          aria-label={label}
        >
          <span className={styles.progressSegment} />
        </div>
      </div>
    </div>
  );
}
