import type { Meta, StoryObj } from '@storybook/react';

import { Input } from './Input';

const meta = {
  title: 'Atom/Input',
  component: Input,
  argTypes: {
    size: {
      control: 'select',
      options: ['fixed', 'full'],
      description: 'Input 크기 (fixed: 65px / full: 100%)',
      defaultValue: 'full',
    },
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
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Default - Docs에서 Controls로 테스트
// ============================================

export const Default: Story = {
  args: {
    placeholder: '입력',
    size: 'full',
  },
};

// ============================================
// Sizes - Size Variants
// ============================================

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-semibold">Fixed - 65px 고정 너비</p>
        <div className="flex items-center gap-3">
          <Input size="fixed" placeholder="00" />
          <Input size="fixed" placeholder="99" />
          <Input size="fixed" placeholder="100" />
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Full - 전체 너비</p>
        <div className="max-w-md">
          <Input size="full" placeholder="텍스트를 입력하세요" />
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Combined - 조합 사용</p>
        <div className="flex items-center gap-3 max-w-md">
          <Input size="fixed" placeholder="65" />
          <span className="text-gray-500">-</span>
          <Input size="fixed" placeholder="65" />
          <span className="text-gray-500">-</span>
          <Input size="fixed" placeholder="65" />
        </div>
      </div>
    </div>
  ),
};

// ============================================
// Basic States
// ============================================

export const BasicStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <div>
        <p className="mb-2 text-xs text-gray-500">기본 상태</p>
        <Input placeholder="텍스트를 입력하세요" />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">값이 입력된 상태</p>
        <Input defaultValue="입력된 텍스트" />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Focus 상태 (클릭해보세요)</p>
        <Input placeholder="클릭하면 파란색 테두리" />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">비활성화 상태</p>
        <Input placeholder="비활성화됨" disabled />
      </div>
    </div>
  ),
};

// ============================================
// Fixed Size Examples
// ============================================
export const FixedSizeExamples: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-semibold">숫자 입력</p>
        <div className="flex items-center gap-2">
          <Input size="fixed" type="number" placeholder="0" />
          <Input size="fixed" type="number" placeholder="0" />
          <Input size="fixed" type="number" placeholder="0" />
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">날짜 입력 형식</p>
        <div className="flex items-center gap-2">
          <Input
            size="fixed"
            type="number"
            placeholder="2024"
            className="w-[80px]"
          />
          <span className="text-gray-500">-</span>
          <Input size="fixed" type="number" placeholder="01" />
          <span className="text-gray-500">-</span>
          <Input size="fixed" type="number" placeholder="01" />
        </div>
      </div>
    </div>
  ),
};

// ============================================
// Full Size Examples
// ============================================
export const FullSizeExamples: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <div>
        <p className="mb-2 text-xs text-gray-500">메시지</p>
        <Input size="full" placeholder="메시지를 입력하세요" />
      </div>
    </div>
  ),
};

// ============================================
// Disabled States
// ============================================

export const DisabledStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-semibold">Fixed Size - Disabled</p>
        <div className="flex items-center gap-3">
          <Input size="fixed" placeholder="00" disabled />
          <Input size="fixed" defaultValue="50" disabled />
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Full Size - Disabled</p>
        <div className="max-w-md flex flex-col gap-3">
          <Input size="full" placeholder="비활성화됨" disabled />
          <Input size="full" defaultValue="수정할 수 없습니다" disabled />
        </div>
      </div>
    </div>
  ),
};
