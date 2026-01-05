import type { Meta, StoryObj } from '@storybook/react';

import { MultiField } from './MultiField';

const meta = {
  title: 'Molecule/MultiField',
  component: MultiField,
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
} satisfies Meta<typeof MultiField>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Default - Docs에서 Controls로 테스트
// ============================================
export const Default: Story = {
  args: {
    label: 'MultiField',
    subInputProps: {
      placeholder: '작은 입력',
      size: 'fixed',
    },
    mainInputProps: {
      placeholder: '큰 입력',
      size: 'full',
    },
  },
};

// ============================================
// Input Sizes - Fixed vs Full 조합
// ============================================
export const InputSizes: Story = {
  args: {
    label: 'MultiField',
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">Fixed + Full</p>
        <MultiField
          label="라벨"
          subInputProps={{ size: 'fixed', placeholder: '65px' }}
          mainInputProps={{ size: 'full', placeholder: '전체 너비' }}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Fixed + Fixed</p>
        <MultiField
          label="라벨"
          subInputProps={{ size: 'fixed', placeholder: '65px' }}
          mainInputProps={{ size: 'fixed', placeholder: '65px' }}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Full + Full</p>
        <MultiField
          label="라벨"
          subInputProps={{ size: 'full', placeholder: '전체 너비' }}
          mainInputProps={{ size: 'full', placeholder: '전체 너비' }}
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
    label: 'MultiField',
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">기본 상태</p>
        <MultiField
          label="라벨"
          subInputProps={{ size: 'fixed', placeholder: '00' }}
          mainInputProps={{ size: 'full', placeholder: '입력하세요' }}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">값이 입력된 상태</p>
        <MultiField
          label="라벨"
          subInputProps={{
            size: 'fixed',
            defaultValue: '01',
            placeholder: '00',
          }}
          mainInputProps={{
            size: 'full',
            defaultValue: '입력된 텍스트',
            placeholder: '입력하세요',
          }}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Focus 상태 (클릭해보세요)</p>
        <MultiField
          label="라벨"
          subInputProps={{ size: 'fixed', placeholder: '클릭' }}
          mainInputProps={{
            size: 'full',
            placeholder: '클릭하면 파란색 테두리',
          }}
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
    label: 'MultiField',
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">전체 비활성화</p>
        <MultiField
          label="라벨"
          disabled={true}
          subInputProps={{ size: 'fixed', placeholder: '00' }}
          mainInputProps={{ size: 'full', placeholder: '입력하세요' }}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Sub Input만 비활성화</p>
        <MultiField
          label="라벨"
          subInputProps={{ size: 'fixed', placeholder: '00', disabled: true }}
          mainInputProps={{ size: 'full', placeholder: '입력하세요' }}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">Main Input만 비활성화</p>
        <MultiField
          label="라벨"
          subInputProps={{ size: 'fixed', placeholder: '00' }}
          mainInputProps={{
            size: 'full',
            placeholder: '입력하세요',
            disabled: true,
          }}
        />
      </div>
    </div>
  ),
};

// ============================================
// With Custom Props - 다양한 사용 예시
// ============================================
export const WithCustomProps: Story = {
  args: {
    label: 'MultiField',
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">날짜 입력 (YYYY-MM-DD)</p>
        <MultiField
          label="날짜"
          subInputProps={{
            size: 'fixed',
            type: 'number',
            placeholder: '2024',
            className: 'w-[80px]',
          }}
          mainInputProps={{
            size: 'fixed',
            type: 'number',
            placeholder: '01',
          }}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">전화번호 입력</p>
        <MultiField
          label="전화번호"
          subInputProps={{
            size: 'fixed',
            type: 'tel',
            placeholder: '010',
            className: 'w-[80px]',
          }}
          mainInputProps={{
            size: 'full',
            type: 'tel',
            placeholder: '1234-5678',
          }}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">숫자 조합 (예: 가격 범위)</p>
        <MultiField
          label="가격"
          subInputProps={{
            size: 'fixed',
            type: 'number',
            placeholder: '최소',
            className: 'w-[80px]',
          }}
          mainInputProps={{
            size: 'fixed',
            type: 'number',
            placeholder: '최대',
            className: 'w-[80px]',
          }}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">커스텀 ID 사용</p>
        <MultiField
          id="custom-multi-field"
          label="라벨"
          subInputProps={{ size: 'fixed', placeholder: '00' }}
          mainInputProps={{ size: 'full', placeholder: '입력하세요' }}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">긴 라벨 텍스트</p>
        <MultiField
          label="매우 긴 라벨 텍스트 예시"
          subInputProps={{ size: 'fixed', placeholder: '00' }}
          mainInputProps={{ size: 'full', placeholder: '입력하세요' }}
        />
      </div>
    </div>
  ),
};
