import type { Meta, StoryObj } from '@storybook/react';

import { Label } from './Label';

const meta = {
  title: 'Atom/Label',
  component: Label,
  argTypes: {
    children: {
      control: 'text',
      description: 'Label 텍스트',
      type: 'string',
      defaultValue: 'Label',
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
  },
};

// ============================================
// Basic Examples
// ============================================
export const BasicExamples: Story = {
  args: { children: 'Label' },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-400">기본 Label</p>
        <Label>이름</Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">긴 텍스트</p>
        <Label>사용자의 이메일 주소를 입력해주세요</Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">짧은 텍스트</p>
        <Label>ID</Label>
      </div>
    </div>
  ),
};

// ============================================
// Text Colors
// ============================================
export const TextColors: Story = {
  args: { children: 'Label' },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-400">기본 (text-black)</p>
        <Label>검정색 텍스트</Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">text-gray-500</p>
        <Label className="text-gray-500">중간 회색</Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">text-gray-300</p>
        <Label className="text-gray-300">연한 회색</Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">
          text-[#1F72EF] (커스텀 색상)
        </p>
        <Label className="text-[#1F72EF]">파란색 텍스트</Label>
      </div>
    </div>
  ),
};

// ============================================
// Font Sizes
// ============================================
export const FontSizes: Story = {
  args: { children: 'Label' },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-400">text-xs (12px)</p>
        <Label className="text-xs">작은 크기 텍스트</Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">text-base (16px)</p>
        <Label className="text-base">중간 크기 텍스트</Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">text-lg (18px)</p>
        <Label className="text-lg">큰 크기 텍스트</Label>
      </div>
    </div>
  ),
};

// ============================================
// Font Weights
// ============================================
export const FontWeights: Story = {
  args: { children: 'Label' },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-400">font-normal (기본)</p>
        <Label>일반 두께</Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">font-medium</p>
        <Label className="font-medium">중간 두께</Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">font-semibold</p>
        <Label className="font-semibold">세미볼드</Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">font-bold</p>
        <Label className="font-bold">굵은 두께</Label>
      </div>
    </div>
  ),
};

// ============================================
// Combinations
// ============================================
export const Combinations: Story = {
  args: { children: 'Label' },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-400">큰 + 굵은 + 파란색</p>
        <Label className="text-lg font-bold text-[#1F72EF]">중요한 라벨</Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">작은 + 회색</p>
        <Label className="text-xs text-gray-500">부가 설명 라벨</Label>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-400">기본 + 세미볼드</p>
        <Label className="font-semibold">일반 라벨</Label>
      </div>
    </div>
  ),
};
