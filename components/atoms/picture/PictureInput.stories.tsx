import type { Meta, StoryObj } from '@storybook/react';

import { PictureInput } from './PictureInput';

const meta = {
  title: 'Atoms/PictureInput',
  component: PictureInput,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    multiple: {
      control: 'boolean',
      description: '여러 파일 선택 가능 여부',
    },
    onChange: { action: 'changed' },
  },
} satisfies Meta<typeof PictureInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    multiple: false,
  },
};

export const Multiple: Story = {
  args: {
    multiple: true,
  },
};
