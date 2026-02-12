'use client';
import { Label } from '@/components/atoms/label';
import { Selector } from '@/components/molecules/selector';
import { TextField } from '@/components/molecules/text-field';

function Map() {
  return (
    <div className="flex flex-col justify-center items-center gap-1 w-93.75 h-65">
      <TextField label="제목" />
      <section>
        <Label>주소</Label>
        <Selector
          options={[
            { value: '국내', label: '국내' },
            { value: '국외', label: '국외' },
          ]}
          onSelect={() => {}}
          selected={null}
        />
      </section>
      <TextField label="예식장명" />
      <TextField label="층과 홀" />
      <TextField label="연락처" />
    </div>
  );
}
export default Map;
