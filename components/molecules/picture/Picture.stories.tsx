import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Picture } from './Picture';

const meta = {
  title: 'Molecules/Picture',
  component: Picture,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    multiple: { control: 'boolean' },
    label: { control: 'text' },
    onChange: { action: 'changed' },
  },
} satisfies Meta<typeof Picture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: '사진',
    multiple: true,
  },
  render: args => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [files, setFiles] = useState<File[]>([]);
    return (
      <div className="w-[500px] border p-4 rounded-lg bg-white">
        <Picture
          {...args}
          value={files}
          onChange={newFiles => {
            setFiles(newFiles);
            args.onChange?.(newFiles);
          }}
        />
      </div>
    );
  },
};

export const Single: Story = {
  args: {
    label: '단일 사진',
    multiple: false,
  },
  render: args => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [files, setFiles] = useState<File[]>([]);
    return (
      <div className="w-[500px] border p-4 rounded-lg bg-white">
        <Picture
          {...args}
          value={files}
          onChange={newFiles => {
            setFiles(newFiles);
            args.onChange?.(newFiles);
          }}
        />
      </div>
    );
  },
};
