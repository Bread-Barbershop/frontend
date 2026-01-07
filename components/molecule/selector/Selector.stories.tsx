import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Selector } from './Selector';

type Option = { label: string; value: string };

const meta: Meta<typeof Selector<Option>> = {
  title: 'Molecules/Selector',
  component: Selector<Option>,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div style={{ width: '300px' }}>
        {' '}
        {/* 실제 사용 환경 고려한 너비 제한 */}
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Selector<Option>>;

const mockOptions: Option[] = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
];

// 상태 관리를 포함한 템플릿
type InteractiveSelectorArgs = Omit<
  React.ComponentProps<typeof Selector<Option>>,
  'selected' | 'onSelect'
> & {
  selected?: Option | null;
};

const InteractiveSelector = (args: InteractiveSelectorArgs) => {
  const [selected, setSelected] = useState<Option | null>(
    args.selected || null
  );

  return (
    <Selector<Option>
      {...args}
      selected={selected}
      onSelect={option => setSelected(option)}
      onInputChange={args.onInputChange}
    />
  );
};

export const Default: Story = {
  render: args => <InteractiveSelector {...args} />,
  args: {
    options: mockOptions,
    placeholder: '항목 선택',
  },
};

export const WithCustomInput: Story = {
  render: args => <InteractiveSelector {...args} />,
  args: {
    options: mockOptions,
    placeholder: '직접 입력 가능',
    onInputChange: () => {}, // 프롭 존재 시 직접입력 메뉴 활성화
  },
};

export const SmallSize: Story = {
  render: args => (
    <div style={{ width: '120px' }}>
      <InteractiveSelector {...args} />
    </div>
  ),
  args: {
    options: mockOptions,
    placeholder: '작은 크기',
  },
};
