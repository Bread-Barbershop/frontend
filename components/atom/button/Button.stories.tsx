import type { Meta, StoryObj } from '@storybook/react';
import { Plus, Search, ArrowRight, X, Download } from 'lucide-react';

import { Button } from './Button';

const meta = {
  title: 'Atom/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'ghost'],
      description: '버튼 스타일 (solid: 배경 있음 / ghost: 투명)',
      defaultValue: 'solid',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '버튼 크기 (solid: 고정폭 / ghost: auto)',
      defaultValue: 'sm',
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
    variant: 'solid',
    size: 'md',
  },
};

// ============================================
// Solid - Size
// ============================================
export const SolidSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">Small - 57×32px</p>
        <Button variant="solid" size="sm">
          Small
        </Button>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Medium - 131×32px</p>
        <Button variant="solid" size="md">
          Medium
        </Button>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Large - 335×32px</p>
        <Button variant="solid" size="lg">
          Large
        </Button>
      </div>
    </div>
  ),
};

// ============================================
// Solid - Active (클릭해보세요)
// ============================================

export const SolidActive: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold">클릭해서 Active 상태 확인</p>
      <div className="flex items-center gap-3">
        <Button variant="solid" size="sm">
          Click
        </Button>
        <Button variant="solid" size="md">
          Click
        </Button>
        <Button variant="solid" size="lg">
          Click
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        클릭(Active) 시 파란색 테두리가 나타납니다
      </p>
    </div>
  ),
};

// ============================================
// Solid - Disabled
// ============================================

export const SolidDisabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold">비활성화 상태</p>
      <div className="flex items-center gap-3">
        <Button variant="solid" size="sm" disabled>
          Disabled
        </Button>
        <Button variant="solid" size="md" disabled>
          Disabled
        </Button>
        <Button variant="solid" size="lg" disabled>
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
// Ghost - Size
// ============================================

export const GhostSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">
          Small - 32px 높이, 너비 auto
        </p>
        <Button variant="ghost" size="sm">
          구룹추가
        </Button>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">
          Medium - 44px 높이, 너비 auto
        </p>
        <Button variant="ghost" size="md">
          구룹추가
        </Button>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">
          Large - 44px 높이, 너비 auto
        </p>
        <Button variant="ghost" size="lg">
          구룹추가
        </Button>
      </div>
    </div>
  ),
};

// ============================================
// Ghost - Hover (마우스 올려보세요)
// ============================================

export const GhostHover: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold">마우스를 올려보세요</p>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm">
          구룹추가
        </Button>
        <Button variant="ghost" size="md">
          구룹추가
        </Button>
      </div>
      <p className="text-xs text-gray-500">Hover 시 스타일 변화를 확인하세요</p>
    </div>
  ),
};

// ============================================
// Ghost - Disabled
// ============================================

export const GhostDisabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold">비활성화 상태</p>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" disabled>
          구룹추가
        </Button>
        <Button variant="ghost" size="md" disabled>
          구룹추가
        </Button>
      </div>
      <p className="text-xs text-gray-500">클릭 불가</p>
    </div>
  ),
};

// ============================================
// With Icon - 아이콘 크기
// ============================================

export const IconSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-semibold">아이콘 크기 (Small - 12px)</p>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <Button.Icon size="sm">
              <Plus />
            </Button.Icon>
            구룹추가
          </Button>
          <Button variant="solid" size="md">
            <Button.Icon size="sm">
              <Plus />
            </Button.Icon>
            구룹추가
          </Button>
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">
          아이콘 크기 (Medium - 16px)
        </p>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="md">
            <Button.Icon size="md">
              <Plus />
            </Button.Icon>
            구룹추가
          </Button>
          <Button variant="solid" size="md">
            <Button.Icon size="md">
              <Search />
            </Button.Icon>
            검색
          </Button>
        </div>
      </div>
    </div>
  ),
};

// ============================================
// With Icon - 아이콘 위치 (왼쪽)
// ============================================

