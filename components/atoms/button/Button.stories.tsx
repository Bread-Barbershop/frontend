import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';
import { PlusIcon } from 'lucide-react';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['bordered', 'borderless'],
      description: '버튼 스타일 (bordered: 테두리 있음 / borderless: 테두리 없음)',
      defaultValue: 'bordered',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '버튼 크기 (sm: 57px / md: 131px / lg: 335px)',
      defaultValue: 'sm',
    },
    shadow: {
      control: 'select',
      options: ['default', 'custom'],
      description: '그림자 효과 (default: 없음 / custom: 커스텀 그림자)',
      defaultValue: 'default',
    },
    children: {
      control: 'text',
      description: '버튼 텍스트',
      type: 'string',
      defaultValue: 'Button',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
      type: 'boolean',
      defaultValue: false,
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Default - Docs에서 Controls로 테스트
// ============================================
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'bordered',
    size: 'md',
    shadow: 'default',
  },
};

// ============================================
// Variant - Bordered vs Borderless
// ============================================
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">Bordered - 테두리 있음</p>
        <Button variant="bordered" size="md">
          Bordered Button
        </Button>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Borderless - 테두리 없음, 투명 배경</p>
        <Button variant="borderless" size="md">
          Borderless Button
        </Button>
      </div>
    </div>
  ),
};

// ============================================
// Size - Small, Medium, Large
// ============================================
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">Small - 57×32px</p>
        <Button variant="bordered" size="sm">
          Small
        </Button>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Medium - 131×32px</p>
        <Button variant="bordered" size="md">
          Medium
        </Button>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Large - 335×32px</p>
        <Button variant="bordered" size="lg">
          Large
        </Button>
      </div>
    </div>
  ),
};

// ============================================
// Shadow - Default vs Custom
// ============================================
export const Shadows: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">Default - 그림자 없음</p>
        <Button variant="bordered" size="md" shadow="default">
          Default Shadow
        </Button>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Custom - 커스텀 그림자</p>
        <Button variant="bordered" size="md" shadow="custom">
          Custom Shadow
        </Button>
      </div>
    </div>
  ),
};

// ============================================
// States - Hover (마우스 올려보세요)
// ============================================
export const Hover: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold">마우스를 올려보세요</p>
      <div className="flex items-center gap-3">
        <Button variant="bordered" size="sm">
          Hover
        </Button>
        <Button variant="bordered" size="md">
          Hover
        </Button>
        <Button variant="bordered" size="lg">
          Hover
        </Button>
      </div>
      <p className="text-xs text-gray-500">Hover 시 배경색이 변경됩니다</p>
    </div>
  ),
};

// ============================================
// States - Active (클릭해보세요)
// ============================================
export const Active: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold">클릭해서 Active 상태 확인</p>
      <div className="flex items-center gap-3">
        <Button variant="bordered" size="sm">
          Click
        </Button>
        <Button variant="bordered" size="md">
          Click
        </Button>
        <Button variant="bordered" size="lg">
          Click
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        클릭(Active) 시 배경색이 변경됩니다
      </p>
    </div>
  ),
};

// ============================================
// States - Disabled
// ============================================
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold">비활성화 상태</p>
      <div className="flex items-center gap-3">
        <Button variant="bordered" size="sm" disabled>
          Disabled
        </Button>
        <Button variant="bordered" size="md" disabled>
          Disabled
        </Button>
        <Button variant="bordered" size="lg" disabled>
          Disabled
        </Button>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <Button variant="borderless" size="sm" disabled>
          Disabled
        </Button>
        <Button variant="borderless" size="md" disabled>
          Disabled
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        반투명, 클릭 불가, Active 스타일 없음
      </p>
    </div>
  ),
};

// ============================================
// Icon With Button
// ============================================
export const IconWithButton: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold">아이콘 좌우 배치</p>
      <div className="flex items-center gap-3">
        <Button size="md">
          그룹추가
          <PlusIcon size={14} />
        </Button>
        <Button size="md">
          <PlusIcon size={16} />
          그룹추가
        </Button>
      </div>
      <p className="text-xs text-gray-500">아이콘 좌우 배치 가능</p>
    </div>
  ),
};

// ============================================
// Combinations
// ============================================
export const Combinations: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-semibold">Bordered 버튼 조합</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="bordered" size="sm" shadow="default">
            Small
          </Button>
          <Button variant="bordered" size="md" shadow="default">
            Medium
          </Button>
          <Button variant="bordered" size="lg" shadow="custom">
            Large Custom
          </Button>
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Borderless 버튼 조합</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="borderless" size="sm">
            Small
          </Button>
          <Button variant="borderless" size="md">
            Medium
          </Button>
          <Button variant="borderless" size="lg">
            Large
          </Button>
        </div>
      </div>
    </div>
  ),
};
