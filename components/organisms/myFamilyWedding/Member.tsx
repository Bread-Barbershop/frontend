import { ChangeEvent } from 'react';

import { Input } from '@/components/atoms/input';
import { Selector } from '@/components/molecules/selector';
import Flower from '@/shared/assets/icons/flower.svg';
import Hide from '@/shared/assets/icons/hide.svg';
import Menu from '@/shared/assets/icons/menu.svg';
import Remove from '@/shared/assets/icons/remove.svg';
import Show from '@/shared/assets/icons/show.svg';
import { cn } from '@/shared/utils/cn';

interface Props {
  type: 'bride' | 'groom';
  index: number;
  member: {
    relation: string;
    name: string;
    flower: boolean;
  };
  onRelationChange: (
    type: 'bride' | 'groom',
    index: number,
    value: string
  ) => void;
  onNameChange: (
    type: 'bride' | 'groom',
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => void;
  onDelete: (type: 'bride' | 'groom', index: number) => void;
  onFlowerChange: (
    type: 'bride' | 'groom',
    index: number,
    value: boolean
  ) => void;
  isOpen: boolean;
  onToggle: (type: 'bride' | 'groom', index: number) => void;
}

export const Member = ({
  type,
  index,
  member,
  onRelationChange,
  onNameChange,
  onDelete,
  onFlowerChange,
  isOpen,
  onToggle,
}: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <Selector
          className="w-21.5"
          placeholder="관계"
          options={[
            { value: '부', label: '부' },
            { value: '모', label: '모' },
          ]}
          selected={{ value: member.relation, label: member.relation }}
          onSelect={option => onRelationChange(type, index, option.value)}
          onInputChange={value => onRelationChange(type, index, value)}
        />
        <div className="relative">
          {member.flower && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10 size-4">
              <Flower />
            </div>
          )}
          <Input
            placeholder="이름"
            value={member.name}
            onChange={e => onNameChange(type, index, e)}
            className={cn('w-34', member.flower && 'pl-8')}
          />
        </div>
        <div className="relative w-8 flex items-center justify-center">
          <button
            type="button"
            className="w-full h-full flex items-center justify-center"
            onClick={() => onToggle(type, index)}
          >
            <Menu />
          </button>
          {isOpen && (
            <section className="absolute flex flex-col items-center justify-center gap-2.5 px-2 right-0 top-9 z-10 bg-bg-base w-21.5 h-16.5 rounded-lg shadow-custom">
              <button
                type="button"
                className="w-full flex items-center gap-1 text-xs"
                onClick={() => {
                  onFlowerChange(type, index, !member.flower);
                  onToggle(type, index);
                }}
              >
                {member.flower ? <Hide /> : <Show />}
                <Flower />
                <p>{member.flower ? '삭제' : '표시'}</p>
              </button>
              <button
                type="button"
                className="w-full flex items-center gap-5 text-xs"
                onClick={() => {
                  onDelete(type, index);
                  onToggle(type, index);
                }}
              >
                <Remove />
                <p>삭제</p>
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
