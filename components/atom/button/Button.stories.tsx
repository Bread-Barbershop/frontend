import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

const meta = {
  title: 'Atom/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['fill', 'ghost'],
      description: '버튼의 스타일 변형',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '버튼의 크기',
    },
    children: {
      control: 'text',
      description: '버튼 내부 텍스트',
    },
    disabled: {
      control: 'boolean',
      description: '버튼 비활성화 여부',
    },
    onClick: {
      action: 'clicked',
      description: '클릭 이벤트 핸들러',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// 기본 스토리
// ============================================

export const Default: Story = {
  args: {
    children: '버튼',
    variant: 'fill',
    size: 'md',
  },
};

// ============================================
// Variant 별 스토리
// ============================================

export const Fill: Story = {
  args: {
    children: 'Fill 버튼',
    variant: 'fill',
    size: 'md',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost 버튼',
    variant: 'ghost',
    size: 'md',
  },
};

// ============================================
// Size 별 스토리
// ============================================

export const Small: Story = {
  args: {
    children: '작은 버튼',
    variant: 'fill',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: '중간 버튼',
    variant: 'fill',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: '큰 버튼',
    variant: 'fill',
    size: 'lg',
  },
};

// ============================================
// 상태별 스토리
// ============================================

export const Disabled: Story = {
  args: {
    children: '비활성화 버튼',
    variant: 'fill',
    size: 'md',
    disabled: true,
  },
};

export const WithClickHandler: Story = {
  args: {
    children: '클릭해보세요',
    variant: 'fill',
    size: 'md',
    onClick: () => alert('버튼이 클릭되었습니다!'),
  },
};

// ============================================
// Hover & Active 상태 (마우스를 올려보세요!)
// ============================================

export const InteractiveStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="mb-2 text-sm font-semibold">
          Fill 버튼 - 마우스를 올려보세요
        </h4>
        <p className="mb-2 text-xs text-gray-600">
          Hover: 배경색 변경 / Active: 파란색 테두리
        </p>
        <Button variant="fill" size="md">
          Hover & Click Me
        </Button>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold">
          Ghost 버튼 - 마우스를 올려보세요
        </h4>
        <p className="mb-2 text-xs text-gray-600">
          Hover: 파란색 배경 (투명도 8%)
        </p>
        <Button variant="ghost" size="md">
          Hover Me
        </Button>
      </div>
    </div>
  ),
};

// ============================================
// 모든 조합 보기
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-4 text-lg font-bold">Fill Variant</h3>
        <div className="flex gap-4">
          <Button variant="fill" size="sm">
            Small
          </Button>
          <Button variant="fill" size="md">
            Medium
          </Button>
          <Button variant="fill" size="lg">
            Large
          </Button>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold">Ghost Variant</h3>
        <div className="flex gap-4">
          <Button variant="ghost" size="sm">
            Small
          </Button>
          <Button variant="ghost" size="md">
            Medium
          </Button>
          <Button variant="ghost" size="lg">
            Large
          </Button>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold">Disabled State</h3>
        <div className="flex gap-4">
          <Button variant="fill" size="md" disabled>
            Fill Disabled
          </Button>
          <Button variant="ghost" size="md" disabled>
            Ghost Disabled
          </Button>
        </div>
      </div>
    </div>
  ),
};
