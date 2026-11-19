import { fireEvent, render, screen } from '@testing-library/react';

import ColorPickerBase from './ColorPickerBase';

describe('투명도 유지가 켜진 색상 선택기', () => {
  it.each([0, 0.6, 1])(
    '알파값 %s에서 HEX와 최근 색상을 선택해도 투명도를 유지한다',
    alpha => {
      const onChange = jest.fn();
      render(
        <ColorPickerBase
          defaultValue={{ h: 0, s: 0, v: 100, a: alpha }}
          preserveAlpha
          onChange={onChange}
        />
      );

      const hexInput = screen.getByRole('textbox', { name: 'Hex color value' });
      const label = `투명도 ${Math.round((1 - alpha) * 100)}%`;
      fireEvent.change(hexInput, { target: { value: '#182433' } });
      expect(onChange).toHaveBeenLastCalledWith({
        hex: '#182433',
        hsva: expect.objectContaining({ a: alpha }),
      });
      expect(screen.getByText(label)).toBeVisible();

      fireEvent.click(
        screen.getByRole('button', { name: 'Select color #FFFFFF' })
      );
      expect(onChange).toHaveBeenLastCalledWith({
        hex: '#FFFFFF',
        hsva: expect.objectContaining({ a: alpha }),
      });
      expect(screen.getByText(label)).toBeVisible();
    }
  );
});
