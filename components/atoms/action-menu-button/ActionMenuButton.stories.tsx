import type { Meta, StoryObj } from '@storybook/react';
import { CircleMinus, Eye, EyeOff, Flower2, Pencil } from 'lucide-react';
import { ComponentProps, ReactNode, useState } from 'react';

import { ActionMenuButton } from './ActionMenuButton';

type ActionMenuStoryProps = Omit<
  ComponentProps<typeof ActionMenuButton>,
  'isOpen' | 'onToggle' | 'onClose' | 'menu'
> & {
  defaultOpen?: boolean;
  menu?: ReactNode;
};

function InteractiveActionMenuButton({
  defaultOpen = false,
  menu,
  ...args
}: ActionMenuStoryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <ActionMenuButton
      {...args}
      isOpen={isOpen}
      onToggle={() => setIsOpen(current => !current)}
      onClose={closeMenu}
      menu={menu ?? <ContactMenu onClose={closeMenu} />}
    />
  );
}

const meta = {
  title: 'Atoms/ActionMenuButton',
  component: InteractiveActionMenuButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    usePortal: {
      control: 'boolean',
      description: 'Render menu through document.body portal.',
      defaultValue: true,
    },
    placement: {
      control: 'select',
      options: ['bottom-end', 'bottom-start'],
      description: 'Menu alignment from the trigger button.',
      defaultValue: 'bottom-end',
    },
    offset: {
      control: 'number',
      description: 'Gap between trigger button and menu.',
      defaultValue: 4,
    },
  },
} satisfies Meta<typeof InteractiveActionMenuButton>;

export default meta;
type Story = StoryObj<typeof meta>;

function FamilyMenu({ onClose }: { onClose: () => void }) {
  return (
    <section className="flex h-16.5 w-21.5 flex-col items-center justify-center gap-2.5 rounded-lg bg-bg-base px-2 shadow-custom">
      <button
        type="button"
        className="flex w-full items-center gap-1 text-[14px]"
        onClick={onClose}
      >
        <Eye />
        <Flower2 className="size-4" />
        <p>표시</p>
      </button>
      <button
        type="button"
        className="flex w-full items-center gap-5 text-[14px]"
        onClick={onClose}
      >
        <CircleMinus className="size-4" />
        <p>삭제</p>
      </button>
    </section>
  );
}

function ContactMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="rounded-lg border border-border-neutral bg-white shadow-edit">
      <button
        type="button"
        className="flex h-8 w-21.5 items-center gap-4 whitespace-nowrap px-2 text-sm enabled:hover:bg-btn-hover"
        onClick={onClose}
      >
        <CircleMinus className="h-4 w-4" />
        삭제
      </button>
    </div>
  );
}

function FamilyActionMenuButton(args: ActionMenuStoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <ActionMenuButton
      {...args}
      isOpen={isOpen}
      onToggle={() => setIsOpen(current => !current)}
      onClose={closeMenu}
      icon={<EyeOff className="size-5" />}
      buttonClassName="hover:bg-transparent active:bg-transparent"
      menu={<FamilyMenu onClose={closeMenu} />}
    />
  );
}

export const Default: Story = {
  render: args => <InteractiveActionMenuButton {...args} />,
  args: {
    'aria-label': '액션 메뉴',
    usePortal: true,
    placement: 'bottom-end',
    offset: 4,
  },
};

export const ContactDeleteMenu: Story = {
  render: args => <InteractiveActionMenuButton {...args} />,
  args: {
    'aria-label': '연락처 메뉴',
    usePortal: true,
  },
};

export const FamilyEditMenu: Story = {
  render: args => <FamilyActionMenuButton {...args} />,
  args: {
    'aria-label': '가족소개 메뉴',
    usePortal: true,
  },
};

export const InsideClippedContainer: Story = {
  render: args => (
    <div className="h-16 w-36 overflow-hidden rounded-lg border border-border-neutral bg-bg-sub p-3">
      <InteractiveActionMenuButton {...args} />
    </div>
  ),
  args: {
    'aria-label': '포탈 액션 메뉴',
    usePortal: true,
    placement: 'bottom-end',
  },
};

export const WithoutPortal: Story = {
  render: args => (
    <div className="h-24 w-40 rounded-lg border border-border-neutral bg-bg-sub p-3">
      <InteractiveActionMenuButton
        {...args}
        icon={<Pencil className="size-4" />}
      />
    </div>
  ),
  args: {
    'aria-label': '인라인 액션 메뉴',
    usePortal: false,
    placement: 'bottom-end',
  },
};
