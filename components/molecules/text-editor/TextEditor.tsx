'use client';

import {
  EditorContent,
  JSONContent,
  type Editor,
  useEditor,
} from '@tiptap/react';
import { ChevronDown } from 'lucide-react';
import React, {
  type CSSProperties,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';

import TextEditorButton from '@/components/atoms/text-editor-button/TextEditorButton';
import AlignCenterIcon from '@/shared/assets/icons/alignCenter.svg';
import AlignLeftIcon from '@/shared/assets/icons/alignLeft.svg';
import AlignRightIcon from '@/shared/assets/icons/alignRight.svg';
import FontColorIcon from '@/shared/assets/icons/color.svg';
import ItalicIcon from '@/shared/assets/icons/italic.svg';
import UnderlineIcon from '@/shared/assets/icons/underline.svg';
import {
  loadCustomFont,
  preloadFontFamilyWeights,
} from '@/shared/fonts/fontLoader';
import { FontFamilyOption, FontWeightOption } from '@/shared/fonts/fontOptions';
import { cn } from '@/shared/utils/cn';

import { Selector } from '../selector';

import TextEditorColorPickerPopover from './components/TextEditorColorPickerPopover';
import { isTextMarkFullyActive } from './utils/markState';
import { stripFontSizeFromHtml } from './utils/paste';
import {
  createFontWeightOptions,
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  getDefaultFontWeightOption,
  getInitialEditorStyles,
  type FontSizeOption,
  type TextAlignOption,
  type TextAlignValue,
} from './utils/textEditorOptions';
import { createTextEditorBarExtensions } from './utils/tiptapExtensions';

interface TextEditorProps {
  value?: JSONContent | null;
  defaultText?: string;
  defaultAlign?: TextAlignValue;
  onChange?: (json: JSONContent) => void;
  additionalSlot?: React.ReactNode;
}

export interface TextEditorRef {
  insertText: (text: string) => void;
  getEditor: () => Editor | null;
}

const TEXT_ALIGN_OPTIONS: TextAlignOption[] = [
  { label: <AlignRightIcon />, value: 'right' },
  { label: <AlignCenterIcon />, value: 'center' },
  { label: <AlignLeftIcon />, value: 'left' },
];

const DEFAULT_FONT_SIZE_OPTION =
  FONT_SIZE_OPTIONS.find(option => option.value === '14px') ??
  FONT_SIZE_OPTIONS[0];
const DEFAULT_TEXT_ALIGN_OPTION = TEXT_ALIGN_OPTIONS[1];
const DEFAULT_EDITOR_TEXT = '내용을 입력해주세요';

export const TextEditor = forwardRef<TextEditorRef, TextEditorProps>(
  (
    {
      value,
      defaultText = DEFAULT_EDITOR_TEXT,
      defaultAlign = DEFAULT_TEXT_ALIGN_OPTION.value,
      onChange,
      additionalSlot = null,
    },
    ref
  ) => {
    const [, forceUpdate] = useReducer((count: number) => count + 1, 0);

    const initialStyles = useMemo(
      () => getInitialEditorStyles(value, defaultAlign),
      [value, defaultAlign]
    );

    const [fontFamilySelected, setFontFamilySelected] =
      useState<FontFamilyOption>(initialStyles.fontFamily);
    const [fontWeightSelected, setFontWeightSelected] =
      useState<FontWeightOption>(initialStyles.fontWeight);
    const [fontSizeSelected, setFontSizeSelected] = useState<FontSizeOption>(
      initialStyles.fontSize
    );
    const [textAlignSelected, setTextAlignSelected] = useState<TextAlignOption>(
      initialStyles.textAlign
    );
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState(initialStyles.color);
    const editorRef = useRef<Editor | null>(null);
    const fontSizeSelectedRef = useRef(initialStyles.fontSize);
    const colorPickerContainerRef = useRef<HTMLDivElement>(null);
    const fontWeightOptions = useMemo(
      () => createFontWeightOptions(fontFamilySelected),
      [fontFamilySelected]
    );

    useEffect(() => {
      fontSizeSelectedRef.current = fontSizeSelected;
    }, [fontSizeSelected]);

    const editor = useEditor({
      immediatelyRender: false,
      extensions: createTextEditorBarExtensions(defaultText),
      content: value ?? null,
      editorProps: {
        attributes: {
          class:
            'flex flex-col justify-center min-h-[120px] outline-none text-[14px] leading-7 selection:bg-primary/20 selection:text-inherit',
        },
        transformPastedHTML(html) {
          return stripFontSizeFromHtml(html);
        },
        handlePaste(view) {
          const pasteFrom = view.state.selection.from;

          window.requestAnimationFrame(() => {
            const currentEditor = editorRef.current;
            const pasteTo = currentEditor?.state.selection.from;

            if (!currentEditor || !pasteTo || pasteTo <= pasteFrom) return;

            currentEditor
              .chain()
              .setTextSelection({ from: pasteFrom, to: pasteTo })
              .setFontSize(fontSizeSelectedRef.current.value)
              .setTextSelection(pasteTo)
              .run();
          });

          return false;
        },
      },
      onCreate({ editor }) {
        editorRef.current = editor;
        onChange?.(editor.getJSON());
        forceUpdate();
      },
      onUpdate({ editor }) {
        onChange?.(editor.getJSON());
        forceUpdate();
      },
      onSelectionUpdate() {
        forceUpdate();
      },
      onTransaction() {
        forceUpdate();
      },
      onFocus() {
        forceUpdate();
      },
      onBlur() {
        forceUpdate();
      },
      onDestroy() {
        editorRef.current = null;
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        insertText: (text: string) => {
          if (editor) {
            editor.chain().focus().insertContent(text).run();
          }
        },
        getEditor: () => editor,
      }),
      [editor]
    );

    if (!editor) return null;

    const textStyleAttributes = editor.getAttributes('textStyle');
    const activeColor =
      typeof textStyleAttributes.color === 'string'
        ? textStyleAttributes.color
        : selectedColor;
    const italicActive = isTextMarkFullyActive(editor, 'italic');
    const underlineActive = isTextMarkFullyActive(editor, 'underline');
    const editorFocused = editor.isFocused;
    const inlineButtonClassName =
      'bg-white hover:bg-[#FAFAFB] active:bg-[#F5F8FF] aria-pressed:bg-[#F5F8FF] aria-pressed:text-[#1F72EF]';

    const handleFontFamilySelect = (
      option: FontFamilyOption | { label: string; value: string }
    ) => {
      const selected = option as FontFamilyOption;
      const nextWeight = getDefaultFontWeightOption(selected);

      setFontFamilySelected(selected);
      setFontWeightSelected(nextWeight);

      void (async () => {
        await preloadFontFamilyWeights(selected.value);
        await loadCustomFont(selected.value, nextWeight.value);

        editor
          .chain()
          .focus()
          .setFontFamily(selected.value)
          .setFontWeight(nextWeight.value)
          .run();
      })();
    };

    const handleFontWeightSelect = (
      option: FontWeightOption | { label: string; value: string }
    ) => {
      const selected = option as FontWeightOption;
      setFontWeightSelected(selected);
      void (async () => {
        await loadCustomFont(fontFamilySelected.value, selected.value);
        editor.chain().focus().setFontWeight(selected.value).run();
      })();
    };

    const handleFontSizeSelect = (
      option: FontSizeOption | { label: string; value: string }
    ) => {
      const selected = option as FontSizeOption;
      setFontSizeSelected(selected);
      if (selected.value) {
        editor.chain().focus().setFontSize(selected.value).run();
      }
    };

    const handleFontSizeInputChange = (value: string) => {
      const numericValue = value.replace(/[^0-9]/g, '');
      const option: FontSizeOption = {
        label: numericValue,
        value: numericValue ? `${numericValue}px` : '',
      };
      setFontSizeSelected(option);

      if (numericValue) {
        editor.chain().setFontSize(option.value).run();
      }
    };

    const handleFontSizeInputBlur = () => {
      if (!fontSizeSelected.value) {
        setFontSizeSelected(DEFAULT_FONT_SIZE_OPTION);
        editor.chain().setFontSize(DEFAULT_FONT_SIZE_OPTION.value).run();
      }
    };

    const handleTextAlignSelect = (
      option: TextAlignOption | { label: string; value: string }
    ) => {
      const selected = option as TextAlignOption;
      setTextAlignSelected(selected);
      editor.chain().focus().setTextAlign(selected.value).run();
    };

    const handleColorPickerToggle = () => {
      setColorPickerOpen(prev => !prev);
    };

    const handleItalicToggle = () => {
      const command = editor.chain().focus();

      if (italicActive) {
        command.unsetItalic().setFontStyleOverride('normal').run();
        return;
      }

      command.setItalic().setFontStyleOverride(null).run();
    };

    const handleUnderlineToggle = () => {
      const command = editor.chain().focus();

      if (underlineActive) {
        command.unsetUnderline().setTextDecorationOverride('none').run();
        return;
      }

      command.setUnderline().setTextDecorationOverride(null).run();
    };

    return (
      <div className="w-full space-y-1">
        <div className="flex flex-col gap-1">
          <div className="flex h-8 gap-[13px] items-center justify-between">
            <Selector<FontFamilyOption>
              options={FONT_FAMILY_OPTIONS}
              selected={fontFamilySelected}
              onSelect={handleFontFamilySelect}
              placeholder="Font"
              variant="fontFamily"
              showCheckbox={false}
            />

            <Selector<FontWeightOption>
              options={fontWeightOptions}
              selected={fontWeightSelected}
              onSelect={handleFontWeightSelect}
              placeholder="Weight"
              variant="fontWeight"
              showCheckbox={false}
            />
            {additionalSlot}
          </div>

          <div className="flex h-8 items-center justify-between">
            <Selector<FontSizeOption>
              options={FONT_SIZE_OPTIONS}
              selected={fontSizeSelected}
              onSelect={handleFontSizeSelect}
              onInputChange={handleFontSizeInputChange}
              onInputBlur={handleFontSizeInputBlur}
              placeholder="Size"
              variant="fontSize"
              showCheckbox={false}
            />

            <div className="relative" ref={colorPickerContainerRef}>
              <button
                type="button"
                aria-label="Font color"
                aria-pressed={colorPickerOpen}
                onMouseDown={event => event.preventDefault()}
                onClick={handleColorPickerToggle}
                className={cn(
                  'flex h-8 w-[50px] items-center justify-between overflow-hidden rounded-lg bg-white py-1 pl-2 text-text-primary shadow-[inset_0_0_0_1px_#eaeaea] transition-colors hover:bg-[#FAFAFB] active:bg-[#F5F8FF]',
                  colorPickerOpen && 'bg-[#F5F8FF]'
                )}
              >
                <FontColorIcon
                  style={
                    {
                      '--text-editor-color-indicator': activeColor,
                    } as CSSProperties
                  }
                />
                <div
                  className={cn(
                    'flex-center size-6 shrink-0 transition-transform duration-200',
                    colorPickerOpen && 'rotate-180'
                  )}
                >
                  <ChevronDown size={12} />
                </div>
              </button>

              <TextEditorColorPickerPopover
                editor={editor}
                isOpen={colorPickerOpen}
                onClose={() => setColorPickerOpen(false)}
                onColorChange={setSelectedColor}
                containerRef={colorPickerContainerRef}
              />
            </div>

            <TextEditorButton
              icon={<ItalicIcon />}
              label="Italic"
              active={italicActive}
              className={inlineButtonClassName}
              onClick={handleItalicToggle}
            />

            <TextEditorButton
              icon={<UnderlineIcon />}
              label="Underline"
              active={underlineActive}
              className={inlineButtonClassName}
              onClick={handleUnderlineToggle}
            />

            <div className="flex h-8 items-center gap-1 rounded-md bg-[#f3f3f3] p-px">
              {TEXT_ALIGN_OPTIONS.map(option => {
                const active = textAlignSelected.value === option.value;

                return (
                  <TextEditorButton
                    key={option.value}
                    icon={option.label}
                    label={`Align ${option.value}`}
                    active={active}
                    className={cn(
                      'h-[30px] w-[30px] rounded-[5px] hover:bg-[#FAFAFB] active:bg-[#F5F8FF] aria-pressed:bg-white aria-pressed:shadow-sm text-text-primary',
                      !active && 'bg-transparent shadow-none'
                    )}
                    onClick={() => handleTextAlignSelect(option)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div
          data-state={editorFocused ? 'focused' : 'default'}
          className={cn(
            'rounded-lg border px-4 py-3 transition-colors duration-150',
            editorFocused
              ? 'border-primary bg-bg-base'
              : 'border-transparent bg-border-neutral'
          )}
          style={{ textAlign: defaultAlign }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }
);

TextEditor.displayName = 'TextEditor';
