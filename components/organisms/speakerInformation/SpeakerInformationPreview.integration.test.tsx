import { fireEvent, render, screen } from '@testing-library/react';

import { SpeakerInformationPreview } from './SpeakerInformationPreview';

import type { EditorBlock } from '@/shared/types/block';

jest.mock('@/shared/assets/icons/slideArrow.svg', () => () => null);
jest.mock('@/shared/data/registry/registry', () => ({ blockRegistry: {} }));

const block: EditorBlock<'speakerInformation'> = {
  id: 'speakers',
  type: 'seminar',
  component: 'speakerInformation',
  props: {
    title: '연사정보',
    checkedSubTitle: false,
    subTitle: '',
    speakers: ['김연사', '이연사'].map(name => ({
      id: name,
      name,
      image: [],
      messageHtml: '',
      messageJson: null,
    })),
  },
};

describe('두 명의 연사 카드', () => {
  it.each([false, true])('각 연사를 한 번씩 표시한다 (하객 화면 %s)', isGuestPage => {
    render(<SpeakerInformationPreview blockInfo={block} className="" isGuestPage={isGuestPage} />);
    expect(screen.getAllByText('김연사')).toHaveLength(1);
    expect(screen.getAllByText('이연사')).toHaveLength(1);
  });

  it('양 끝에서 멈추고 버튼과 스와이프가 같은 페이지 번호를 표시한다', () => {
    render(<SpeakerInformationPreview blockInfo={block} className="" />);
    const viewport = screen.getByRole('region', { name: '연사 카드' });
    const previous = screen.getByRole('button', { name: '이전 버튼' });
    const next = screen.getByRole('button', { name: '다음 버튼' });
    const slideWidth = 360;
    Object.defineProperty(viewport, 'clientWidth', { value: slideWidth });
    viewport.scrollTo = jest.fn();

    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent('1 / 2');

    fireEvent.click(next);
    expect(viewport.scrollTo).toHaveBeenCalledWith({ left: slideWidth });
    fireEvent.scroll(viewport, { target: { scrollLeft: slideWidth } });
    expect(previous).toBeEnabled();
    expect(next).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('2 / 2');

    fireEvent.click(previous);
    expect(viewport.scrollTo).toHaveBeenCalledWith({ left: 0 });
    fireEvent.scroll(viewport, { target: { scrollLeft: 0 } });
    expect(screen.getByRole('status')).toHaveTextContent('1 / 2');
    expect(previous).toBeDisabled();
  });
});
