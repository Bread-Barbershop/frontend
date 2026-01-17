import type { Meta, StoryObj } from '@storybook/react';
import { ArrowLeft, Plus, Trash2, X, Check, Save } from 'lucide-react';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from './NavigationBar';

const meta = {
  title: 'Molecules/NavigationBar',
  component: NavigationBar,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'gray',
      values: [{ name: 'gray', value: '#e5e5e8' }], // --color-border-slider 변수 값 사용
    },
  },
  decorators: [
    Story => (
      <div className="flex min-h-200px w-full items-center justify-center p-6">
        <div className="w-[335px] bg-bg-base">
          <Story />
        </div>
      </div>
    ),
  ],
  argTypes: {
    children: {
      name: 'Label',
      control: 'text',
      description: '타이틀 중앙에 표시될 텍스트 요소',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    direction: {
      name: 'Action Position',
      control: 'radio',
      defaultValue: 'right',
      options: ['left', 'right'],
      description: '액션 슬롯이 배치될 방향 결정.',
      table: {
        type: { summary: "'left' | 'right'" },
        defaultValue: { summary: 'right' },
      },
    },
    action: {
      name: 'Action Slot',
      control: 'boolean',
      description:
        '액션 버튼의 활성화 여부를 결정하며, true 시 샘플 버튼 렌더링',
      table: {
        type: { summary: 'ReactNode' },
      },
      mapping: {
        false: null,
        true: (
          <UtilityButton variant="primary" size="md">
            <Plus size={16} />
            추가
          </UtilityButton>
        ),
      },
    },
    className: {
      name: 'Custom Style',
      control: 'text',
      description: '컴포넌트 최상위 div에 추가할 CSS 클래스입니다.',
      table: {
        type: { summary: 'string' },
      },
    },
  },
} satisfies Meta<typeof NavigationBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '제목',
  },
};

// ============================================
// Primary Actions - 오른쪽
// ============================================
export const RightActionPrimary: Story = {
  args: {
    children: '목록',
    direction: 'right',
    action: (
      <UtilityButton variant="primary" size="md">
        <Plus size={16} />
        추가
      </UtilityButton>
    ),
  },
};

export const RightActionPrimarySave: Story = {
  args: {
    children: '편집',
    direction: 'right',
    action: (
      <UtilityButton variant="primary" size="md">
        <Save size={16} />
        저장
      </UtilityButton>
    ),
  },
};

export const RightActionPrimaryCheck: Story = {
  args: {
    children: '확인',
    direction: 'right',
    action: (
      <UtilityButton variant="primary" size="md">
        <Check size={16} />
      </UtilityButton>
    ),
  },
};

// ============================================
// Primary Actions - 왼쪽
// ============================================
export const LeftActionPrimary: Story = {
  args: {
    children: '상세보기',
    direction: 'left',
    action: (
      <UtilityButton variant="primary" size="md">
        <ArrowLeft size={16} />
        뒤로
      </UtilityButton>
    ),
  },
};

export const LeftActionPrimaryIconOnly: Story = {
  args: {
    children: '뒤로가기',
    direction: 'left',
    action: (
      <UtilityButton variant="primary" size="md">
        <ArrowLeft size={16} />
      </UtilityButton>
    ),
  },
};

// ============================================
// Danger Actions - 오른쪽
// ============================================
export const RightActionDanger: Story = {
  args: {
    children: '설정',
    direction: 'right',
    action: (
      <UtilityButton variant="danger" size="md">
        <Trash2 size={16} />
        삭제
      </UtilityButton>
    ),
  },
};

export const RightActionDangerClose: Story = {
  args: {
    children: '닫기',
    direction: 'right',
    action: (
      <UtilityButton variant="danger" size="md">
        <X size={16} />
      </UtilityButton>
    ),
  },
};

// ============================================
// Danger Actions - 왼쪽
// ============================================
export const LeftActionDanger: Story = {
  args: {
    children: '취소',
    direction: 'left',
    action: (
      <UtilityButton variant="danger" size="md">
        <X size={16} />
        취소
      </UtilityButton>
    ),
  },
};

// ============================================
// Combinations - 다양한 조합
// ============================================
export const Combinations: Story = {
  args: {
    children: '제목',
  },
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-semibold">Primary 버튼 - 오른쪽</p>
        <NavigationBar direction="right" action={
          <UtilityButton variant="primary" size="md">
            <Plus size={16} />
            추가
          </UtilityButton>
        }>
          목록
        </NavigationBar>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Primary 버튼 - 왼쪽</p>
        <NavigationBar direction="left" action={
          <UtilityButton variant="primary" size="md">
            <ArrowLeft size={16} />
            뒤로
          </UtilityButton>
        }>
          상세보기
        </NavigationBar>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Danger 버튼 - 오른쪽</p>
        <NavigationBar direction="right" action={
          <UtilityButton variant="danger" size="md">
            <Trash2 size={16} />
            삭제
          </UtilityButton>
        }>
          설정
        </NavigationBar>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Primary 저장 / Danger 삭제</p>
        <NavigationBar direction="right" action={
          <div className="flex items-center gap-2">
            <UtilityButton variant="primary" size="md">
              <Save size={16} />
              저장
            </UtilityButton>
            <UtilityButton variant="danger" size="md">
              <Trash2 size={16} />
              삭제
            </UtilityButton>
          </div>
        }>
          편집
        </NavigationBar>
      </div>
    </div>
  ),
};
