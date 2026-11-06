import { useCallback } from 'react';

import { useConfirmStore, ConfirmOptions } from '../store/useConfirmStore';

export const useConfirm = () => {
  const openConfirm = useConfirmStore(state => state.openConfirm);

  const confirm = useCallback(
    (options: string | ConfirmOptions) => {
      if (typeof options === 'string') {
        return openConfirm({ message: options });
      }
      return openConfirm(options);
    },
    [openConfirm]
  );

  return { confirm };
};
