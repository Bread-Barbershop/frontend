import type { Meta, StoryObj } from '@storybook/react';

import { ActionField } from './ActionField';

const meta = {
  title: 'Molecules/ActionField',
  component: ActionField,
  decorators: [
    Story => (
      <div className="flex min-h-200px w-full items-center justify-center p-6">
        <div className="w-[335px] bg-white">
          <Story />
        </div>
      </div>
    ),
  ],
  argTypes: {
    label: {
      control: 'text',
      description: '라벨 텍스트',
      type: 'string',
    },
    id: {
      control: 'text',
      description: '고유 아이디',
      type: 'string',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
      type: 'boolean',
      defaultValue: false,
    },
    className: {
      control: 'text',
      description: '커스텀 스타일 클래스',
      type: 'string',
    },
  },
} satisfies Meta<typeof ActionField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'ActionField',
    inputProps: {
      placeholder: '입력하세요',
    },
    buttonProps: {
      children: 'Action',
    },
  },
};

export const Disabled: Story = {
  args: {
    label: 'ActionField',
    disabled: true,
    inputProps: {
      placeholder: '입력하세요',
    },
    buttonProps: {
      children: 'Action',
    },
  },
};

export const WithButtonVariants: Story = {
  args: {
    label: 'ActionField',
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <ActionField
        label="Solid Button"
        inputProps={{ placeholder: '입력하세요' }}
        buttonProps={{ variant: 'solid', size: 'md', children: 'Action' }}
      />
      <ActionField
        label="Ghost Button"
        inputProps={{ placeholder: '입력하세요' }}
        buttonProps={{ variant: 'ghost', size: 'md', children: 'Action' }}
      />
    </div>
  ),
};
