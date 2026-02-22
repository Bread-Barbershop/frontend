import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { PicturePopViewer } from './PicturePopViewer';

const meta = {
  title: 'Molecules/PicturePopViewer',
  component: PicturePopViewer,
  decorators: [
    Story => (
      <div className="relative w-[50vw] h-screen">
        {/* createPortal의 타겟이 되는 컨테이너 */}
        <div id="preview-container" />
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    ratio: {
      control: 'select',
      options: ['1:1', '4:3', '3:4', '16:9', '9:16'],
    },
    isOpen: { control: 'boolean' },
    onClose: { action: 'closed' },
  },
} satisfies Meta<typeof PicturePopViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

const MOCK_IMAGES = [
  'https://picsum.photos/800/800?random=1',
  'https://picsum.photos/800/600?random=2',
  'https://picsum.photos/600/800?random=3',
  'https://picsum.photos/1200/800?random=4',
];

export const Default: Story = {
  args: {
    isOpen: false,
    images: MOCK_IMAGES,
    startIndex: 0,
    ratio: '1:1',
    onClose: () => {},
  },
  render: args => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="w-full p-10">
        <button onClick={() => setIsOpen(true)}>이미지 뷰어 열기</button>
        <PicturePopViewer
          {...args}
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            args.onClose?.();
          }}
        />
      </div>
    );
  },
};

export const Ratio4_3: Story = {
  args: {
    isOpen: true,
    images: MOCK_IMAGES,
    startIndex: 1,
    ratio: '4:3',
    onClose: () => {},
  },
};

export const Ratio3_4: Story = {
  args: {
    isOpen: true,
    images: MOCK_IMAGES,
    startIndex: 1,
    ratio: '3:4',
    onClose: () => {},
  },
};
export const Ratio9_16: Story = {
  args: {
    isOpen: true,
    images: MOCK_IMAGES,
    startIndex: 1,
    ratio: '9:16',
    onClose: () => {},
  },
};
export const Ratio16_9: Story = {
  args: {
    isOpen: true,
    images: MOCK_IMAGES,
    startIndex: 1,
    ratio: '16:9',
    onClose: () => {},
  },
};
