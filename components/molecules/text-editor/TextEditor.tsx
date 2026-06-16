'use client';

import {
  type ChainedCommands,
  EditorContent,
  JSONContent,
  type Editor,
  useEditor,
} from '@tiptap/react';
import { ChevronDown } from 'lucide-react';
import React, {
  type CSSProperties,
  useEffect,
  useCallback,
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
import {
  FontFamilyOption,
  FontWeightOption,
  getFallbackWeight,
} from '@/shared/fonts/fontOptions';
import { cn } from '@/shared/utils/cn';

import { Selector } from '../selector';

import TextEditorColorPickerPopover from './components/TextEditorColorPickerPopover';
import { isTextMarkFullyActive } from './utils/markState';
import {
  normalizePastedHtmlToPlainText,
  normalizePastedText,
} from './utils/paste';
import {
  createFontWeightOptions,
  findFontWeightOption,
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

type SavedTextSelection = {
  from: number;
  to: number;
};

type TextStyleAttributes = {
  fontFamily?: unknown;
  fontWeight?: unknown;
  fontSize?: unknown;
  color?: unknown;
};

type TextMark = {
  type: {
    name: string;
  };
  attrs: TextStyleAttributes;
};

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
const MIXED_STYLE_VALUE = '__mixed__';

const MIXED_FONT_FAMILY_OPTION: FontFamilyOption = {
  label: 'Mixed',
  value: MIXED_STYLE_VALUE,
  weights: [],
  defaultWeight: '',
};

const MIXED_FONT_WEIGHT_OPTION: FontWeightOption = {
  label: 'Mixed',
  value: MIXED_STYLE_VALUE,
};

const MIXED_FONT_SIZE_OPTION: FontSizeOption = {
  label: 'Mixed',
  value: MIXED_STYLE_VALUE,
};

const getTextStyleAttributesFromMarks = (
  marks: readonly TextMark[] | null | undefined
): TextStyleAttributes => {
  return marks?.find(mark => mark.type.name === 'textStyle')?.attrs ?? {};
};

const getTextStyleAttributesAtSelection = (
  editor: Editor,
  pendingStoredMarkPosition?: number | null
): TextStyleAttributes => {
  const { state } = editor;
  const { selection } = state;

  if (selection.empty) {
    const shouldUseStoredMarks =
      pendingStoredMarkPosition !== null &&
      pendingStoredMarkPosition !== undefined &&
      pendingStoredMarkPosition === selection.from;

    const beforeTextStyle = getTextStyleAttributesFromMarks(
      selection.$from.nodeBefore?.marks
    );
    if (!shouldUseStoredMarks && Object.keys(beforeTextStyle).length > 0) {
      return beforeTextStyle;
    }

    const storedTextStyle = getTextStyleAttributesFromMarks(state.storedMarks);
    if (shouldUseStoredMarks && Object.keys(storedTextStyle).length > 0) {
      return storedTextStyle;
    }

    const afterTextStyle = getTextStyleAttributesFromMarks(
      selection.$from.nodeAfter?.marks
    );
    if (Object.keys(afterTextStyle).length > 0) return afterTextStyle;

    return storedTextStyle;
  }

  const selectedValues: Record<
    'fontFamily' | 'fontWeight' | 'fontSize' | 'color',
    Set<unknown>
  > = {
    fontFamily: new Set(),
    fontWeight: new Set(),
    fontSize: new Set(),
    color: new Set(),
  };

  state.doc.nodesBetween(selection.from, selection.to, node => {
    if (!node.isText) return;

    const textStyle = getTextStyleAttributesFromMarks(node.marks);

    selectedValues.fontFamily.add(textStyle.fontFamily);
    selectedValues.fontWeight.add(textStyle.fontWeight);
    selectedValues.fontSize.add(textStyle.fontSize);
    selectedValues.color.add(textStyle.color);

    return;
  });

  return {
    fontFamily:
      selectedValues.fontFamily.size > 1
        ? MIXED_STYLE_VALUE
        : selectedValues.fontFamily.values().next().value,
    fontWeight:
      selectedValues.fontWeight.size > 1
        ? MIXED_STYLE_VALUE
        : selectedValues.fontWeight.values().next().value,
    fontSize:
      selectedValues.fontSize.size > 1
        ? MIXED_STYLE_VALUE
        : selectedValues.fontSize.values().next().value,
    color:
      selectedValues.color.size > 1
        ? MIXED_STYLE_VALUE
        : selectedValues.color.values().next().value,
  };
};

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

    const [editorBaseStyles] = useState(() =>
      getInitialEditorStyles(null, defaultAlign)
    );
    const initialStyles = editorBaseStyles;

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
    const savedSelectionRef = useRef<SavedTextSelection | null>(null);
    const pendingStoredMarkPositionRef = useRef<number | null>(null);
    const colorPickerContainerRef = useRef<HTMLDivElement>(null);
    const fontWeightOptions = useMemo(
      () =>
        createFontWeightOptions(
          fontFamilySelected.value === MIXED_STYLE_VALUE
            ? editorBaseStyles.fontFamily
            : fontFamilySelected
        ),
      [editorBaseStyles.fontFamily, fontFamilySelected]
    );

    const loadEditorFont = useCallback(
      async (family: string, weight: string) => {
        try {
          await preloadFontFamilyWeights(family);
          await loadCustomFont(family, weight);
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Failed to load editor font.', {
              family,
              weight,
              error,
            });
          }
        }
      },
      []
    );

    const saveSelection = useCallback((editor: Editor) => {
      const { from, to } = editor.state.selection;
      savedSelectionRef.current = { from, to };

      if (
        pendingStoredMarkPositionRef.current !== null &&
        (from !== to || from !== pendingStoredMarkPositionRef.current)
      ) {
        pendingStoredMarkPositionRef.current = null;
      }
    }, []);

    const getCommandAtSavedSelection = useCallback(
      (editor: Editor): ChainedCommands => {
        const command = editor.chain();
        const savedSelection = savedSelectionRef.current;

        if (!savedSelection) {
          return command.focus();
        }

        const docSize = editor.state.doc.content.size;
        const from = Math.min(Math.max(savedSelection.from, 0), docSize);
        const to = Math.min(Math.max(savedSelection.to, 0), docSize);

        if (from === to) {
          return command.setTextSelection(from);
        }

        return command.setTextSelection({ from, to });
      },
      []
    );

    const runAtSavedSelection = useCallback(
      (
        editor: Editor,
        applyCommand: (command: ChainedCommands) => ChainedCommands
      ) => {
        const savedSelection = savedSelectionRef.current;
        const selectionIsEmpty =
          savedSelection && savedSelection.from === savedSelection.to
            ? true
            : !savedSelection && editor.state.selection.empty;
        const storedMarkPosition =
          savedSelection?.from ?? editor.state.selection.from;
        pendingStoredMarkPositionRef.current = selectionIsEmpty
          ? storedMarkPosition
          : null;

        let command = applyCommand(getCommandAtSavedSelection(editor));

        if (!selectionIsEmpty) {
          command = command.command(({ tr }) => {
            tr.setStoredMarks(null);
            return true;
          });
        }

        command.run();
        editor.view.focus();
        saveSelection(editor);
      },
      [getCommandAtSavedSelection, saveSelection]
    );

    const syncToolbarState = useCallback(
      (editor: Editor) => {
        const textStyleAttributes = getTextStyleAttributesAtSelection(
          editor,
          pendingStoredMarkPositionRef.current
        );
        const paragraphAttributes = editor.getAttributes('paragraph');

        const nextFontFamily =
          textStyleAttributes.fontFamily === MIXED_STYLE_VALUE
            ? MIXED_FONT_FAMILY_OPTION
            : typeof textStyleAttributes.fontFamily === 'string'
              ? (FONT_FAMILY_OPTIONS.find(
                  option => option.value === textStyleAttributes.fontFamily
                ) ?? editorBaseStyles.fontFamily)
              : editorBaseStyles.fontFamily;

        const nextFontWeightFamily =
          nextFontFamily.value === MIXED_STYLE_VALUE
            ? editorBaseStyles.fontFamily
            : nextFontFamily;
        const nextFontWeight =
          textStyleAttributes.fontWeight === MIXED_STYLE_VALUE
            ? MIXED_FONT_WEIGHT_OPTION
            : typeof textStyleAttributes.fontWeight === 'string'
              ? findFontWeightOption(
                  createFontWeightOptions(nextFontWeightFamily),
                  textStyleAttributes.fontWeight
                )
              : getDefaultFontWeightOption(nextFontWeightFamily);

        const fontSize =
          textStyleAttributes.fontSize === MIXED_STYLE_VALUE
            ? MIXED_STYLE_VALUE
            : typeof textStyleAttributes.fontSize === 'string'
              ? textStyleAttributes.fontSize
              : editorBaseStyles.fontSize.value;
        const nextFontSize =
          fontSize === MIXED_STYLE_VALUE
            ? MIXED_FONT_SIZE_OPTION
            : (FONT_SIZE_OPTIONS.find(option => option.value === fontSize) ?? {
                label: fontSize.replace('px', ''),
                value: fontSize,
              });

        const textAlign =
          typeof paragraphAttributes.textAlign === 'string'
            ? paragraphAttributes.textAlign
            : defaultAlign;
        const nextTextAlign =
          TEXT_ALIGN_OPTIONS.find(option => option.value === textAlign) ??
          editorBaseStyles.textAlign;

        const nextColor =
          textStyleAttributes.color === MIXED_STYLE_VALUE
            ? selectedColor
            : typeof textStyleAttributes.color === 'string'
              ? textStyleAttributes.color
              : editorBaseStyles.color;

        setFontFamilySelected(prev =>
          prev.value === nextFontFamily.value ? prev : nextFontFamily
        );
        setFontWeightSelected(prev =>
          prev.value === nextFontWeight.value ? prev : nextFontWeight
        );
        setFontSizeSelected(prev =>
          prev.value === nextFontSize.value ? prev : nextFontSize
        );
        setTextAlignSelected(prev =>
          prev.value === nextTextAlign.value ? prev : nextTextAlign
        );
        setSelectedColor(prev => (prev === nextColor ? prev : nextColor));
      },
      [defaultAlign, editorBaseStyles, selectedColor]
    );

    useEffect(() => {
      void loadEditorFont(fontFamilySelected.value, fontWeightSelected.value);
    }, [fontFamilySelected.value, fontWeightSelected.value, loadEditorFont]);

    const editorContentStyle = useMemo<CSSProperties>(
      () => ({
        fontFamily: editorBaseStyles.fontFamily.style?.fontFamily,
        fontWeight: editorBaseStyles.fontWeight.value,
        fontSize:
          editorBaseStyles.fontSize.value || DEFAULT_FONT_SIZE_OPTION.value,
        color: editorBaseStyles.color,
        textAlign: editorBaseStyles.textAlign.value,
      }),
      [editorBaseStyles]
    );

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
          return normalizePastedHtmlToPlainText(html);
        },
        transformPastedText(text) {
          return normalizePastedText(text);
        },
      },
      onCreate({ editor }) {
        editorRef.current = editor;
        saveSelection(editor);
        syncToolbarState(editor);
        forceUpdate();
      },
      onUpdate({ editor }) {
        saveSelection(editor);
        syncToolbarState(editor);
        onChange?.(editor.getJSON());
        forceUpdate();
      },
      onSelectionUpdate({ editor }) {
        saveSelection(editor);
        syncToolbarState(editor);
        forceUpdate();
      },
      onTransaction({ editor }) {
        syncToolbarState(editor);
        forceUpdate();
      },
      onFocus({ editor }) {
        syncToolbarState(editor);
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

    const activeColor = selectedColor;
    const italicActive = isTextMarkFullyActive(editor, 'italic');
    const underlineActive = isTextMarkFullyActive(editor, 'underline');
    const editorFocused = editor.isFocused;
    const inlineButtonClassName =
      'bg-white hover:bg-[#FAFAFB] active:bg-[#F5F8FF] aria-pressed:bg-[#F5F8FF] aria-pressed:text-[#1F72EF]';

    const handleFontFamilySelect = (
      option: FontFamilyOption | { label: string; value: string }
    ) => {
      const selected = option as FontFamilyOption;
      const nextWeight = findFontWeightOption(
        createFontWeightOptions(selected),
        getFallbackWeight(selected.value, fontWeightSelected.value)
      );

      setFontFamilySelected(selected);
      setFontWeightSelected(nextWeight);

      runAtSavedSelection(editor, command =>
        command.setFontFamily(selected.value).setFontWeight(nextWeight.value)
      );
      void loadEditorFont(selected.value, nextWeight.value);
    };

    const handleFontWeightSelect = (
      option: FontWeightOption | { label: string; value: string }
    ) => {
      const selected = option as FontWeightOption;
      setFontWeightSelected(selected);
      runAtSavedSelection(editor, command =>
        command.setFontWeight(selected.value)
      );
      void loadEditorFont(
        fontFamilySelected.value === MIXED_STYLE_VALUE
          ? editorBaseStyles.fontFamily.value
          : fontFamilySelected.value,
        selected.value
      );
    };

    const handleFontSizeSelect = (
      option: FontSizeOption | { label: string; value: string }
    ) => {
      const selected = option as FontSizeOption;
      setFontSizeSelected(selected);
      if (selected.value) {
        runAtSavedSelection(editor, command =>
          command.setFontSize(selected.value)
        );
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
        runAtSavedSelection(editor, command =>
          command.setFontSize(option.value)
        );
      }
    };

    const handleFontSizeInputBlur = () => {
      if (!fontSizeSelected.value) {
        setFontSizeSelected(DEFAULT_FONT_SIZE_OPTION);
        runAtSavedSelection(editor, command =>
          command.setFontSize(DEFAULT_FONT_SIZE_OPTION.value)
        );
      }
    };

    const handleTextAlignSelect = (
      option: TextAlignOption | { label: string; value: string }
    ) => {
      const selected = option as TextAlignOption;
      setTextAlignSelected(selected);
      runAtSavedSelection(editor, command =>
        command.setTextAlign(selected.value)
      );
    };

    const handleColorPickerToggle = () => {
      setColorPickerOpen(prev => !prev);
    };

    const handleItalicToggle = () => {
      if (italicActive) {
        runAtSavedSelection(editor, command =>
          command.unsetItalic().setFontStyleOverride('normal')
        );
        return;
      }

      runAtSavedSelection(editor, command =>
        command.setItalic().setFontStyleOverride(null)
      );
    };

    const handleUnderlineToggle = () => {
      if (underlineActive) {
        runAtSavedSelection(editor, command =>
          command.unsetUnderline().setTextDecorationOverride('none')
        );
        return;
      }

      runAtSavedSelection(editor, command =>
        command.setUnderline().setTextDecorationOverride(null)
      );
    };

    const handleColorChange = (color: string) => {
      setSelectedColor(color);
      runAtSavedSelection(editor, command => command.setColor(color));
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
                isOpen={colorPickerOpen}
                initialHex={activeColor}
                onClose={() => setColorPickerOpen(false)}
                onColorChange={handleColorChange}
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
          style={editorContentStyle}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }
);

TextEditor.displayName = 'TextEditor';
