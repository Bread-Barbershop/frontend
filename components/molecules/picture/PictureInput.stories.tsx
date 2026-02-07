import type { Meta, StoryObj } from '@storybook/react';

import { PictureInput } from './PictureInput';

const meta = {
  title: 'Atoms/PictureInput',
  component: PictureInput,
  argTypes: {
    className: {
      control: 'text',
      description: '추가 스타일 클래스',
    },
  },
} satisfies Meta<typeof PictureInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Default – Controls로 테스트
// ============================================
export const Default: Story = {
  args: {},
};

// ============================================
// Basic States
// ============================================
export const BasicStates: Story = {
  render: () => (
    <div className="flex gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">기본 상태</p>
        <PictureInput />
      </div>

      <div>
        <p className="mb-2 text-xs text-gray-500">이미지 선택 후 (직접 클릭)</p>
        <PictureInput />
      </div>

      <div>
        <p className="mb-2 text-xs text-gray-500">커스텀 사이즈</p>
        <PictureInput className="w-24 h-24" />
      </div>
    </div>
  ),
};
