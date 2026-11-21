export type AudienceVisibility = {
  published: boolean;
  /** The empty slug is the default invitation. Choices survive a master switch change. */
  publicSlugs: string[];
  revision: string;
  pending: boolean;
};

export type AudienceVisibilityOptions = {
  groups: { slug: string; name: string }[];
  visibility: AudienceVisibility;
};

export type AudienceVisibilityStatus =
  | 'public'
  | 'partial'
  | 'private'
  | 'pending';

export function visibilityStatus({
  groups,
  visibility,
}: AudienceVisibilityOptions): AudienceVisibilityStatus {
  if (visibility.pending) return 'pending';
  if (!visibility.published) return 'private';
  return groups.every(group => visibility.publicSlugs.includes(group.slug))
    ? 'public'
    : 'partial';
}
