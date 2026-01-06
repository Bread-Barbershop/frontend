import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Selector } from './Selector';

type Option = { label: string; value: string };

const meta = {
  title: 'Molecule/Selector',
  component: Selector<Option>,
  decorators: [
    Story => (
      <div className="flex min-h-200px w-full items-center justify-center p-6">
        <div className="bg-white">
          <Story />
        </div>
      </div>
    ),
  ],
  argTypes: {
    placeholder: {
      control: 'text',
      description: '플레이스홀더 텍스트',
      type: 'string',
      defaultValue: '선택',
    },
  },
} satisfies Meta<typeof Selector<Option>>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicOptions: Option[] = [
  { label: '옵션 1', value: 'option1' },
  { label: '옵션 2', value: 'option2' },
  { label: '옵션 3', value: 'option3' },
];

// ============================================
// Default - Docs에서 Controls로 테스트
// ============================================
const DefaultComponent = () => {
  const [selected, setSelected] = useState<Option | null>(null);
  return (
    <Selector
      options={basicOptions}
      placeholder="선택"
      selected={selected}
      onSelect={setSelected}
    />
  );
};

export const Default: Story = {
  args: {
    options: basicOptions,
    placeholder: '선택',
    selected: null,
    onSelect: () => {},
  },
  render: () => <DefaultComponent />,
};

// ============================================
// Basic Usage - 기본 사용
// ============================================
const BasicUsageComponent = () => {
  const [selected1, setSelected1] = useState<Option | null>(null);
  const [selected2, setSelected2] = useState<Option | null>(null);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">기본 Selector</p>
        <Selector
          options={basicOptions}
          selected={selected1}
          onSelect={setSelected1}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">커스텀 Placeholder</p>
        <Selector
          options={basicOptions}
          placeholder="항목을 선택해주세요"
          selected={selected2}
          onSelect={setSelected2}
        />
      </div>
    </div>
  );
};

export const BasicUsage: Story = {
  args: {
    options: basicOptions,
    selected: null,
    onSelect: () => {},
  },
  render: () => <BasicUsageComponent />,
};

// ============================================
// Option Counts - 옵션 개수별
// ============================================
const OptionCountsComponent = () => {
  const [selected1, setSelected1] = useState<Option | null>(null);
  const [selected2, setSelected2] = useState<Option | null>(null);
  const [selected3, setSelected3] = useState<Option | null>(null);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">옵션 2개</p>
        <Selector
          options={[
            { label: '옵션 A', value: 'a' },
            { label: '옵션 B', value: 'b' },
          ]}
          selected={selected1}
          onSelect={setSelected1}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">옵션 5개</p>
        <Selector
          options={[
            { label: '옵션 1', value: '1' },
            { label: '옵션 2', value: '2' },
            { label: '옵션 3', value: '3' },
            { label: '옵션 4', value: '4' },
            { label: '옵션 5', value: '5' },
          ]}
          selected={selected2}
          onSelect={setSelected2}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">옵션 10개 이상 (스크롤)</p>
        <Selector
          options={Array.from({ length: 15 }, (_, i) => ({
            label: `옵션 ${i + 1}`,
            value: `option${i + 1}`,
          }))}
          selected={selected3}
          onSelect={setSelected3}
        />
      </div>
    </div>
  );
};

export const OptionCounts: Story = {
  args: {
    options: basicOptions,
    selected: null,
    onSelect: () => {},
  },
  render: () => <OptionCountsComponent />,
};

// ============================================
// Real World Examples - 실제 사용 예시
// ============================================
const RealWorldExamplesComponent = () => {
  const [selectedCountry, setSelectedCountry] = useState<Option | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Option | null>(null);
  const [selectedSort, setSelectedSort] = useState<Option | null>(null);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">국가 선택</p>
        <Selector
          options={[
            { label: '대한민국', value: 'kr' },
            { label: '미국', value: 'us' },
            { label: '일본', value: 'jp' },
            { label: '중국', value: 'cn' },
            { label: '영국', value: 'uk' },
          ]}
          placeholder="국가를 선택하세요"
          selected={selectedCountry}
          onSelect={setSelectedCountry}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">언어 선택</p>
        <Selector
          options={[
            { label: '한국어', value: 'ko' },
            { label: 'English', value: 'en' },
            { label: '日本語', value: 'ja' },
            { label: '中文', value: 'zh' },
          ]}
          placeholder="언어를 선택하세요"
          selected={selectedLanguage}
          onSelect={setSelectedLanguage}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">정렬 방식</p>
        <Selector
          options={[
            { label: '최신순', value: 'latest' },
            { label: '인기순', value: 'popular' },
            { label: '이름순', value: 'name' },
            { label: '가격순', value: 'price' },
          ]}
          placeholder="정렬 방식을 선택하세요"
          selected={selectedSort}
          onSelect={setSelectedSort}
        />
      </div>
    </div>
  );
};

export const RealWorldExamples: Story = {
  args: {
    options: basicOptions,
    selected: null,
    onSelect: () => {},
  },
  render: () => <RealWorldExamplesComponent />,
};

// ============================================
// Long Labels - 긴 라벨 텍스트
// ============================================
const LongLabelsComponent = () => {
  const [selected, setSelected] = useState<Option | null>(null);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">긴 라벨 옵션</p>
        <Selector
          options={[
            { label: '매우 긴 옵션 라벨 텍스트 예시입니다', value: 'long1' },
            {
              label: '이것도 매우 긴 옵션 라벨 텍스트입니다',
              value: 'long2',
            },
            {
              label: '세 번째 긴 옵션 라벨 텍스트 예시',
              value: 'long3',
            },
          ]}
          selected={selected}
          onSelect={setSelected}
        />
      </div>
    </div>
  );
};

export const LongLabels: Story = {
  args: {
    options: basicOptions,
    selected: null,
    onSelect: () => {},
  },
  render: () => <LongLabelsComponent />,
};

// ============================================
// Selected State - 선택된 상태
// ============================================
const SelectedStateComponent = () => {
  const [selected1, setSelected1] = useState<Option | null>(null);
  const [selected2, setSelected2] = useState<Option | null>({
    label: '옵션 2',
    value: 'option2',
  });
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-gray-500">선택되지 않은 상태</p>
        <Selector
          options={basicOptions}
          selected={selected1}
          onSelect={setSelected1}
        />
      </div>
      <div>
        <p className="mb-2 text-xs text-gray-500">선택된 상태</p>
        <Selector
          options={basicOptions}
          selected={selected2}
          onSelect={setSelected2}
        />
      </div>
    </div>
  );
};

export const SelectedState: Story = {
  args: {
    options: basicOptions,
    selected: null,
    onSelect: () => {},
  },
  render: () => <SelectedStateComponent />,
};
