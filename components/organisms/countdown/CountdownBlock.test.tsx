import { fireEvent, render, screen } from '@testing-library/react';

import { CountdownBlock } from './CountdownBlock';

import type { EditorBlock } from '@/shared/types/block';

const mockUpdateBlock = jest.fn();
const mockWarning = jest.fn();

jest.mock('@/shared/store/editorStore/useEditorStore', () => ({
  useEditorStore: (selector: CallableFunction) =>
    selector({ updateBlock: mockUpdateBlock }),
}));

jest.mock('@/shared/hooks/useToast', () => ({
  useToast: () => ({ warning: mockWarning }),
}));

const block: EditorBlock<'countdown'> = {
  id: 'countdown-1',
  component: 'countdown',
  type: 'wedding',
  props: {
    title: '우리의 특별한 날',
    eventDateTime: '',
    onDayMessage: '오늘은 특별한 날입니다!',
    afterMessage: '함께해 주셔서 감사합니다.',
  },
};

describe('CountdownBlock 행사 일시 입력', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('datetime-local의 부분 입력은 빈 문자열로 저장하지 않고 경고한다', () => {
    const blockWithDate: EditorBlock<'countdown'> = {
      ...block,
      props: { ...block.props, eventDateTime: '2027-01-01T10:00' },
    };
    render(<CountdownBlock blockInfo={blockWithDate} id={block.id} />);
    const input = screen.getByLabelText('행사 일시 (한국 시간)');
    Object.defineProperty(input, 'validity', {
      configurable: true,
      value: { badInput: true },
    });

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    expect(mockUpdateBlock).not.toHaveBeenCalled();
    expect(mockWarning).toHaveBeenCalledWith('올바른 날짜와 시간을 입력해 주세요.');
    expect(mockWarning).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('2027-01-01T10:00');
  });

  it('과거 날짜와 자정을 유효한 카운트다운 값으로 저장한다', () => {
    render(<CountdownBlock blockInfo={block} id={block.id} />);

    fireEvent.change(screen.getByLabelText('행사 일시 (한국 시간)'), {
      target: { value: '1900-01-01T00:00' },
    });

    expect(mockUpdateBlock).toHaveBeenCalledWith(block.id, {
      eventDateTime: '1900-01-01T00:00',
    });
    expect(mockWarning).not.toHaveBeenCalled();
  });

  it('유효한 datetime-local 필드는 명시적으로 비울 수 있다', () => {
    const blockWithDate: EditorBlock<'countdown'> = {
      ...block,
      props: { ...block.props, eventDateTime: '2027-01-01T10:00' },
    };
    render(<CountdownBlock blockInfo={blockWithDate} id={block.id} />);

    fireEvent.change(screen.getByLabelText('행사 일시 (한국 시간)'), {
      target: { value: '' },
    });

    expect(mockUpdateBlock).toHaveBeenCalledWith(block.id, {
      eventDateTime: '',
    });
  });
});
