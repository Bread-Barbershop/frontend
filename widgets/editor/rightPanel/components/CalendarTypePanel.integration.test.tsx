import { fireEvent, render, screen, within } from '@testing-library/react';

import { Calendar } from '@/components/organisms/calendar/Calendar';
import { CalendarPreview } from '@/components/organisms/calendar/CalendarPreview';
import { calendarTemplate } from '@/shared/data/template/componentTemplate';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import TypePanel from './TypePanel';

import type { EditorBlock, InvitationType } from '@/shared/types/block';

jest.mock('@/shared/assets/icons/check.svg', () => () => null);
jest.mock('@/components/molecules/text-editor', () => ({
  TextEditor: () => null,
}));
jest.mock('@/components/atoms/image', () => ({
  Image: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

function CalendarEditor() {
  const block = useEditorStore(
    state => state.block[0]
  ) as EditorBlock<'calendar'>;
  return (
    <>
      <Calendar blockInfo={block} id={block.id} />
      <TypePanel selectedId={block.id} typeArray={calendarTemplate} />
      <section aria-label="초대장 미리보기">
        <CalendarPreview blockInfo={block} className="" onClick={() => {}} />
      </section>
    </>
  );
}

describe('달력 디자인 선택과 표시', () => {
  beforeEach(() => useEditorStore.getState().reset());

  it.each<[InvitationType, string, string]>([
    ['wedding', 'calendarType1', 'calendarType1 이미지'],
    ['birthday', 'calendarType2', 'calendarType2 이미지'],
    ['firstBirthday', 'calendarType3', 'calendarType3 이미지'],
    ['seminar', 'calendarType4', 'calendarType4 이미지'],
    ['etc', 'calendarType5', 'calendarType5 이미지'],
    ['wedding', 'calendarType6', '영문 서명 월력'],
    ['birthday', 'calendarType7', '한지 책력'],
    ['seminar', 'calendarType8', '주간 티켓'],
    ['etc', 'calendarType9', '큰글씨 월력'],
  ])(
    '%s 초대장에서 %s 선택과 캘린더 체크박스가 미리보기를 함께 갱신한다',
    (type, template, name) => {
      useEditorStore.getState().addBlock(type, 'calendar', 'event-date', {
        date: '2026-08-11',
        template: 'calendarType4',
        showCalendar: false,
        showDday: false,
        messageHtml: '<p>현장에서 만나요</p>',
      });
      render(<CalendarEditor />);
      const checkbox = screen.getByRole('checkbox', { name: '캘린더' });
      const design = screen.getByRole('button', { name });
      const preview = within(
        screen.getByRole('region', { name: '초대장 미리보기' })
      );
      expect(checkbox).not.toBeChecked();
      expect(
        screen.queryByRole('button', { pressed: true })
      ).not.toBeInTheDocument();
      expect(preview.queryByText('11')).not.toBeInTheDocument();

      fireEvent.click(design);
      expect(checkbox).toBeChecked();
      expect(design).toHaveAttribute('aria-pressed', 'true');
      expect(preview.getByText('11')).toBeVisible();

      fireEvent.click(checkbox);
      expect(design).toHaveAttribute('aria-pressed', 'false');
      expect(preview.queryByText('11')).not.toBeInTheDocument();
      expect(preview.getByText('2026년 8월 11일')).toBeVisible();
      expect(preview.getByText('현장에서 만나요')).toBeVisible();
      expect(
        screen.getByRole('checkbox', { name: '디데이 카운트다운' })
      ).not.toBeChecked();
      expect(useEditorStore.getState().block[0].props).toMatchObject({
        template,
        showCalendar: false,
      });

      fireEvent.click(checkbox);
      expect(design).toHaveAttribute('aria-pressed', 'true');
      expect(preview.getByText('11')).toBeVisible();
    }
  );
});
