import { blockRegistry } from '@/shared/data/registry/registry';
import type { InvitationType } from '@/shared/types/block';
import { BlockType, PropsFromFields } from '@/shared/types/editor';
import { getDefaultPlaceTitle } from '@/shared/utils/placeTitle';

type DefaultProps<T extends BlockType> = PropsFromFields<
  (typeof blockRegistry)[T]['fields']
>;

export function createDefaultProps<T extends BlockType>(
  type: T,
  invitationType?: InvitationType
): DefaultProps<T> {
  const fields = blockRegistry[type].fields;

  const props = Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, value.default])
  ) as DefaultProps<T>;

  if (type === 'calendar' && invitationType && invitationType !== 'wedding') {
    return {
      ...props,
      title: '행사 일시',
      englishTitle: 'THE EVENT TIME',
    } as DefaultProps<T>;
  }

  if (type === 'place') {
    return {
      ...props,
      title: getDefaultPlaceTitle(invitationType),
    } as DefaultProps<T>;
  }

  return props;
}
