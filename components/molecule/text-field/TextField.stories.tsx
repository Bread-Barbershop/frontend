import type { Meta, StoryObj } from '@storybook/react';

import { TextField } from './TextField';

const meta = {
  title: 'Molecule/TextField',
  component: TextField,
  decorators: [
    Story => (
      <div className="flex min-h-200px w-full items-center justify-center p-6">
        <div className="w-[335px] bg-white">
          <Story />
        </div>
      </div>
    ),
  ],
  argTypes: {
    label: {
      control: 'text',
      description: '라벨 텍스트',
      type: 'string',
    },
    id: {
      control: 'text',
      description: '고유 아이디',
      type: 'string',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
      type: 'boolean',
      defaultValue: false,
    },
    className: {
      control: 'text',
      description: '커스텀 스타일 클래스',
      type: 'string',
    },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Default - Docs에서 Controls로 테스트
// ============================================
export const Default: Story = {
  args: {
    label: 'TextField',
    inputProps: {
      placeholder: '입력하세요',
    },
  },
};

// ============================================
// Input Sizes - Fixed vs Full
// ============================================
export const InputSizes: Story = {
  args: {
    label: 'TextField',
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">Full Size Input</p>
        <TextField
          label="라벨"
          inputProps={{ size: 'full', placeholder: '전체 너비 입력' }}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Fixed Size Input</p>
        <TextField
          label="라벨"
          inputProps={{ size: 'fixed', placeholder: '65px' }}
        />
      </div>
    </div>
  ),
};

// ============================================
// Input States - 기본, 값 입력, Focus
// ============================================
export const InputStates: Story = {
  args: {
    label: 'TextField',
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">기본 상태</p>
        <TextField label="라벨" inputProps={{ placeholder: '입력하세요' }} />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">값이 입력된 상태</p>
        <TextField
          label="라벨"
          inputProps={{
            defaultValue: '입력된 텍스트',
            placeholder: '입력하세요',
          }}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Focus 상태 (클릭해보세요)</p>
        <TextField
          label="라벨"
          inputProps={{ placeholder: '클릭하면 파란색 테두리' }}
        />
      </div>
    </div>
  ),
};

// ============================================
// Disabled States
// ============================================
export const Disabled: Story = {
  args: {
    label: 'TextField',
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="mb-2 text-xs text-gray-500">비활성화</p>
      <TextField
        label="라벨"
        disabled={true}
        inputProps={{ placeholder: '입력하세요' }}
      />
    </div>
  ),
};

// ============================================
// With Custom Props - 다양한 사용 예시
// ============================================
export const WithCustomProps: Story = {
  args: {
    label: 'TextField',
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">커스텀 ID 사용</p>
        <TextField
          id="custom-id"
          label="라벨"
          inputProps={{ placeholder: '입력하세요' }}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">이메일 입력</p>
        <TextField
          label="이메일"
          inputProps={{ type: 'email', placeholder: 'email@example.com' }}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">숫자 입력</p>
        <TextField
          label="금액"
          inputProps={{ type: 'number', placeholder: '0' }}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">비밀번호 입력</p>
        <TextField
          label="비밀번호"
          inputProps={{
            type: 'password',
            placeholder: '비밀번호를 입력하세요',
          }}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">긴 라벨 텍스트</p>
        <TextField
          label="매우 긴 라벨 텍스트 예시"
          inputProps={{ placeholder: '입력하세요' }}
        />
      </div>
    </div>
  ),
};
