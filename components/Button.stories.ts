import { Button } from './Button';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Example/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 스토리북용 시각적 이벤트
export const Primary: Story = {
  args: {
    primary: true,
    children: 'Button',
    onClick: () => alert('Primary 버튼 클릭!'),
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    children: 'Button',
    onClick: () => alert('Large 버튼 클릭!'),
  },
};
