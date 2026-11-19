import { fireEvent, render, screen, within } from '@testing-library/react';

import GuestRenderer from '@/app/guest/[id]/components/GuestRenderer';
import { normalizeGuestBlock } from '@/app/guest/[id]/validation/normalizeGuestBlock';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { MyFamilyWedding } from './MyFamilyWedding';
import { MyFamilyWeddingPreview } from './MyFamilyWeddingPreview';

import type { SVGProps } from 'react';

jest.mock('@/shared/assets/icons/menu.svg', () => () => null);
jest.mock('@/shared/assets/icons/check.svg', () => () => null);
jest.mock(
  '@/shared/assets/icons/flower.svg',
  () =>
    function FlowerIcon(props: SVGProps<SVGSVGElement>) {
      return <svg {...props} />;
    }
);

const legacyBlock: EditorBlock<'myFamilyWedding'> = {
  id: 'wedding-family',
  type: 'wedding',
  component: 'myFamilyWedding',
  props: {
    groomFamily: [
      { id: 'g1', relation: '부', name: '김영수', flower: true },
      { id: 'g2', relation: '모', name: '박정희', flower: false },
    ],
    brideFamily: [{ id: 'b1', relation: '모', name: '이정숙', flower: false }],
  },
};

function FamilyEditor() {
  const block = useEditorStore(
    state => state.block[0]
  ) as EditorBlock<'myFamilyWedding'>;
  return (
    <>
      <MyFamilyWedding blockInfo={block} id={block.id} />
      <MyFamilyWeddingPreview blockInfo={block} className="" />
    </>
  );
}

function renderGuest(saved: unknown) {
  const parsed = normalizeGuestBlock(JSON.parse(JSON.stringify(saved)), 0);
  if (!parsed.ok) throw new Error('가족 소개 블록을 불러오지 못했습니다.');
  return render(
    <GuestRenderer
      blocks={[parsed.block]}
      bulkData={useEditorStore.getState()}
      isGuestPage
    />
  );
}

describe('청첩장 가족 소개의 이름 뒤 문구', () => {
  beforeEach(() => useEditorStore.getState().reset());

  it('기존 청첩장은 기본 문구로 열리고 한쪽씩 수정하거나 지운 문구가 하객 화면에도 반영된다', () => {
    useEditorStore.getState().setBlock([legacyBlock]);
    const editor = render(<FamilyEditor />);
    const suffixInput = (side: string) =>
      within(screen.getByRole('region', { name: side })).getByRole('textbox', {
        name: '이름 뒤 문구',
      });
    expect(suffixInput('신랑 측')).toHaveValue('의 아들');
    expect(suffixInput('신부 측')).toHaveValue('의 딸');

    fireEvent.change(suffixInput('신랑 측'), { target: { value: '의 장남' } });
    expect(screen.getByText('김영수·박정희의 장남')).toBeInTheDocument();
    expect(screen.getByText('이정숙의 딸')).toBeInTheDocument();
    fireEvent.change(suffixInput('신부 측'), { target: { value: '' } });
    expect(screen.getByText('이정숙')).toBeInTheDocument();

    editor.unmount();
    renderGuest(useEditorStore.getState().block[0]);
    expect(screen.getByText('김영수·박정희의 장남')).toBeInTheDocument();
    expect(screen.getByText('이정숙')).toBeInTheDocument();
    expect(screen.queryByText(/의 딸/)).not.toBeInTheDocument();
  });

  it('이름이 비어 있는 가족은 구분점과 꽃을 생략하고 전부 비어 있는 쪽은 문구도 숨긴다', () => {
    const unnamed = { id: '', relation: '모', name: '  ', flower: true };
    renderGuest({
      ...legacyBlock,
      props: {
        groomFamily: [unnamed, ...legacyBlock.props.groomFamily!],
        brideFamily: [unnamed],
        brideFamilySuffix: '의 장녀',
      },
    });
    expect(screen.getByText('김영수·박정희의 아들')).toBeInTheDocument();
    expect(screen.getAllByLabelText('추모 꽃')).toHaveLength(1);
    expect(screen.queryByText(/의 장녀/)).not.toBeInTheDocument();
  });
});
