'use client';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

export function FaqBlock({ blockInfo, id }: { blockInfo: EditorBlock<'faq'>; id: string }) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const { title, items } = blockInfo.props;
  const change = (index: number, key: 'question' | 'answer', value: string) =>
    updateBlock(id, { items: items.map((item, i) => i === index ? { ...item, [key]: value } : item) });

  return (
    <LeftEditorWrapper ariaLabel="자주 묻는 질문" className="gap-3">
      <NavigationBar>자주 묻는 질문 편집</NavigationBar>
      <div className="flex flex-col gap-4 py-2">
        <label className="flex flex-col gap-1 text-sm">제목
          <input className="h-10 rounded-md border border-border-divider px-3" maxLength={50}
            value={title} onChange={e => updateBlock(id, { title: e.target.value })} />
        </label>
        {items.map((item, index) => (
          <section key={index} className="flex flex-col gap-2 rounded-lg border border-border-divider p-3">
            <label className="flex flex-col gap-1 text-xs">질문
              <input className="h-10 rounded-md border border-border-divider px-3 text-sm"
                value={item.question} maxLength={120}
                onChange={e => change(index, 'question', e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-xs">답변
              <textarea className="min-h-20 rounded-md border border-border-divider p-3 text-sm"
                value={item.answer} maxLength={1000}
                onChange={e => change(index, 'answer', e.target.value)} />
            </label>
            <button type="button" className="self-end text-xs text-red-600"
              onClick={() => updateBlock(id, { items: items.filter((_, i) => i !== index) })}>
              항목 삭제
            </button>
          </section>
        ))}
        <button type="button" className="rounded-md border border-border-divider py-3 text-sm text-primary"
          onClick={() => updateBlock(id, { items: [...items, { question: '', answer: '' }] })}>
          + 질문 추가
        </button>
      </div>
    </LeftEditorWrapper>
  );
}
