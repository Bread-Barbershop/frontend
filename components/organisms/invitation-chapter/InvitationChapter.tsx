import {
  resolveSectionStyle,
  supportsSectionStyle,
} from '@/shared/data/sectionStyles';

import styles from './invitationChapter.module.css';

import type { ReactNode } from 'react';

export function getCollectionStyle(props: unknown): unknown {
  return props && typeof props === 'object' && 'collectionStyle' in props
    ? props.collectionStyle
    : undefined;
}

export function getBlockSectionStyle(props: unknown) {
  return props && typeof props === 'object' && 'sectionStyle' in props
    ? resolveSectionStyle(props.sectionStyle)
    : undefined;
}

export default function InvitationChapter({
  children,
  collectionStyle,
  component,
  sectionStyle,
  defaultStyle,
}: {
  children: ReactNode;
  collectionStyle?: unknown;
  component: string;
  sectionStyle?: unknown;
  defaultStyle?: unknown;
}) {
  const style =
    resolveSectionStyle(sectionStyle) ?? resolveSectionStyle(defaultStyle);
  if (style) {
    if (style === 'plain' || !supportsSectionStyle(component))
      return <>{children}</>;
    return (
      <section className={styles.surface} data-section-style={style}>
        {children}
      </section>
    );
  }

  // Existing saved invitations retain their original collection styling.
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
