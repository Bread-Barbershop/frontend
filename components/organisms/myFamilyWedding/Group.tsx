import { ChangeEvent } from 'react';

import { Button } from '@/components/atoms/button/Button';

import { Member } from './Member';

export const Group = ({
  family,
  type,
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
  return (
    <section className="flex flex-col gap-3 w-full justify-center items-center">
      <div className="flex gap-4 items-center">
        <p className="text-sm font-semibold">
          {type === 'bride' ? '신부측' : '신랑측'}
        </p>
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
    </section>
  );
};
