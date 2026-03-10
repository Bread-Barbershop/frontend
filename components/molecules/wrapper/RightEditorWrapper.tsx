import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const RightEditorWrapper = ({ children }: Props) => {
  return (
    <div>
      <div className="py-6">{children}</div>
    </div>
  );
};
