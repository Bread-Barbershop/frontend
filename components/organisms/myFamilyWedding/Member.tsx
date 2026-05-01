import { ChangeEvent } from 'react';

import { ActionMenuButton } from '@/components/atoms/action-menu-button';
import { Input } from '@/components/atoms/input';
import { Selector } from '@/components/molecules/selector';
import Flower from '@/shared/assets/icons/flower.svg';
import Menu from '@/shared/assets/icons/menu.svg';
import { cn } from '@/shared/utils/cn';

import { EditMenu } from './EditMenu';

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
          type="normal"
          className="w-21.5"
          customInputClassName="text-center"
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
            placeholder="성함"
            value={member.name}
            onChange={e => onNameChange(type, index, e)}
            className={cn('w-34', member.flower && 'pl-8')}
          />
        </div>
        <ActionMenuButton
          aria-label="wedding family menu"
          isOpen={isOpen}
          onToggle={() => onToggle(type, index)}
          onClose={() => onToggle(type, index)}
          icon={<Menu />}
          wrapperClassName="w-8 flex items-center justify-center"
          buttonClassName="w-full h-full rounded-none hover:bg-transparent active:bg-transparent"
          menu={
            <EditMenu
              type={type}
              index={index}
              member={member}
              onFlowerChange={onFlowerChange}
              onDelete={onDelete}
              onToggle={onToggle}
            />
          }
        />
      </div>
    </div>
  );
};
