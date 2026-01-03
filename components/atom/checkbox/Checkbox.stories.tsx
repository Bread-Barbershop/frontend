import type { Meta, StoryObj } from '@storybook/react';

import { CheckBox } from './Checkbox';

const meta = {
  title: 'Atom/CheckBox',
  component: CheckBox,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Checkbox 크기 (sm: 14px / md: 20px / lg: 24px)',
      defaultValue: 'sm',
    },
    checked: {
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
} satisfies Meta<typeof CheckBox>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Default - Docs에서 Controls로 테스트
// ============================================
export const Default: Story = {
  args: {
    size: 'md',
    checked: false,
  },
};

// ============================================
// Sizes
// ============================================
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">Small - 14×14px</p>
        <div className="flex items-center gap-3">
          <CheckBox size="sm" checked={false} />
          <CheckBox size="sm" checked={true} />
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Medium - 20×20px (기본)</p>
        <div className="flex items-center gap-3">
          <CheckBox size="md" checked={false} />
          <CheckBox size="md" checked={true} />
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Large - 24×24px</p>
        <div className="flex items-center gap-3">
          <CheckBox size="lg" checked={false} />
          <CheckBox size="lg" checked={true} />
        </div>
      </div>
    </div>
  ),
};

// ============================================
// States
// ============================================
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">Unchecked (기본)</p>
        <CheckBox size="md" checked={false} />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Checked</p>
        <CheckBox size="md" checked={true} />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Disabled - Unchecked</p>
        <CheckBox size="md" checked={false} disabled />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Disabled - Checked</p>
        <CheckBox size="md" checked={true} disabled />
      </div>
    </div>
  ),
};
