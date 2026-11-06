'use client';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

type FieldName = Exclude<keyof EditorBlock<'transportation'>['props'], never>;

const FIELD_MAX_LENGTHS: Record<FieldName, number> = {
  title: 40,
  subwayLine: 512,
  subwayStation: 512,
  subwayExit: 512,
  subwayWalk: 512,
  busRoutes: 512,
  shuttleStop: 512,
  shuttleInterval: 512,
  parkingHours: 512,
  alternativeParking: 512,
  navigationUrl: 2048,
};

const GROUPS = [
  {
    name: '지하철',
    fields: [
      { key: 'subwayLine', label: '호선' },
      { key: 'subwayStation', label: '역명' },
      { key: 'subwayExit', label: '출구' },
      { key: 'subwayWalk', label: '도보 안내' },
    ],
  },
  {
    name: '버스',
    fields: [{ key: 'busRoutes', label: '버스 번호 및 하차 정류장' }],
  },
  {
    name: '셔틀버스',
    fields: [
      { key: 'shuttleStop', label: '탑승 장소' },
      { key: 'shuttleInterval', label: '운행 시간 및 간격' },
    ],
  },
  {
    name: '자가용 및 주차',
    fields: [
      { key: 'parkingHours', label: '무료 주차 및 이용 시간' },
      { key: 'alternativeParking', label: '대체 주차장 안내' },
      {
        key: 'navigationUrl',
        label: '내비게이션 링크 (네이버·카카오·티맵·구글 지도)',
      },
    ],
  },
] as const;

export function TransportationBlock({
  blockInfo,
  id,
}: {
  blockInfo: EditorBlock<'transportation'>;
  id: string;
}) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const setField = (key: FieldName, value: string) =>
    updateBlock(id, { [key]: value.slice(0, FIELD_MAX_LENGTHS[key]) });

  return (
    <LeftEditorWrapper ariaLabel="상세 교통 및 주차" className="gap-3">
      <NavigationBar>상세 교통 / 주차 편집</NavigationBar>
      <div className="flex w-full flex-col gap-4 py-2">
        <label className="flex flex-col gap-1 text-sm text-text-primary">
          제목
          <input
            value={blockInfo.props.title}
            maxLength={FIELD_MAX_LENGTHS.title}
            onChange={event => setField('title', event.target.value)}
            className="h-10 rounded-md border border-border-divider px-3 outline-none focus:border-primary"
          />
        </label>
        {GROUPS.map(group => (
          <section
            className="flex flex-col gap-2 rounded-lg border border-border-divider p-3"
            key={group.name}
          >
            <h4 className="text-sm font-semibold text-text-primary">
              {group.name}
            </h4>
            {group.fields.map(field => (
              <label
                className="flex flex-col gap-1 text-xs text-text-secondary"
                key={field.key}
              >
                {field.label}
                <input
                  value={String(blockInfo.props[field.key] ?? '')}
                  maxLength={FIELD_MAX_LENGTHS[field.key]}
                  onChange={event => setField(field.key, event.target.value)}
                  placeholder={
                    field.key === 'navigationUrl'
                      ? 'https://map.naver.com/...'
                      : '입력해 주세요'
                  }
                  className="h-9 w-full min-w-0 rounded-md border border-border-divider px-2 text-sm text-text-primary outline-none focus:border-primary"
                />
              </label>
            ))}
          </section>
        ))}
        <p className="text-xs text-text-secondary">
          입력한 항목만 초대장에 표시됩니다. 내비게이션 주소는 신뢰할 수 있는
          지도 서비스의 HTTPS 링크만 열 수 있습니다.
        </p>
      </div>
    </LeftEditorWrapper>
  );
}
