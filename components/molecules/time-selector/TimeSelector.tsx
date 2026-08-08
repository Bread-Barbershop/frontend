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
  // 시(1~12) 옵션 생성 컴포넌트 마운트 시 한번만 생성
  const hourOptions = useMemo(() => {
    const options = [];
    for (let h = 1; h <= 12; h++) {
      const hourStr = h.toString().padStart(2, '0');
      options.push({ label: hourStr, value: hourStr });
    }
    return options;
  }, []);

  // 분(10분 단위) 옵션 생성 컴포넌트 마운트 시 한번만 생성
  const minuteOptions = useMemo(() => {
    const options = [];
    for (let m = 0; m < 60; m += 10) {
      const minuteStr = m.toString().padStart(2, '0');
      options.push({ label: minuteStr, value: minuteStr });
    }
    return options;
  }, []);

  // 외부로부터 주입되는 value (예: "오후 12:30") 파싱
  const [currentAmPm, currentHour, currentMinute] = useMemo(() => {
    if (!value) return ['오후', '12', '00'];
    const parts = value.split(' ');
    // 파싱 실패 또는 빈 값일 경우 기본값 "오후", "12", "00" 설정
    if (parts.length < 2) return ['오후', '12', '00'];
    const [hour, minute] = parts[1].split(':');
    return [parts[0], hour, minute];
  }, [value]);

  const handleAmPmChange = (option: { label: string; value: string }) => {
    onChange(`${option.value} ${currentHour}:${currentMinute}`);
  };

  const handleHourChange = (option: { label: string; value: string }) => {
    onChange(`${currentAmPm} ${option.value}:${currentMinute}`);
  };

  const handleMinuteChange = (option: { label: string; value: string }) => {
    onChange(`${currentAmPm} ${currentHour}:${option.value}`);
  };

  const selectedAmPm =
    AMPM_OPTIONS.find(opt => opt.value === currentAmPm) || AMPM_OPTIONS[1];
  const selectedHour =
    hourOptions.find(opt => opt.value === currentHour) || hourOptions[11]; // 12
  const selectedMinute =
    minuteOptions.find(opt => opt.value === currentMinute) || minuteOptions[0]; // 00

  return (
    <div className="flex gap-2 w-full">
      <div className="min-w-0 flex-1">
        <Selector
          type="normal"
          options={AMPM_OPTIONS}
          selected={selectedAmPm}
          onSelect={handleAmPmChange}
        />
      </div>
      <div className="min-w-0 flex-1">
        <Selector
          type="normal"
          options={hourOptions}
          selected={selectedHour}
          onSelect={handleHourChange}
        />
      </div>
      <div className="min-w-0 flex-1">
        <Selector
          type="normal"
          options={minuteOptions}
          selected={selectedMinute}
          onSelect={handleMinuteChange}
        />
      </div>
    </div>
  );
};
