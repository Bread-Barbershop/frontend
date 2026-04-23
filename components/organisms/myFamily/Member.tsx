import { ChangeEvent } from 'react';

import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Picture } from '@/components/molecules/picture';
import { Selector } from '@/components/molecules/selector';
import Flower from '@/shared/assets/icons/flower.svg';
import Menu from '@/shared/assets/icons/menu.svg';
import { cn } from '@/shared/utils/cn';

import { EditMenu } from './EditMenu';

interface Props {
  index: number;
  member: {
    relation: string;
    name: string;
    image: (File | string)[];
    flower: boolean;
  };
  onRelationChange: (index: number, value: string) => void;
  onNameChange: (index: number, e: ChangeEvent<HTMLInputElement>) => void;
  onImageChange: (index: number, value: (File | string)[]) => void;
  onImageDelete: (index: number) => void;
  onDelete: (index: number) => void;
  onFlowerChange: (index: number, value: boolean) => void;
  isOpen: boolean;
  onToggle: (index: number) => void;
}

export const Member = ({
  index,
  member,
  onRelationChange,
  onNameChange,
  onImageChange,
  onImageDelete,
  onDelete,
  onFlowerChange,
  isOpen,
  onToggle,
}: Props) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row gap-2">
        <Label id={`family${index}`} className="text-center font-semibold">
          소개{index + 1}
        </Label>
        <Selector
          className="w-21.5"
          placeholder="관계"
          options={[
            { value: '부', label: '부' },
            { value: '모', label: '모' },
          ]}
          selected={{ value: member.relation, label: member.relation }}
          onSelect={option => onRelationChange(index, option.value)}
          onInputChange={value => onRelationChange(index, value)}
        />
        <div className="relative">
          {member.flower && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10 size-4">
              <Flower />
            </div>
          )}
          <Input
            placeholder="성함"
            value={member.name}
            onChange={e => onNameChange(index, e)}
            className={cn('w-34', member.flower && 'pl-8')}
          />
        </div>
        <div className="relative w-8 flex items-center justify-center">
          <button
            type="button"
            className="w-full h-full flex items-center justify-center"
            onClick={() => onToggle(index)}
          >
            <Menu />
          </button>
          {isOpen && (
            <EditMenu
              onFlowerChange={value => onFlowerChange(index, value)}
              onDelete={() => onDelete(index)}
              onToggle={() => onToggle(index)}
              member={member}
            />
          )}
        </div>
      </div>
      <Picture
        label="사진"
        className="w-full text-center"
        multiple={false}
        value={member.image}
        onChange={value => onImageChange(index, value)}
        onDelete={() => onImageDelete(index)}
      />
    </div>
  );
};
