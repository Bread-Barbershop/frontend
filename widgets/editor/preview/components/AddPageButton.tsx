import React, { useState } from 'react';

import ComponentsPopup from './ComponentsPopup';

function AddPageButton() {
  const [isTab, setIsTab] = useState(false);

  const handlePopClose = () => {
    setIsTab(false);
  };
  return (
    <div className="w-full">
      {isTab && <ComponentsPopup onPopClose={handlePopClose} />}

      <button
        type="button"
        className="w-full h-11 bg-white rounded-lg shadow-edit flex-center gap-2 font-semibold"
        onClick={() => setIsTab(props => !props)}
      >
        +페이지 추가
      </button>
    </div>
  );
}

export default AddPageButton;
