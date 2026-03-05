import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/atoms/button';
import { cn } from '@/shared/utils/cn';

export const GroupPreview = ({
  children,
  group,
  i,
}: {
  children: (isOpenAccount: boolean) => React.ReactNode;
  group: { name: string };
  i: number;
}) => {
  const [isOpenAccount, setIsOpenAccount] = useState(false);
  const handleOpenAccount = () => {
    setIsOpenAccount(prev => !prev);
  };
  return (
    <div
      key={i}
      className="relative flex flex-col px-1 py-2 justify-center border border-border-button rounded-md shadow-btn-drop-black"
    >
      <Button
        className="text-sm text-text-secondary w-full border-none"
        type="button"
        onClick={handleOpenAccount}
      >
        {group.name}
        <div
          className={cn(
            'absolute right-1 flex-center size-7 transition-transform duration-200 shrink-0',
            isOpenAccount && 'rotate-180'
          )}
        >
          <ChevronDown size={24} />
        </div>
      </Button>
      {children(isOpenAccount)}
    </div>
  );
};
