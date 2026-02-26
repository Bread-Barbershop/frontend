import { useState } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { MultiField } from '@/components/molecules/multi-field';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';

const MAX_MULTI_FIELDS = 10;

function Phone() {
  const [multiFieldCount, setMultiFieldCount] = useState(1);
  const isAddDisabled = multiFieldCount >= MAX_MULTI_FIELDS;

  const handleAddUtility = () => {
    if (isAddDisabled) {
      return;
    }

    setMultiFieldCount(prev => prev + 1);
  };

  return (
    <section className="flex flex-col justify-center gap-1 px-5 pb-2">
      <NavigationBar>연락처</NavigationBar>
      {Array.from({ length: multiFieldCount }, (_, index) => (
        <MultiField
          key={`phone-multi-field-${index}`}
          label="명칭 & 번호"
          subInputProps={{
            size: 'fixed',
            className: 'w-[65px]',
            placeholder: '명칭',
          }}
          mainInputProps={{ size: 'full', placeholder: '010.000.0000' }}
          className="py-1.5"
        />
      ))}
      <div className="w-full h-8 flex justify-center">
        <UtilityButton onClick={handleAddUtility} disabled={isAddDisabled}>
          추가 +
        </UtilityButton>
      </div>
    </section>
  );
}

export default Phone;
