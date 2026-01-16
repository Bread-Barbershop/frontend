import type { Meta, StoryObj } from '@storybook/react';
import { ArrowLeftIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { Title } from './Title';

const meta = {
  title: 'Molecules/Title',
  component: Title,
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
          <Button variant="ghost" size="md">
            샘플 문구
            <PlusIcon size={14} />
          </Button>
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
} satisfies Meta<typeof Title>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '제목',
  },
};

export const RightAction: Story = {
  args: {
    children: '오른쪽 액션',
    direction: 'right',
    action: (
      <Button variant="ghost" size="md">
        샘플 문구
        <PlusIcon size={14} />
      </Button>
    ),
  },
};

export const LeftAction: Story = {
  args: {
    children: '왼쪽 액션',
    direction: 'left',
    action: (
      <Button variant="ghost" size="md">
        <ArrowLeftIcon size={14} />
        뒤로
      </Button>
    ),
  },
};
