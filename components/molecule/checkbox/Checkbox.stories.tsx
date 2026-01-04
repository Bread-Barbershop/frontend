import type { Meta, StoryObj } from '@storybook/react';

import { Checkbox } from './Checkbox';

const meta = {
  title: 'Molecule/Checkbox',
  component: Checkbox,
  argTypes: {
    defaultChecked: {
      control: 'boolean',
      description: '체크 상태',
      type: 'boolean',
      defaultValue: false,
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
      type: 'boolean',
      defaultValue: false,
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof Checkbox>;

// ============================================
// Default
// ============================================
export const Default: Story = {
  args: {
    children: '체크박스 라벨',
    defaultChecked: false,
  },
};

// ============================================
// States
// ============================================
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox defaultChecked={false}>Unchecked</Checkbox>
      <Checkbox defaultChecked={true}>Checked</Checkbox>
      <Checkbox defaultChecked={false} disabled>
        Disabled - Unchecked
      </Checkbox>
      <Checkbox defaultChecked={true} disabled>
        Disabled - Checked
      </Checkbox>
    </div>
  ),
};
