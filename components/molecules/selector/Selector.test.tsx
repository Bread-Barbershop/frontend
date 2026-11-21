import { fireEvent, render, screen, within } from '@testing-library/react';

import { Selector } from './Selector';

const options = [
  { value: '10', label: '10' },
  { value: '12', label: '12', disabled: true },
  { value: '14', label: '14' },
];

describe('공통 드롭다운', () => {
  it('키보드로 선택할 때 비활성 항목을 건너뛴다', () => {
    const onSelect = jest.fn();
    render(
      <Selector
        ariaLabel="크기"
        options={options}
        selected={options[0]}
        onSelect={onSelect}
      />
    );
    const trigger = screen.getByRole('combobox', { name: '크기' });
    fireEvent.click(trigger);
    const menu = screen.getByRole('listbox', { name: '크기' });
    const last = within(menu).getByRole('option', { name: '14' });

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(trigger).toHaveAttribute('aria-activedescendant', last.id);
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith(options[2]);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('마지막 항목에서 직접입력을 열고 입력값을 전달한다', () => {
    const onInputChange = jest.fn();
    render(
      <Selector
        ariaLabel="크기"
        options={options}
        selected={null}
        onSelect={jest.fn()}
        onInputChange={onInputChange}
      />
    );
    const trigger = screen.getByRole('combobox', { name: '크기' });
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'End' });
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: '직접입력' }).id
    );
    fireEvent.keyDown(trigger, { key: 'Enter' });
    const input = screen.getByRole('textbox', { name: '크기' });

    expect(input).toHaveFocus();
    fireEvent.change(input, { target: { value: '17' } });
    expect(onInputChange).toHaveBeenCalledWith('17');
  });
});
