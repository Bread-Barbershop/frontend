import { Color } from '@tiptap/extension-text-style';
import { Editor } from '@tiptap/react';
import React, { useState } from 'react';
// import { AiOutlineRedo, AiOutlineUndo } from 'react-icons/ai';
import { BsTypeUnderline } from 'react-icons/bs';
import {
  RiBold,
  RiItalic,
  RiStrikethrough,
  // RiMarkPenFill,
  RiMenu2Fill,
  RiMenu5Fill,
  RiMenu3Fill,
  // RiColorFilterAiFill,
} from 'react-icons/ri';

import { Selector } from '@/components/molecules/selector';

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

type selectorOptions = { label: string; value: string };

function Menubar({ editor }: { editor: Editor | null }) {
  const [selectedFontSize, setSelectedFontSize] = useState<selectorOptions>();
  const [selectedLineHeight, setSelectedLineHeight] =
    useState<selectorOptions>();

  if (!editor) {
    return null;
  }
  // 폰트, 자간, 행간 옵션만드는 유틸로 따로 빼기
  const fontSize: selectorOptions[] = [];
  const lineHeight: selectorOptions[] = [];
  const sizeList = [
    10, 11, 12, 13, 14, 15, 16, 20, 24, 32, 36, 40, 48, 64, 96, 128,
  ];
  const lineHeightList = [
    1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4,
    2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.5, 4.0,
  ];

  sizeList.forEach(size => {
    const obj = {
      label: `${size}px`,
      value: `${size}px`,
    };
    fontSize.push(obj);
  });
  lineHeightList.forEach(size => {
    const obj = {
      label: size.toString(),
      value: size.toString(),
    };
    lineHeight.push(obj);
  });

  const buttons = [
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
    // {
    //   icon: <RiMarkPenFill className="size-5" />,
    //   onClick: () =>
    //     editor.chain().focus().toggleHighlight({ color: '#000000' }).run(),
    //   isActive: editor.isActive('highlight'),
    // },
    // {
    //   icon: <AiOutlineUndo className="size-5" />,
    //   onClick: () => editor.chain().focus().undo().run(),
    //   isActive: editor.isActive('undo'),
    //   disabled: !editor.can().chain().focus().undo().run(),
    // },
    // {
    //   icon: <AiOutlineRedo className="size-5" />,
    //   onClick: () => editor.chain().focus().redo().run(),
    //   isActive: editor.isActive('redo'),
    //   disabled: !editor.can().chain().focus().redo().run(),
    // },
  ];

  return (
    <div
      className="menubarContainer mb-2 flex space-x-2"
      onPointerDown={e => e.preventDefault()}
    >
      <input
        type="color"
        onChange={e => {
          editor
            .chain()
            .focus()
            .toggleTextStyle(Color)
            .setColor(e.target.value ?? '#000000')
            .run();
        }}
      />
      <input
        type="color"
        onChange={e => {
          editor
            .chain()
            .focus()
            .toggleHighlight({ color: e.target.value ?? 'yellow' })
            .run();
        }}
      />
      {/* 폰트 사이즈 */}
      <Selector
        placeholder="14px"
        options={fontSize}
        // 폰트 사이즈 여러개 섞였을시 mixed 표시 필요
        onSelect={option => {
          editor
            .chain()
            .focus()
            .toggleTextStyle()
            .setFontSize(option.value ?? '14px')
            .run();
          setSelectedFontSize(option);
        }}
        selected={selectedFontSize ?? null}
      />
      {/* 행간 - 슬라이더로 바꿔야함 */}
      <Selector
        placeholder="1.0"
        options={lineHeight}
        onSelect={option => {
          editor
            .chain()
            .focus()
            .toggleTextStyle()
            .setLineHeight(option.value ?? '1.0')
            .run();
          setSelectedLineHeight(option);
        }}
        selected={selectedLineHeight ?? null}
      />
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
