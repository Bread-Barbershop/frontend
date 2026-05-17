import { ChangeEvent } from 'react';

import { ActionMenuButton } from '@/components/atoms/action-menu-button';
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
    <div className="flex flex-col gap-1">
      <div className="flex flex-row gap-2 py-1.5">
        <Label id={`family${index}`} className="text-center font-semibold">
          소개{index + 1}
        </Label>
        <Selector
          type="normal"
          className="w-21.5"
          customInputClassName="text-center"
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
        <ActionMenuButton
          aria-label="가족소개 메뉴"
          isOpen={isOpen}
          onToggle={() => onToggle(index)}
          onClose={() => onToggle(index)}
          icon={<Menu />}
          wrapperClassName="w-8 flex items-center justify-center"
          buttonClassName="w-full h-full rounded-none hover:bg-transparent active:bg-transparent"
          menu={
            <EditMenu
              onFlowerChange={value => onFlowerChange(index, value)}
              onDelete={() => onDelete(index)}
              onToggle={() => onToggle(index)}
              member={member}
            />
          }
        />
      </div>
      <Picture
        label="사진"
        className="w-full py-1.5 text-center"
        multiple={false}
        value={member.image}
        onChange={value => onImageChange(index, value)}
        onDelete={() => onImageDelete(index)}
      />
    </div>
  );
};
