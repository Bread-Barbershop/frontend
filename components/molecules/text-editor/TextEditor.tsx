'use client';

import {
  EditorContent,
  JSONContent,
  type Editor,
  useEditor,
} from '@tiptap/react';
import { ChevronDown } from 'lucide-react';
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import TextEditorButton from '@/components/atoms/text-editor-button/TextEditorButton';
import AlignCenterIcon from '@/shared/assets/icons/alignCenter.svg';
import AlignLeftIcon from '@/shared/assets/icons/alignLeft.svg';
import AlignRightIcon from '@/shared/assets/icons/alignRight.svg';
import FontColorIcon from '@/shared/assets/icons/color.svg';
import ItalicIcon from '@/shared/assets/icons/italic.svg';
import UnderlineIcon from '@/shared/assets/icons/underline.svg';
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
  type FontFamilyOption,
  type FontSizeOption,
  type FontWeightOption,
  type TextAlignOption,
  type TextAlignValue,
} from './utils/textEditorOptions';
import { createTextEditorBarExtensions } from './utils/tiptapExtensions';

interface TextEditorProps {
  value?: JSONContent | null;
  defaultText?: string;
  defaultAlign?: TextAlignValue;
  onChange?: (json: JSONContent) => void;
}

const TEXT_ALIGN_OPTIONS: TextAlignOption[] = [
  { label: <AlignRightIcon />, value: 'right' },
  { label: <AlignCenterIcon />, value: 'center' },
  { label: <AlignLeftIcon />, value: 'left' },
];

const DEFAULT_FONT_FAMILY_OPTION = FONT_FAMILY_OPTIONS[0];
const DEFAULT_FONT_WEIGHT_OPTION = getDefaultFontWeightOption(
  DEFAULT_FONT_FAMILY_OPTION
);
const DEFAULT_FONT_SIZE_OPTION = FONT_SIZE_OPTIONS[0];
const DEFAULT_TEXT_ALIGN_OPTION = TEXT_ALIGN_OPTIONS[1];
const DEFAULT_EDITOR_TEXT = '내용을 입력해주세요';

export function TextEditor({
  value,
  defaultText = DEFAULT_EDITOR_TEXT,
  defaultAlign = DEFAULT_TEXT_ALIGN_OPTION.value,
  onChange,
}: TextEditorProps) {
  const [, forceUpdate] = useReducer((count: number) => count + 1, 0);
  const [fontFamilySelected, setFontFamilySelected] =
    useState<FontFamilyOption>(DEFAULT_FONT_FAMILY_OPTION);
  const [fontWeightSelected, setFontWeightSelected] =
    useState<FontWeightOption>(DEFAULT_FONT_WEIGHT_OPTION);
  const [fontSizeSelected, setFontSizeSelected] = useState<FontSizeOption>(
    DEFAULT_FONT_SIZE_OPTION
  );
  const [textAlignSelected, setTextAlignSelected] = useState<TextAlignOption>(
    TEXT_ALIGN_OPTIONS.find(opt => opt.value === defaultAlign) ??
      DEFAULT_TEXT_ALIGN_OPTION
  );
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const editorRef = useRef<Editor | null>(null);
  const fontSizeSelectedRef = useRef(DEFAULT_FONT_SIZE_OPTION);
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

    const command = editor.chain().focus();
    if (!selected.value) {
      command.unsetFontFamily().setFontWeight(nextWeight.value).run();
      return;
    }

    command.setFontFamily(selected.value).setFontWeight(nextWeight.value).run();
  };

  const handleFontWeightSelect = (
    option: FontWeightOption | { label: string; value: string }
  ) => {
    const selected = option as FontWeightOption;
    setFontWeightSelected(selected);
    editor.chain().focus().setFontWeight(selected.value).run();
  };

  const handleFontSizeSelect = (
    option: FontSizeOption | { label: string; value: string }
  ) => {
    const selected = option as FontSizeOption;
    setFontSizeSelected(selected);
    editor.chain().focus().setFontSize(selected.value).run();
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
      command.unsetItalic().run();
      return;
    }

    command.setItalic().run();
  };

  const handleUnderlineToggle = () => {
    const command = editor.chain().focus();

    if (underlineActive) {
      command.unsetUnderline().run();
      return;
    }

    command.setUnderline().run();
  };

  return (
    <div className="w-full space-y-1">
      <div className="flex flex-col gap-1">
        <div className="flex h-8 items-center justify-between">
          <Selector<FontFamilyOption>
            options={FONT_FAMILY_OPTIONS}
            selected={fontFamilySelected}
            onSelect={handleFontFamilySelect}
            placeholder="Font"
            className="w-[210px] font-semibold"
            triggerClassName="h-8 bg-white border border-[#eaeaea]"
            triggerButtonClassName="pl-3 pr-1"
            labelClassName="justify-start text-left text-sm"
            optionLabelClassName="justify-start text-left text-sm"
            showCheckbox={false}
          />

          <Selector<FontWeightOption>
            options={fontWeightOptions}
            selected={fontWeightSelected}
            onSelect={handleFontWeightSelect}
            placeholder="Weight"
            className="w-[112px] font-semibold"
            triggerClassName="h-8 bg-white border border-[#eaeaea]"
            triggerButtonClassName="pl-3 pr-1"
            labelClassName="justify-start text-left text-sm"
            optionLabelClassName="justify-start text-left text-sm"
            showCheckbox={false}
          />
        </div>

        <div className="flex h-8 items-center justify-between">
          <Selector<FontSizeOption>
            options={FONT_SIZE_OPTIONS}
            selected={fontSizeSelected}
            onSelect={handleFontSizeSelect}
            placeholder="Size"
            className="w-[78px] font-semibold"
            triggerClassName="h-8 bg-[#f3f3f3]"
            openTriggerClassName="bg-white"
            triggerButtonClassName="pl-3 pr-1"
            labelClassName="justify-start text-left text-sm"
            optionLabelClassName="justify-start text-left text-sm"
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

          <div className="flex h-8 items-center rounded-md bg-[#f3f3f3] p-px">
            {TEXT_ALIGN_OPTIONS.map(option => {
              const active = textAlignSelected.value === option.value;

              return (
                <TextEditorButton
                  key={option.value}
                  icon={option.label}
                  label={`Align ${option.value}`}
                  active={active}
                  className={cn(
                    'h-[30px] w-[30px] rounded-[5px] hover:bg-[#FAFAFB] active:bg-[#F5F8FF] aria-pressed:bg-white aria-pressed:shadow-sm',
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
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
