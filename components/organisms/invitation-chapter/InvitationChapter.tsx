import styles from './invitationChapter.module.css';

import type { ReactNode } from 'react';

export default function InvitationChapter({
  children,
  collectionStyle,
  component,
}: {
  children: ReactNode;
  collectionStyle?: unknown;
  component: string;
}) {
  const supported =
    typeof collectionStyle === 'string' &&
    /^showcase-(?:[0-9]|1[0-9]|2[0-2])$/.test(collectionStyle);
  if (!supported || component === 'spacer' || component === 'divider')
    return <>{children}</>;
  return (
    <section
      className={styles.chapter}
      data-design={collectionStyle}
      data-component={component}
    >
      {children}
    </section>
  );
}
