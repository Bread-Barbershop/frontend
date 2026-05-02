import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/atoms/button';
import { cn } from '@/shared/utils/cn';

export const GroupPreview = ({
  children,
  group,
}: {
  children: (isOpenAccount: boolean) => React.ReactNode;
  group: { name: string };
}) => {
  const [isOpenAccount, setIsOpenAccount] = useState(false);
  const handleOpenAccount = () => {
    setIsOpenAccount(prev => !prev);
  };
  return (
    <div className="relative flex w-70 flex-col justify-center overflow-hidden rounded-lg border border-border-button shadow-btn-drop-black">
      <Button
        className="h-[43px] w-full border-none py-2 text-sm text-text-secondary font-bold"
        type="button"
        onClick={handleOpenAccount}
      >
        {group.name}
        <div
          className={cn(
            'absolute right-2 flex-center size-8 transition-transform duration-200 shrink-0',
            isOpenAccount && 'rotate-180'
          )}
        >
          <ChevronDown size={28} />
        </div>
      </Button>
      {children(isOpenAccount)}
    </div>
  );
};
