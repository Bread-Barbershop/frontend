import type { Meta, StoryObj } from '@storybook/react';

import { MultiRowInput } from './MultiRowInput';

const meta = {
  title: 'Atoms/MultiRowInput',
  component: MultiRowInput,
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder 텍스트',
      type: 'string',
      defaultValue: '입력하세요',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
      type: 'boolean',
      defaultValue: false,
    },
    rows: {
      control: 'number',
      description: '텍스트 영역의 행 수',
      type: 'number',
      defaultValue: 4,
    },
  },
} satisfies Meta<typeof MultiRowInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Default - Docs에서 Controls로 테스트
// ============================================

export const Default: Story = {
  args: {
    placeholder: '여러 줄 텍스트를 입력하세요',
    rows: 4,
  },
};

// ============================================
// Basic States
// ============================================

export const BasicStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <div>
        <p className="mb-2 text-xs text-gray-500">기본 상태</p>
        <MultiRowInput placeholder="텍스트를 입력하세요" rows={4} />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">값이 입력된 상태</p>
        <MultiRowInput defaultValue="입력된 텍스트입니다." rows={4} />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Focus 상태 (클릭해보세요)</p>
        <MultiRowInput placeholder="클릭하면 파란색 테두리" rows={4} />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">비활성화 상태</p>
        <MultiRowInput placeholder="비활성화됨" disabled rows={4} />
      </div>
    </div>
  ),
};
