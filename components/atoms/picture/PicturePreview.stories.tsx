import type { Meta, StoryObj } from '@storybook/react';

import { PicturePreview } from './PicturePreview';

const meta = {
  title: 'Atoms/PicturePreview',
  component: PicturePreview,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    src: {
      control: 'text',
      description: '이미지 소스 URL',
    },
    onDelete: { action: 'deleted' },
  },
  args: {
    onDelete: (src: string) => console.log('Delete:', src),
  },
} satisfies Meta<typeof PicturePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop',
    alt: '미리보기 이미지',
  },
  render: args => (
    <div className="w-[100px] h-[100px]">
      <PicturePreview {...args} />
    </div>
  ),
};
