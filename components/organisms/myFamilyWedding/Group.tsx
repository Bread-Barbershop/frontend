import { ChangeEvent } from 'react';

import { Button } from '@/components/atoms/button/Button';
import { TextField } from '@/components/molecules/text-field';

import { Member } from './Member';

export const Group = ({
  family,
  type,
  suffix,
  onSuffixChange,
  onRelationChange,
  onNameChange,
  onDelete,
  onFlowerChange,
  handleAddFamily,
  openMenuKey,
  onMenuToggle,
}: {
  family: {
    id: string;
    relation: string;
    name: string;
    flower: boolean;
  }[];
  type: 'bride' | 'groom';
  suffix: string;
  onSuffixChange: (value: string) => void;
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
  handleAddFamily: (type: 'bride' | 'groom') => void;
  openMenuKey: string | null;
  onMenuToggle: (type: 'bride' | 'groom', index: number) => void;
}) => {
  const side = type === 'bride' ? '신부 측' : '신랑 측';
  return (
    <section
      aria-label={side}
      className="flex flex-col gap-3 w-full justify-center items-center"
    >
      <div className="flex gap-4 items-center">
        <p className="text-sm font-semibold">{side}</p>
        <div className="flex flex-col gap-2">
          {(family || []).map((member, index) => (
            <div key={index} className="flex flex-col gap-3 w-full">
              <Member
                type={type}
                index={index}
                member={member}
                onRelationChange={onRelationChange}
                onNameChange={onNameChange}
                onDelete={onDelete}
                onFlowerChange={onFlowerChange}
                isOpen={openMenuKey === `${type}-${index}`}
                onToggle={onMenuToggle}
              />
            </div>
          ))}
        </div>
      </div>
      <Button
        size="md"
        variant="borderless"
        onClick={() => handleAddFamily(type)}
        className=" text-primary"
      >
        추가 +
      </Button>
      <TextField
        label="이름 뒤 문구"
        className="w-full"
        inputProps={{
          value: suffix,
          onChange: event => onSuffixChange(event.target.value),
          placeholder: '비우면 이름만 표시',
        }}
      />
    </section>
  );
};
