import { useConfirmStore, ConfirmOptions } from '../store/useConfirmStore';

export const useConfirm = () => {
  const openConfirm = useConfirmStore(state => state.openConfirm);

  const confirm = (options: string | ConfirmOptions) => {
    if (typeof options === 'string') {
      return openConfirm({ message: options });
    }
    return openConfirm(options);
  };

  return { confirm };
};
