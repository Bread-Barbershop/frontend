import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Selector } from './Selector';

type Option = { label: string; value: string };

const meta: Meta<typeof Selector<Option>> = {
  title: 'Molecules/Selector',
  component: Selector<Option>,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Selector<Option>>;

const largeMockOptions: Option[] = [
  { label: '부', value: '1' },
  { label: '모', value: '2' },
];

const smallMockOptions: Option[] = [
  { label: '국내', value: '1' },
  { label: '국외', value: '2' },
];

const InteractiveSelector = (
  args: React.ComponentProps<typeof Selector<Option>>
) => {
  const [selected, setSelected] = useState<
    Option | { label: string; value: string } | null
  >(args.selected || null);

  return (
    <Selector<Option>
      {...args}
      selected={selected}
      onSelect={option => setSelected(option)}
    />
  );
};

export const Width86: Story = {
  render: args => <InteractiveSelector {...args} />,
  args: {
    options: largeMockOptions,
    placeholder: '직접선택',
    className: 'w-[86px]',
  },
};

export const Width63: Story = {
  render: args => <InteractiveSelector {...args} />,
  args: {
    options: smallMockOptions,
    className: 'w-[63px]',
    selected: smallMockOptions[0],
    onInputChange: undefined,
  },
};
