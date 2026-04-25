import type { Meta, StoryObj } from '@storybook/react';

import { Divider } from './Divider';

const meta = {
  title: 'Atoms/Divider',
  component: Divider,
  argTypes: {
    padding: {
      control: 'radio',
      options: ['left', 'none'],
      description: '왼쪽 여백 여부',
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    padding: 'left',
  },
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
  },
};
