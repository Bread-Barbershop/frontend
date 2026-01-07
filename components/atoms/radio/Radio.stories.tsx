import type { Meta, StoryObj } from '@storybook/react';

import { Radio } from './Radio';

const meta = {
  title: 'Atoms/Radio',
  component: Radio,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Radio 크기 (sm: 14px / md: 20px / lg: 24px)',
      defaultValue: 'md',
    },
    checked: {
      control: 'boolean',
      description: '선택 상태',
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
} satisfies Meta<typeof Radio>;

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
          <Radio name="radio-sm" size="sm" defaultChecked={false} />
          <Radio name="radio-sm" size="sm" defaultChecked={true} />
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Medium - 20×20px (기본)</p>
        <div className="flex items-center gap-3">
          <Radio name="radio-md" size="md" defaultChecked={false} />
          <Radio name="radio-md" size="md" defaultChecked={true} />
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Large - 24×24px</p>
        <div className="flex items-center gap-3">
          <Radio name="radio-lg" size="lg" defaultChecked={false} />
          <Radio name="radio-lg" size="lg" defaultChecked={true} />
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
        <Radio name="radio-state" size="md" defaultChecked={false} />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Checked</p>
        <Radio name="radio-state" size="md" defaultChecked={true} />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Disabled - Unchecked</p>
        <Radio name="radio-state" size="md" defaultChecked={false} disabled />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Disabled - Checked</p>
        <Radio name="radio-state" size="md" defaultChecked={true} disabled />
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
            <Radio name="radio-all-sm" size="sm" defaultChecked={false} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">Checked</p>
            <Radio name="radio-all-sm" size="sm" defaultChecked={true} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">Disabled</p>
            <Radio
              name="radio-all-sm"
              size="sm"
              defaultChecked={false}
              disabled
            />
          </div>
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Medium Size</p>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">Unchecked</p>
            <Radio name="radio-all-md" size="md" defaultChecked={false} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">Checked</p>
            <Radio name="radio-all-md" size="md" defaultChecked={true} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">Disabled</p>
            <Radio
              name="radio-all-md"
              size="md"
              defaultChecked={false}
              disabled
            />
          </div>
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Large Size</p>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">Unchecked</p>
            <Radio name="radio-all-lg" size="lg" defaultChecked={false} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">Checked</p>
            <Radio name="radio-all-lg" size="lg" defaultChecked={true} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">Disabled</p>
            <Radio
              name="radio-all-lg"
              size="lg"
              defaultChecked={false}
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  ),
};
