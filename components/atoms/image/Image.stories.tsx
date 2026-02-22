import type { Meta, StoryObj } from '@storybook/react';

import { Image } from './Image';

const meta = {
  title: 'Atoms/Image',
  component: Image,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    fill: {
      control: 'boolean',
      description: '부모 컨테이너를 채울지 여부',
    },
    src: {
      control: 'text',
      description: '이미지 소스 URL',
    },
    alt: {
      control: 'text',
      description: '이미지 태그의 alt 속성',
    },
  },
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop',
    alt: '기본 이미지',
    width: 300,
    height: 300,
    className: 'rounded-lg',
  },
};

export const Fill: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop',
    alt: 'Fill 이미지',
    fill: true,
    className: 'object-cover rounded-lg',
  },
  render: args => (
    <div className="w-[400px] h-[300px]">
      <Image {...args} />
    </div>
  ),
};

export const Skeleton: Story = {
  args: {
    src: 'https://invalid-image-url.com/nothing.jpg',
    alt: '스켈레톤 테스트',
    width: 300,
    height: 300,
  },
  parameters: {
    docs: {
      description: {
        story:
          '이미지가 로드되기 전이나 로드에 실패했을 때 스켈레톤 UI가 유지됩니다.',
      },
    },
  },
};
