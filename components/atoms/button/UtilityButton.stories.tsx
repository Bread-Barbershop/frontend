import type { Meta, StoryObj } from '@storybook/react';
import { Check, Save, Plus, Download, Upload, ArrowRight } from 'lucide-react';

import { UtilityButton } from './UtilityButton';

const meta = {
  title: 'Atoms/UtilityButton',
  component: UtilityButton,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'danger'],
      description: '버튼 스타일 (primary: 기본 / danger: 위험)',
      defaultValue: 'primary',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: '버튼 크기 (sm: 32px / md: 44px)',
      defaultValue: 'sm',
    },
    children: {
      control: 'text',
      description: '버튼 텍스트',
      type: 'string',
      defaultValue: 'Utility Button',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
      type: 'boolean',
      defaultValue: false,
    },
  },
} satisfies Meta<typeof UtilityButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Default - Docs에서 Controls로 테스트
// ============================================
export const Default: Story = {
  args: {
    children: 'Utility Button',
    variant: 'primary',
    size: 'sm',
  },
};

// ============================================
// Variant - Primary vs Danger
// ============================================
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">Primary - 기본 스타일</p>
        <UtilityButton variant="primary" size="md">
          Primary Button
        </UtilityButton>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Danger - 위험 작업용 (빨간색)</p>
        <UtilityButton variant="danger" size="md">
          Danger Button
        </UtilityButton>
      </div>
    </div>
  ),
};

// ============================================
// Size - Small vs Medium
// ============================================
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">Small - height: 32px</p>
        <div className="flex items-center gap-3">
          <UtilityButton variant="primary" size="sm">
            Small Primary
          </UtilityButton>
          <UtilityButton variant="danger" size="sm">
            Small Danger
          </UtilityButton>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Medium - height: 44px</p>
        <div className="flex items-center gap-3">
          <UtilityButton variant="primary" size="md">
            Medium Primary
          </UtilityButton>
          <UtilityButton variant="danger" size="md">
            Medium Danger
          </UtilityButton>
        </div>
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
        <UtilityButton variant="primary" size="md">
          Primary Hover
        </UtilityButton>
        <UtilityButton variant="danger" size="md">
          Danger Hover
        </UtilityButton>
      </div>
      <p className="text-xs text-gray-500">
        Primary: 배경색 변경 / Danger: 빨간 배경색 변경
      </p>
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
        <UtilityButton variant="primary" size="md">
          Primary Active
        </UtilityButton>
        <UtilityButton variant="danger" size="md">
          Danger Active
        </UtilityButton>
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
        <UtilityButton variant="primary" size="sm" disabled>
          Disabled Primary
        </UtilityButton>
        <UtilityButton variant="primary" size="md" disabled>
          Disabled Primary
        </UtilityButton>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <UtilityButton variant="danger" size="sm" disabled>
          Disabled Danger
        </UtilityButton>
        <UtilityButton variant="danger" size="md" disabled>
          Disabled Danger
        </UtilityButton>
      </div>
      <p className="text-xs text-gray-500">
        반투명, 클릭 불가, 텍스트 색상 변경
      </p>
    </div>
  ),
};

// ============================================
// Primary with Icons - Primary 버튼에 아이콘 추가
// ============================================
export const PrimaryWithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-semibold">아이콘 좌측 배치</p>
        <div className="flex flex-wrap items-center gap-3">
          <UtilityButton variant="primary" size="sm">
            <Save size={14} />
            저장
          </UtilityButton>
          <UtilityButton variant="primary" size="md">
            <Check size={16} />
            확인
          </UtilityButton>
          <UtilityButton variant="primary" size="md">
            <Plus size={16} />
            추가
          </UtilityButton>
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">아이콘 우측 배치</p>
        <div className="flex flex-wrap items-center gap-3">
          <UtilityButton variant="primary" size="sm">
            다운로드
            <Download size={14} />
          </UtilityButton>
          <UtilityButton variant="primary" size="md">
            업로드
            <Upload size={16} />
          </UtilityButton>
          <UtilityButton variant="primary" size="md">
            다음
            <ArrowRight size={16} />
          </UtilityButton>
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">아이콘만</p>
        <div className="flex flex-wrap items-center gap-3">
          <UtilityButton variant="primary" size="sm">
            <Plus size={14} />
          </UtilityButton>
          <UtilityButton variant="primary" size="md">
            <Save size={16} />
          </UtilityButton>
          <UtilityButton variant="primary" size="md">
            <Check size={20} />
          </UtilityButton>
        </div>
      </div>
    </div>
  ),
};

// ============================================
// Combinations - 다양한 조합
// ============================================
export const Combinations: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-semibold">Variant & Size 조합</p>
        <div className="flex flex-wrap items-center gap-3">
          <UtilityButton variant="primary" size="sm">
            Primary Small
          </UtilityButton>
          <UtilityButton variant="primary" size="md">
            Primary Medium
          </UtilityButton>
          <UtilityButton variant="danger" size="sm">
            Danger Small
          </UtilityButton>
          <UtilityButton variant="danger" size="md">
            Danger Medium
          </UtilityButton>
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Primary 버튼 - 아이콘 포함 실제 사용 예시</p>
        <div className="flex flex-wrap items-center gap-3">
          <UtilityButton variant="primary" size="md">
            <Save size={16} />
            저장
          </UtilityButton>
          <UtilityButton variant="primary" size="md">
            <Check size={16} />
            확인
          </UtilityButton>
          <UtilityButton variant="primary" size="md">
            다음
            <ArrowRight size={16} />
          </UtilityButton>
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Danger 버튼 예시</p>
        <div className="flex flex-wrap items-center gap-3">
          <UtilityButton variant="danger" size="md">
            삭제
          </UtilityButton>
          <UtilityButton variant="danger" size="md">
            취소
          </UtilityButton>
        </div>
      </div>
    </div>
  ),
};
