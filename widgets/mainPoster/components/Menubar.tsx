import { Editor } from '@tiptap/react';
import React from 'react';
import { AiOutlineRedo, AiOutlineUndo } from 'react-icons/ai';
import { BsTypeUnderline } from 'react-icons/bs';
import {
  RiBold,
  RiItalic,
  RiStrikethrough,
  RiFontSize,
  RiMarkPenFill,
  RiMenu2Fill,
  RiMenu5Fill,
  RiMenu3Fill,
} from 'react-icons/ri';

const Button = ({
  onClick,
  isActive,
  disabled,
  children,
}: {
  onClick: () => void;
  isActive: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`p-2 ${isActive ? 'bg-violet-500 text-white rounded-md' : ''}`}
  >
    {children}
  </button>
);

function Menubar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null;
  }

  const buttons = [
    {
      // input으로 입력받기 or select menu로 텍스트 크기 보기 제시
      icon: <RiFontSize className="size-5" />,
      onClick: () =>
        editor.chain().focus().toggleTextStyle().setFontSize('24px').run(),
      isActive: editor.isActive('fontSize'),
    },
    {
      icon: <RiMenu2Fill className="size-5" />,
      onClick: () => editor.chain().focus().toggleTextAlign('left').run(),
      isActive: editor.isActive('textAlign'),
    },
    {
      icon: <RiMenu5Fill className="size-5" />,
      onClick: () => editor.chain().focus().toggleTextAlign('center').run(),
      isActive: editor.isActive('textAlign'),
    },
    {
      icon: <RiMenu3Fill className="size-5" />,
      onClick: () => editor.chain().focus().toggleTextAlign('right').run(),
      isActive: editor.isActive('textAlign'),
    },
    {
      icon: <RiMarkPenFill className="size-5" />,
      onClick: () =>
        editor.chain().focus().toggleHighlight({ color: 'yellow' }).run(),
      isActive: editor.isActive('highlight'),
    },
    {
      icon: <RiBold className="size-5" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      icon: <BsTypeUnderline className="size-5" />,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
    },
    {
      icon: <RiItalic className="size-5" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      disabled: !editor.can().chain().focus().toggleItalic().run(),
    },
    {
      icon: <RiStrikethrough className="size-5" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      disabled: !editor.can().chain().focus().toggleStrike().run(),
    },
    {
      icon: <AiOutlineUndo className="size-5" />,
      onClick: () => editor.chain().focus().undo().run(),
      isActive: editor.isActive('undo'),
      disabled: !editor.can().chain().focus().undo().run(),
    },
    {
      icon: <AiOutlineRedo className="size-5" />,
      onClick: () => editor.chain().focus().redo().run(),
      isActive: editor.isActive('redo'),
      disabled: !editor.can().chain().focus().redo().run(),
    },
  ];

  return (
    <div
      className="menubarContainer mb-2 flex space-x-2"
      onPointerDown={e => e.preventDefault()}
    >
      {buttons.map(({ icon, onClick, isActive, disabled }, index) => (
        <Button
          key={index}
          onClick={onClick}
          isActive={isActive}
          disabled={disabled}
        >
          {icon}
        </Button>
      ))}
    </div>
  );
}
export default Menubar;
