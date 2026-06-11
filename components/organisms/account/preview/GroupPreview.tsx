import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/atoms/button';
import { useBodyFontInfo } from '@/shared/hooks/useBodyFontInfo';
import { cn } from '@/shared/utils/cn';

export const GroupPreview = ({
  children,
  group,
}: {
  children: (isOpenAccount: boolean) => React.ReactNode;
  group: { name: string };
}) => {
  const { fontFamily } = useBodyFontInfo();

  const [isOpenAccount, setIsOpenAccount] = useState(false);
  const displayGroupName = group.name.trim() || '그룹명';
  const handleOpenAccount = () => {
    setIsOpenAccount(prev => !prev);
  };
  return (
    <div className="relative flex w-70 flex-col justify-center overflow-hidden rounded-lg border border-border-button shadow-btn-drop-black">
      <Button
        className={cn(
          'h-[43px] w-full border-none py-2 text-sm text-text-secondary font-bold enabled:active:bg-btn-hover',
          isOpenAccount && 'rounded-b-none'
        )}
        style={{ fontFamily }}
        type="button"
        onClick={handleOpenAccount}
      >
        {displayGroupName}
        <div
          className={cn(
            'absolute right-2 flex-center size-8 transition-transform animate-expand shrink-0',
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
