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
  const [selectedLetterSpacing, setSelectedLetterSpacing] =
    useState<selectorOptions>();

  if (!editor) {
    return null;
  }
  // 폰트, 자간, 행간 옵션만드는 유틸로 따로 빼기
  const fontSize: selectorOptions[] = [];
  const lineHeight: selectorOptions[] = [];
  const letterSpacing: selectorOptions[] = [];

  const fontSizeList = [
    10, 11, 12, 13, 14, 15, 16, 20, 24, 32, 36, 40, 48, 64, 96, 128,
  ];
  const lineHeightList = [
    1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8, 3.0, 3.5, 4.0,
  ];
  const letterSpacingList = [
    1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8, 3.0, 3.5, 4.0,
  ];

  fontSizeList.forEach(size => {
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
  letterSpacingList.forEach(size => {
    const obj = {
      label: size.toString(),
      value: size.toString(),
    };
    letterSpacing.push(obj);
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
  ];

  return (
    <div
      className="menubarContainer mb-2"
      onPointerDown={e => e.preventDefault()}
    >
      <section className="flex gap-4">
        <div>
          <label htmlFor="textColor">글자색</label>
          <input
            id="textColor"
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
        </div>

        <div>
          <label htmlFor="highlight">하이라이트</label>
          <input
            id="highlight"
            type="color"
            onChange={e => {
              editor
                .chain()
                .focus()
                .setHighlight({ color: e.target.value ?? 'yellow' })
                .run();
            }}
          />
        </div>
        <div>
          <label htmlFor="stroke">외곽선 색</label>
          <input
            id="stroke"
            type="color"
            onChange={e => {
              const currentAttributes = editor.getAttributes('textStroke');
              console.log(currentAttributes.color, currentAttributes.width);
              editor
                .chain()
                .focus()
                .setTextStroke({
                  color: e.target.value ?? currentAttributes.color ?? 'yellow',
                  width: currentAttributes.width ?? '2px',
                })
                .run();
            }}
          />
        </div>
        {/* <div>
          <label htmlFor="stroke">외곽선 색</label>
          <input
            id="stroke"
            type="color"
            onChange={e => {
              editor
                .chain()
                .focus()
                .setTextStroke({ color: e.target.value ?? 'yellow' })
                .run();
            }}
          />
        </div> */}
      </section>
      <section className="flex gap-4">
        <div className="flex">
          <label>글자 크기</label>
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
        </div>

        {/* 행간 - 슬라이더로 바꿔야함 */}
        {/* 포커스 바뀌는거 해결해야함 */}
        {/* <div onPointerDown={e => e.stopPropagation()} className="w-10">
        <label>행간</label>
        <div className="flex gap-3">
          <input
            type="range"
            onChange={e => {
              editor
                .chain()
                .focus()
                .setLineHeight(e.target.value ?? '1.0')
                .run();
            }}
          />
          <input
            className="w-2 border-4"
            type="text"
            placeholder="1.0"
            onChange={e => {
              editor
                .chain()
                .focus()
                .setLineHeight(e.target.value ?? '1.0')
                .run();
            }}
          />
        </div>
      </div> */}
        <div className="flex">
          <label>행간</label>
          <Selector
            placeholder="1.0"
            options={lineHeight}
            onSelect={option => {
              editor
                .chain()
                .focus()
                .setLineHeight(option.value ?? '1.0')
                .run();
              setSelectedLineHeight(option);
            }}
            selected={selectedLineHeight ?? null}
          />
        </div>
        <div className="flex">
          <label>자간</label>
          <Selector
            placeholder="1.0"
            options={letterSpacing}
            onSelect={option => {
              editor
                .chain()
                .focus()
                .setLetterSpacing(option.value ?? '1.0')
                .run();
              setSelectedLetterSpacing(option);
            }}
            selected={selectedLetterSpacing ?? null}
          />
        </div>
      </section>

      <section>
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
      </section>
    </div>
  );
}
export default Menubar;
