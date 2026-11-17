import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useFabricContext } from '../../context/FabricContext';
import { loadCustomFont } from '../../utils/fontLoader';
import FontFamily from './FontFamily';

import type { Dispatch } from 'react';

jest.mock('../../context/FabricContext', () => ({
  useFabricContext: jest.fn(),
}));

jest.mock('../../utils/fontLoader', () => ({
  ...jest.requireActual('../../utils/fontLoader'),
  loadCustomFont: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/components/molecules/selector', () => ({
  Selector: ({
    placeholder,
    options,
    selected,
    onSelect,
  }: {
    placeholder: string;
    options: { value: string; label: string }[];
    selected: { value: string };
    onSelect: Dispatch<{ value: string; label: string }>;
  }) => (
    <select
      aria-label={placeholder}
      value={selected.value}
      onChange={event => {
        const option = options.find(item => item.value === event.target.value);
        if (option) onSelect(option);
      }}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

describe('포스터 글꼴 굵기 변경', () => {
  it.each([
    ['나눔 고딕', '400', '700', 'normal'],
    ['Old Standard TT', '700', '400', 'italic'],
  ])(
    '%s 글꼴의 굵기를 기울임 상태에서 %s → %s로 바꾸면 %s 파일을 불러온다',
    async (family, weight, nextWeight, faceStyle) => {
      const canvas = { getActiveObject: () => null };
      const applyRichStyle = jest.fn();
      jest.mocked(useFabricContext).mockReturnValue({
        canvas,
        activeInfo: {
          styles: {
            fontFamily: family,
            fontWeight: weight,
            fontStyle: 'italic',
          },
        },
        applyRichStyle,
      } as unknown as ReturnType<typeof useFabricContext>);

      render(<FontFamily />);
      fireEvent.change(screen.getByRole('combobox', { name: '굵기' }), {
        target: { value: nextWeight },
      });

      await waitFor(() =>
        expect(applyRichStyle).toHaveBeenCalledWith(
          { fontWeight: nextWeight },
          canvas
        )
      );
      expect(loadCustomFont).toHaveBeenCalledWith(
        family,
        nextWeight,
        faceStyle
      );
    }
  );
});
