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
} satisfies Meta<typeof CheckBox>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Default - Docs에서 Controls로 테스트
// ============================================
export const Default: Story = {
  args: {
    size: 'md',
    defaultChecked: false,
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
          <CheckBox size="sm" defaultChecked={false} />
          <CheckBox size="sm" defaultChecked={true} />
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Medium - 20×20px (기본)</p>
        <div className="flex items-center gap-3">
          <CheckBox size="md" defaultChecked={false} />
          <CheckBox size="md" defaultChecked={true} />
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Large - 24×24px</p>
        <div className="flex items-center gap-3">
          <CheckBox size="lg" defaultChecked={false} />
          <CheckBox size="lg" defaultChecked={true} />
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
        <CheckBox size="md" defaultChecked={false} />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Checked</p>
        <CheckBox size="md" defaultChecked={true} />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Disabled - Unchecked</p>
        <CheckBox size="md" defaultChecked={false} disabled />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Disabled - Checked</p>
        <CheckBox size="md" defaultChecked={true} disabled />
      </div>
    </div>
  ),
};

// ============================================
// All Sizes with States
// ============================================
export const AllSizesWithStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-semibold">Small Size</p>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">Unchecked</p>
            <CheckBox size="sm" defaultChecked={false} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">Checked</p>
            <CheckBox size="sm" defaultChecked={true} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">Disabled</p>
            <CheckBox size="sm" defaultChecked={false} disabled />
          </div>
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Medium Size</p>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">Unchecked</p>
            <CheckBox size="md" defaultChecked={false} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">Checked</p>
            <CheckBox size="md" defaultChecked={true} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">Disabled</p>
            <CheckBox size="md" defaultChecked={false} disabled />
          </div>
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Large Size</p>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">Unchecked</p>
            <CheckBox size="lg" defaultChecked={false} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">Checked</p>
            <CheckBox size="lg" defaultChecked={true} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">Disabled</p>
            <CheckBox size="lg" defaultChecked={false} disabled />
          </div>
        </div>
      </div>
    </div>
  ),
};
