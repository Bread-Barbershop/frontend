import Greeting from './Greeting';
import GreetingPreview from './GreetingPreview';

import type { JSONContent } from '@tiptap/react';

export const greetingDefinition = {
  viewComponent: GreetingPreview,
  editComponent: Greeting,
  type: null,
  fields: {
    title: {
      default: '인사말',
      required: true,
    },
    messageJson: {
      default: null as JSONContent | null,
      required: false,
    },
  },
};
