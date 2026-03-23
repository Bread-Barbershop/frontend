import React, { useMemo } from 'react';

import { Selector } from '@/components/molecules/selector';

interface TimeSelectorProps {
  value: string; // 기대하는 포맷: "오후 12:30" 또는 "12:30 PM" 등
  onChange: (value: string) => void;
}

const AMPM_OPTIONS = [
  { label: '오전', value: '오전' },
  { label: '오후', value: '오후' },
];

export const TimeSelector = ({ value, onChange }: TimeSelectorProps) => {
  // 30분 단위 옵션 생성 컴포넌트 마운트 시 한번만 생성
  const timeOptions = useMemo(() => {
    const options = [];
    for (let h = 1; h <= 12; h++) {
      const hourStr = h.toString().padStart(2, '0');
      options.push({ label: `${hourStr}:00`, value: `${hourStr}:00` });
      options.push({ label: `${hourStr}:30`, value: `${hourStr}:30` });
    }
    return options;
  }, []);

  // 외부로부터 주입되는 value (예: "오후 12:30") 파싱
  const [currentAmPm, currentTime] = useMemo(() => {
    if (!value) return ['오후', '12:00'];
    const parts = value.split(' ');
    // 파싱 실패 또는 빈 값일 경우 기본값 "오후", "12:00" 설정
    if (parts.length < 2) return ['오후', '12:00'];
    return [parts[0], parts[1]];
  }, [value]);

  const handleAmPmChange = (option: { label: string; value: string }) => {
    onChange(`${option.value} ${currentTime}`);
  };

  const handleTimeChange = (option: { label: string; value: string }) => {
    onChange(`${currentAmPm} ${option.value}`);
  };

  const selectedAmPm =
    AMPM_OPTIONS.find(opt => opt.value === currentAmPm) || AMPM_OPTIONS[1];
  const selectedTime =
    timeOptions.find(opt => opt.value === currentTime) || timeOptions[22]; // 12:00 (인덱스 22)

  return (
    <div className="flex gap-2 w-full">
      <div className="flex-1">
        <Selector
          options={AMPM_OPTIONS}
          selected={selectedAmPm}
          onSelect={handleAmPmChange}
        />
      </div>
      <div className="flex-2">
        <Selector
          options={timeOptions}
          selected={selectedTime}
          onSelect={handleTimeChange}
        />
      </div>
    </div>
  );
};
