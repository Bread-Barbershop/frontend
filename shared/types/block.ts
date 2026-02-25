import { blockSchema } from '../data/registry/block.schema';

import { BlockType, PropsFromFields } from './editor';

export type InvitationType =
  | 'wedding'
  | 'firstBirthday'
  | 'birthday'
  | 'conference'
  | 'etc';

export type EditorBlock<T extends BlockType = BlockType> = {
  id: string;
  type: InvitationType;
  component: T;
  props: PropsFromFields<(typeof blockSchema)[T]['fields']>;
};
