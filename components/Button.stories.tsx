import { Meta, StoryFn, StoryObj } from '@storybook/nextjs-vite';

import { Button, ButtonProps } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          '다양한 variant와 size를 지원하는 버튼 컴포넌트입니다. Controls로 실시간 테스트 가능.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
      description: '버튼 스타일을 선택합니다.', // Docs에 설명
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    children: { control: 'text' },
  },
};

export default meta;

// StoryObj 객체는 런타임에서 내부적으로 args를 컴포넌트에 전달해서 JSX를 생성한다.
type Story = StoryObj<typeof Button>;

// 기본 틀
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
};

// 이미 JSX 반환 컴포넌트로 정의됨
const Template: StoryFn<ButtonProps> = args => <Button {...args} />;

// bind({})를 통해서 args를 덮어씌워 여러 스토리 재사용이 가능함
export const TemplatePrimaryButton = Template.bind({});
TemplatePrimaryButton.args = {
  children: 'Button',
  variant: 'primary',
  size: 'md',
};
