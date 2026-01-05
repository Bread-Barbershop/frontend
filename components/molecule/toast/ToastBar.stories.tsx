import type { Meta, StoryObj } from '@storybook/react';

import { ToastBar } from './ToastBar';

const meta = {
  title: 'Molecule/ToastBar',
  component: ToastBar,
  decorators: [
    Story => (
      <div className="flex min-h-200px w-full items-center justify-center p-6">
        <div className="w-[375px] bg-white">
          <Story />
        </div>
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
      description:
        '토스트 타입 (success: 성공 / error: 오류 / warning: 경고 / info: 정보)',
      defaultValue: 'success',
    },
    message: {
      control: 'text',
      description: '토스트 메시지',
      type: 'string',
      defaultValue: 'Toast message',
    },
  },
} satisfies Meta<typeof ToastBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Default - Docs에서 Controls로 테스트
// ============================================
export const Default: Story = {
  args: {
    variant: 'success',
    message: 'Toast message',
  },
};

// ============================================
// Variants - Success, Error, Warning, Info
// ============================================
export const Variants: Story = {
  args: {
    message: 'Toast message',
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">Success</p>
        <ToastBar
          variant="success"
          message="작업이 성공적으로 완료되었습니다."
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Error</p>
        <ToastBar
          variant="error"
          message="오류가 발생했습니다. 다시 시도해주세요."
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Warning</p>
        <ToastBar
          variant="warning"
          message="주의가 필요합니다. 확인해주세요."
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Info</p>
        <ToastBar variant="info" message="알림: 새로운 업데이트가 있습니다." />
      </div>
    </div>
  ),
};

// ============================================
// Message Lengths - 짧은 메시지, 긴 메시지
// ============================================
export const MessageLengths: Story = {
  args: {
    variant: 'success',
    message: 'Toast message',
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">짧은 메시지</p>
        <ToastBar variant="success" message="완료" />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">일반 메시지</p>
        <ToastBar
          variant="success"
          message="작업이 성공적으로 완료되었습니다."
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">긴 메시지</p>
        <ToastBar
          variant="success"
          message="이것은 매우 긴 토스트 메시지입니다. 최대 너비 375px까지 표시되며, 긴 텍스트는 자동으로 줄바꿈됩니다."
        />
      </div>
    </div>
  ),
};

// ============================================
// Real World Examples - 실제 사용 예시
// ============================================
export const RealWorldExamples: Story = {
  args: {
    variant: 'success',
    message: 'Toast message',
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">성공 예시</p>
        <ToastBar
          variant="success"
          message="파일이 성공적으로 저장되었습니다."
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">오류 예시</p>
        <ToastBar variant="error" message="네트워크 연결에 실패했습니다." />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">경고 예시</p>
        <ToastBar
          variant="warning"
          message="저장하지 않은 변경사항이 있습니다."
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">정보 예시</p>
        <ToastBar variant="info" message="새로운 메시지가 도착했습니다." />
      </div>
    </div>
  ),
};