export const IconLeft: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold">아이콘 왼쪽 배치</p>
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm">
          <Button.Icon size="sm">
            <Plus />
          </Button.Icon>
          추가
        </Button>
        <Button variant="ghost" size="sm">
          <Button.Icon size="sm">
            <Search />
          </Button.Icon>
          검색
        </Button>
        <Button variant="solid" size="md">
          <Button.Icon size="sm">
            <Download />
          </Button.Icon>
          다운로드
        </Button>
        <Button variant="solid" size="md">
          <Button.Icon size="sm">
            <ArrowRight />
          </Button.Icon>
          다음
        </Button>
      </div>
    </div>
  ),
};

// ============================================
// With Icon - 아이콘 위치 (오른쪽)
// ============================================

export const IconRight: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold">아이콘 오른쪽 배치</p>
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm">
          닫기
          <Button.Icon size="sm">
            <X />
          </Button.Icon>
        </Button>
        <Button variant="ghost" size="sm">
          검색
          <Button.Icon size="sm">
            <Search />
          </Button.Icon>
        </Button>
        <Button variant="solid" size="md">
          다음
          <Button.Icon size="sm">
            <ArrowRight />
          </Button.Icon>
        </Button>
        <Button variant="solid" size="md">
          다운로드
          <Button.Icon size="sm">
            <Download />
          </Button.Icon>
        </Button>
      </div>
    </div>
  ),
};

// ============================================
// With Icon - 아이콘만
// ============================================

export const IconOnly: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold">아이콘만 있는 버튼</p>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm">
          <Button.Icon size="sm">
            <Plus />
          </Button.Icon>
        </Button>
        <Button variant="ghost" size="sm">
          <Button.Icon size="sm">
            <Search />
          </Button.Icon>
        </Button>
        <Button variant="ghost" size="sm">
          <Button.Icon size="sm">
            <X />
          </Button.Icon>
        </Button>
        <Button variant="solid" size="sm">
          <Button.Icon size="sm">
            <Plus />
          </Button.Icon>
        </Button>
        <Button variant="solid" size="sm">
          <Button.Icon size="sm">
            <Download />
          </Button.Icon>
        </Button>
      </div>
    </div>
  ),
};

// ============================================
// With Icon - 다양한 조합
// ============================================

export const IconCombinations: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-semibold">Ghost Variant</p>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="sm">
            <Button.Icon size="sm">
              <Plus />
            </Button.Icon>
            구룹추가
          </Button>
          <Button variant="ghost" size="md">
            <Button.Icon size="md">
              <Search />
            </Button.Icon>
            검색하기
          </Button>
          <Button variant="ghost" size="lg">
            <Button.Icon size="md">
              <Download />
            </Button.Icon>
            파일 다운로드
          </Button>
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Solid Variant</p>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="solid" size="sm">
            <Button.Icon size="sm">
              <Plus />
            </Button.Icon>
            추가
          </Button>
          <Button variant="solid" size="md">
            <Button.Icon size="sm">
              <Search />
            </Button.Icon>
            검색
          </Button>
          <Button variant="solid" size="lg">
            <Button.Icon size="md">
              <ArrowRight />
            </Button.Icon>
            다음 단계로
          </Button>
        </div>
      </div>
    </div>
  ),
};

// ============================================
// With Icon - Disabled
// ============================================

export const IconDisabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold">아이콘이 있는 버튼 비활성화</p>
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" disabled>
          <Button.Icon size="sm">
            <Plus />
          </Button.Icon>
          구룹추가
        </Button>
        <Button variant="ghost" size="md" disabled>
          <Button.Icon size="md">
            <Search />
          </Button.Icon>
          검색
        </Button>
        <Button variant="solid" size="md" disabled>
          <Button.Icon size="sm">
            <Download />
          </Button.Icon>
          다운로드
        </Button>
        <Button variant="solid" size="sm" disabled>
          <Button.Icon size="sm">
            <X />
          </Button.Icon>
        </Button>
      </div>
    </div>
  ),
};
