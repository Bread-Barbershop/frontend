import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const RightEditorWrapper = ({ children }: Props) => {
  return <section className="py-6">{children}</section>;
};
