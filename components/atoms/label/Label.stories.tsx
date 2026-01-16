import type { Meta, StoryObj } from '@storybook/react';

import { Label } from './Label';

const meta = {
  title: 'Atoms/Label',
  component: Label,
  argTypes: {
    children: {
      control: 'text',
      description: 'Label 텍스트',
      type: 'string',
      defaultValue: 'Label',
    },
    htmlFor: {
      control: 'text',
      description: 'Label과 연결될 input의 id',
      type: 'string',
      defaultValue: 'input-id',
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Default - Docs에서 Controls로 테스트
// ============================================

export const Default: Story = {
  args: {
    children: 'Label',
    htmlFor: 'input-id',
  },
};

// ============================================
// Basic Examples
// ============================================
export const BasicExamples: Story = {
  args: { htmlFor: 'example', children: 'Label' },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-400">기본 Label</p>
        <Label htmlFor="name">이름</Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">아주 긴~ 텍스트</p>
        <Label htmlFor="email">사용자의 이메일 주소를 입력해주세요</Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">짧은 텍스트</p>
        <Label htmlFor="id">ID</Label>
      </div>
    </div>
  ),
};

// ============================================
// Text Colors
// ============================================
export const TextColors: Story = {
  args: { htmlFor: 'example', children: 'Label' },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-400">기본 (text-black)</p>
        <Label htmlFor="input-1">검정색 텍스트</Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">text-gray-500</p>
        <Label htmlFor="input-2" className="text-gray-500">
          중간 회색
        </Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">text-gray-300</p>
        <Label htmlFor="input-3" className="text-gray-300">
          연한 회색
        </Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">
          text-primary (CSS 변수 사용)
        </p>
        <Label htmlFor="input-4" className="text-primary">
          파란색 텍스트
        </Label>
      </div>
    </div>
  ),
};

// ============================================
// Font Sizes
// ============================================
export const FontSizes: Story = {
  args: { htmlFor: 'example', children: 'Label' },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-400">text-xs (12px)</p>
        <Label htmlFor="input-5" className="text-xs">
          작은 크기 텍스트
        </Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">text-base (16px)</p>
        <Label htmlFor="input-6" className="text-base">
          중간 크기 텍스트
        </Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">text-lg (18px)</p>
        <Label htmlFor="input-7" className="text-lg">
          큰 크기 텍스트
        </Label>
      </div>
    </div>
  ),
};

// ============================================
// Font Weights
// ============================================
export const FontWeights: Story = {
  args: { htmlFor: 'example', children: 'Label' },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-400">font-normal (기본)</p>
        <Label htmlFor="input-8">일반 두께</Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">font-medium</p>
        <Label htmlFor="input-9" className="font-medium">
          중간 두께
        </Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">font-semibold</p>
        <Label htmlFor="input-10" className="font-semibold">
          세미볼드
        </Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">font-bold</p>
        <Label htmlFor="input-11" className="font-bold">
          굵은 두께
        </Label>
      </div>
    </div>
  ),
};

// ============================================
// Combinations
// ============================================
export const Combinations: Story = {
  args: { htmlFor: 'example', children: 'Label' },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-400">큰 + 굵은 + 파란색</p>
        <Label htmlFor="input-12" className="text-lg font-bold text-primary">
          중요한 라벨
        </Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">작은 + 회색</p>
        <Label htmlFor="input-13" className="text-xs text-gray-500">
          부가 설명 라벨
        </Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">기본 + 세미볼드</p>
        <Label htmlFor="input-14" className="font-semibold">
          일반 라벨
        </Label>
      </div>
    </div>
  ),
};
