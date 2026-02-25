import type { Meta, StoryObj } from '@storybook/react';

import { ButtonSelector } from './ButtonSelector';

const meta = {
  title: 'Molecules/ButtonSelector',
  component: ButtonSelector,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text' },
    onPointerDown: { action: 'pointerDown' },
  },
} satisfies Meta<typeof ButtonSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const MOCK_OPTIONS = [
  { value: 'option1', label: '옵션 1' },
  { value: 'option2', label: '옵션 2' },
  { value: 'option3', label: '옵션 3' },
  { value: 'option4', label: '옵션 4' },
  { value: 'option5', label: '옵션 5' },
];

export const Default: Story = {
  args: {
    label: '선택항목',
    selectorOption: MOCK_OPTIONS,
    onPointerDown: () => {},
  },
  render: args => (
    <div className="w-[400px] border p-4 rounded-lg bg-white">
      <ButtonSelector {...args} />
    </div>
  ),
};

export const ManyOptions: Story = {
  args: {
    label: '많은 옵션',
    selectorOption: [
      ...MOCK_OPTIONS,
      { value: 'option6', label: '옵션 6' },
      { value: 'option7', label: '옵션 7' },
      { value: 'option8', label: '옵션 8' },
    ],
    onPointerDown: () => {},
  },
  render: args => (
    <div className="w-[400px] border p-4 rounded-lg bg-white">
      <ButtonSelector {...args} />
    </div>
  ),
};
export const Disabled: Story = {
  args: {
    label: '비활성화',
    selectorOption: MOCK_OPTIONS,
    disabled: true,
    onPointerDown: () => {},
  },
  render: args => (
    <div className="w-[400px] border p-4 rounded-lg bg-white">
      <ButtonSelector {...args} />
    </div>
  ),
};
