export function LargePrintFilter({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 text-base font-semibold text-neutral-900">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={event => onChange(event.target.checked)}
        className="size-5 accent-neutral-900"
      />
      큰 글씨만 보기
    </label>
  );
}
