import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  selectUploadData,
  useEditorStore,
} from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { countdownSchema } from './Countdown.schema';
import { CountdownBlock } from './CountdownBlock';
import { CountdownPreview } from './CountdownPreview';

jest.mock('@/shared/data/registry/registry', () => ({ blockRegistry: {} }));

const block: EditorBlock<'countdown'> = {
  id: 'countdown-1',
  component: 'countdown',
  type: 'wedding',
  props: {
    title: countdownSchema.fields.title.default,
    eventDateTime: '',
    onDayMessage: countdownSchema.fields.onDayMessage.default,
    afterMessage: countdownSchema.fields.afterMessage.default,
  },
};

function Editor() {
  const current = useEditorStore(
    state => state.block[0]
  ) as EditorBlock<'countdown'>;
  return <CountdownBlock blockInfo={current} id={current.id} />;
}

function openEditor(saved = block) {
  useEditorStore.getState().setBlock([saved]);
  return render(<Editor />);
}

function savedBlock(): EditorBlock<'countdown'> {
  const upload = selectUploadData(useEditorStore.getState());
  return JSON.parse(JSON.stringify(upload.block[0]));
}

async function chooseTime(
  user: ReturnType<typeof userEvent.setup>,
  field: string,
  option: string
) {
  await user.click(screen.getByRole('combobox', { name: field }));
  await user.click(screen.getByRole('option', { name: option, exact: true }));
}

describe('D-Day 행사 일시 편집', () => {
  afterEach(() => jest.restoreAllMocks());

  it('키보드로 쓴 날짜를 다시 열어 분 단위 시간을 완성하면 하객 화면이 한국 시간으로 센다', async () => {
    const user = userEvent.setup();
    const editor = openEditor();
    await user.type(screen.getByLabelText('행사 날짜'), '20261215');
    await user.tab();
    expect(screen.getByLabelText('행사 날짜')).toHaveValue('2026-12-15');
    expect(screen.getByText('시간을 선택해 주세요.')).toBeVisible();
    expect(savedBlock().props.eventDateTime).toBe('');

    const draft = savedBlock();
    editor.unmount();
    const reopened = openEditor(draft);
    expect(screen.getByLabelText('행사 날짜')).toHaveValue('2026-12-15');
    await chooseTime(user, '오전/오후', '오후');
    await chooseTime(user, '시', '6시');
    await chooseTime(user, '분', '35분');
    expect(screen.queryByText('시간을 선택해 주세요.')).toBeNull();
    const saved = savedBlock();
    expect(saved.props.eventDateTime).toBe('2026-12-15T18:35');

    reopened.unmount();
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2026-12-14T18:00:00+09:00'));
    render(<CountdownPreview blockInfo={saved} isGuestPage />);
    expect(await screen.findByRole('timer')).toHaveTextContent(
      '01DAYS00HOURS35MIN00SEC'
    );
  });

  it('시간을 먼저 고른 뒤 미완성 날짜나 존재하지 않는 날짜를 수정할 수 있다', async () => {
    const user = userEvent.setup();
    openEditor();
    await chooseTime(user, '분', '00분');
    await chooseTime(user, '시', '12시');
    await chooseTime(user, '오전/오후', '오전');
    expect(screen.getByText('행사 날짜를 입력해 주세요.')).toBeVisible();
    const date = screen.getByLabelText('행사 날짜');
    await user.type(date, '190002');
    await user.tab();
    expect(date).toHaveValue('1900-02');
    expect(date).toHaveAccessibleDescription(
      '올바른 날짜를 YYYY-MM-DD 형식으로 입력해 주세요.'
    );
    await user.type(date, '29');
    expect(date).toHaveValue('1900-02-29');
    expect(savedBlock().props.eventDateTime).toBe('');
    await user.keyboard('{Backspace}8');
    expect(date).toHaveAttribute('aria-invalid', 'false');
    expect(savedBlock().props.eventDateTime).toBe('1900-02-28T00:00');
  });

  it.each([
    ['00:07', '오전', '12', '07'],
    ['12:00', '오후', '12', '00'],
    ['14:35', '오후', '2', '35'],
  ])(
    '기존 %s 값을 복원하고 시간을 비우거나 다시 선택해도 날짜가 유지된다',
    async (time, period, hour, minute) => {
      const user = userEvent.setup();
      openEditor({
        ...block,
        props: { ...block.props, eventDateTime: `2027-01-01T${time}` },
      });
      expect(
        screen.getByRole('combobox', { name: '오전/오후' })
      ).toHaveTextContent(period);
      expect(screen.getByRole('combobox', { name: '시' })).toHaveTextContent(
        `${hour}시`
      );
      const minutes = screen.getByRole('combobox', { name: '분' });
      expect(minutes).toHaveTextContent(`${minute}분`);
      await chooseTime(user, '분', '분');
      expect(minutes).toHaveAccessibleDescription('시간을 선택해 주세요.');
      expect(screen.getByLabelText('행사 날짜')).toHaveValue('2027-01-01');
      expect(savedBlock().props.eventDateTime).toBe('');
      await chooseTime(user, '분', `${minute}분`);
      expect(savedBlock().props.eventDateTime).toBe(`2027-01-01T${time}`);
    }
  );
});
