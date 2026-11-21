import { useId, useState } from 'react';

import { FormSelector } from '@/components/molecules/selector/FormSelector';
import { formatDateDraft } from '@/shared/hooks/useValidatedDateDraft';
import {
  isValidDateTimeLocal,
  parseStrictDate,
} from '@/shared/utils/dateValidation';

import type { CountdownDateTimeDraft } from './Countdown.schema';

const EMPTY_DRAFT: CountdownDateTimeDraft = {
  date: '',
  period: '',
  hour: '',
  minute: '',
};
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, '0')
);
const TIME_FIELDS = [
  { key: 'period', label: '오전/오후', options: ['오전', '오후'] },
  { key: 'hour', label: '시', options: HOURS },
  { key: 'minute', label: '분', options: MINUTES },
] as const;
const timeSelectors = TIME_FIELDS.map(({ key, label, options }) => ({
  key,
  label,
  options: [
    { value: '', label },
    ...options.map(value => ({
      value,
      label: key === 'period' ? value : value + label,
    })),
  ],
}));
const inputClassName =
  'h-10 w-full min-w-0 rounded-md border border-border-divider bg-bg-base px-2 text-sm text-text-primary focus:border-primary';

function splitDateTime(value: string): CountdownDateTimeDraft {
  if (!isValidDateTimeLocal(value)) return EMPTY_DRAFT;
  const [date, time] = value.split('T');
  const [hour, minute] = time.split(':');
  return {
    date,
    period: Number(hour) < 12 ? '오전' : '오후',
    hour: String(Number(hour) % 12 || 12),
    minute,
  };
}

interface Props {
  value: string;
  draft?: CountdownDateTimeDraft | null;
  onChange: (props: {
    eventDateTime: string;
    eventDateTimeDraft: CountdownDateTimeDraft | null;
  }) => void;
}

export function CountdownDateTimeFields({ value, draft, onChange }: Props) {
  const id = useId();
  const [dateBlurred, setDateBlurred] = useState(false);
  const fields = draft ?? splitDateTime(value);
  const { date, period, hour, minute } = fields;
  const validDate = Boolean(parseStrictDate(date));
  const hasTimeInput = Boolean(period || hour || minute);
  const showDateError =
    !validDate &&
    (date.length >= 10 || (dateBlurred && !!date) || (!date && hasTimeInput));
  const showTimeError = validDate && !(period && hour && minute);

  function update(next: CountdownDateTimeDraft) {
    const hour24 = (Number(next.hour) % 12) + (next.period === '오후' ? 12 : 0);
    const combined = `${next.date}T${String(hour24).padStart(2, '0')}:${next.minute}`;
    const complete =
      !!next.hour && !!next.period && isValidDateTimeLocal(combined);
    onChange({
      eventDateTime: complete ? combined : '',
      eventDateTimeDraft:
        complete || !Object.values(next).some(Boolean) ? null : next,
    });
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-sm text-text-primary">
          행사 날짜
        </label>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          placeholder="YYYY-MM-DD"
          value={date}
          onChange={event =>
            update({
              ...fields,
              date: formatDateDraft(event.target.value, date),
            })
          }
          onFocus={() => setDateBlurred(false)}
          onBlur={() => setDateBlurred(true)}
          aria-invalid={showDateError}
          aria-describedby={showDateError ? `${id}-date-error` : undefined}
          className={inputClassName}
        />
        {showDateError && (
          <p
            id={`${id}-date-error`}
            className="text-xs text-status-error"
            role="status"
          >
            {date
              ? '올바른 날짜를 YYYY-MM-DD 형식으로 입력해 주세요.'
              : '행사 날짜를 입력해 주세요.'}
          </p>
        )}
      </div>
      <fieldset>
        <legend className="mb-1 text-sm text-text-primary">
          행사 시간 (한국 시간)
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {timeSelectors.map(({ key, label, options }) => (
            <FormSelector
              key={key}
              label={<span className="sr-only">{label}</span>}
              options={options}
              value={fields[key]}
              onChange={value => update({ ...fields, [key]: value })}
              invalid={showTimeError && !fields[key]}
              describedBy={
                showTimeError && !fields[key] ? `${id}-time-error` : undefined
              }
            />
          ))}
        </div>
        {showTimeError && (
          <p
            id={`${id}-time-error`}
            className="mt-1 text-xs text-status-error"
            role="status"
          >
            시간을 선택해 주세요.
          </p>
        )}
      </fieldset>
    </>
  );
}
