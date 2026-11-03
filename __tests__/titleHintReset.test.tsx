import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { Account } from '@/components/organisms/account/Account';
import CoupleIntroduction from '@/components/organisms/couple-introduction/CoupleIntroduction';
import Gallery from '@/components/organisms/gallery/Gallery';
import Greeting from '@/components/organisms/greeting/Greeting';
import { Place } from '@/components/organisms/place/Place';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

jest.mock('@/shared/store/editorStore/useEditorStore');
jest.mock('@/shared/hooks/useToast', () => ({
  useToast: () => ({ warning: jest.fn(), success: jest.fn(), error: jest.fn() }),
}));
jest.mock('@/components/molecules/text-editor', () => ({
  TextEditor: () => <div data-testid="mock-text-editor" />,
}));
jest.mock('@/components/molecules/picture', () => ({
  Picture: () => <div data-testid="mock-picture" />,
}));
jest.mock('@/components/molecules/picture/Picture', () => ({
  Picture: () => <div data-testid="mock-picture" />,
}));
jest.mock('@/components/organisms/place/NaverMapScript', () => ({
  NaverMapScript: () => null,
}));
jest.mock('@/components/organisms/place/PlaceMap', () => ({
  PlaceMap: () => null,
}));
jest.mock('@/components/molecules/selector/Selector', () => ({
  Selector: () => <div data-testid="mock-selector" />,
}));

describe('Title/Subtitle hint reset prevention tests', () => {
  const mockUpdateBlock = jest.fn();
  const mockUpdateImage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const mockState = {
      block: [],
      images: [],
      updateBlock: mockUpdateBlock,
      updateImage: mockUpdateImage,
    };
    (useEditorStore as unknown as jest.Mock).mockImplementation(selector => {
      return typeof selector === 'function' ? selector(mockState) : mockState;
    });
  });

  describe('Gallery component', () => {
    it('플레이스홀더와 동일한 "GALLERY"를 입력해도 빈 문자열로 리셋되지 않고 updateBlock이 정상 호출된다', () => {
      const blockInfo: EditorBlock<'gallery'> = {
        id: 'gallery-1',
        type: 'wedding',
        component: 'gallery',
        props: {
          title: '갤러리',
          subTitle: 'GALLERY',
          images: [],
          template: 'galleryType1',
          ratio: '1:1',
          isPopupViewer: false,
          isSubTitle: true,
        },
      };

      render(<Gallery blockInfo={blockInfo} id="gallery-1" />);

      const subTitleInput = screen.getByPlaceholderText('GALLERY') as HTMLInputElement;

      // 힌트와 일치해도 value가 ''로 치환되지 않고 실제 prop 값('GALLERY')을 반영
      expect(subTitleInput.value).toBe('GALLERY');

      // 'GALLERYA' 입력 시
      fireEvent.change(subTitleInput, { target: { value: 'GALLERYA' } });
      expect(mockUpdateBlock).toHaveBeenCalledWith('gallery-1', {
        subTitle: 'GALLERYA',
      });

      // 빈 문자열 입력 시 강제로 'GALLERY'로 리셋되지 않고 '' 전달
      fireEvent.change(subTitleInput, { target: { value: '' } });
      expect(mockUpdateBlock).toHaveBeenCalledWith('gallery-1', {
        subTitle: '',
      });
    });

    it('제목에 힌트와 동일한 "갤러리"가 있어도 빈 문자열로 치환되지 않고 그대로 표시된다', () => {
      const blockInfo: EditorBlock<'gallery'> = {
        id: 'gallery-1',
        type: 'wedding',
        component: 'gallery',
        props: {
          title: '갤러리',
          subTitle: 'GALLERY',
          images: [],
          template: 'galleryType1',
          ratio: '1:1',
          isPopupViewer: false,
          isSubTitle: true,
        },
      };

      render(<Gallery blockInfo={blockInfo} id="gallery-1" />);

      const titleInput = screen.getByPlaceholderText('갤러리') as HTMLInputElement;
      expect(titleInput.value).toBe('갤러리');

      fireEvent.change(titleInput, { target: { value: '갤러리 1' } });
      expect(mockUpdateBlock).toHaveBeenCalledWith('gallery-1', {
        title: '갤러리 1',
      });
    });
  });

  describe('Account component', () => {
    it('계좌번호 컴포넌트에서 힌트 "ACCOUNT"와 "마음 보내실 곳" 입력 시 정상 처리된다', () => {
      const blockInfo: EditorBlock<'account'> = {
        id: 'account-1',
        type: 'wedding',
        component: 'account',
        props: {
          title: '마음 보내실 곳',
          checkedSubTitle: true,
          subTitle: 'ACCOUNT',
          messageJson: null,
          messageHtml: null,
          groupList: [{ name: '신랑측' }],
          accountList: [[]],
        },
      };

      render(<Account blockInfo={blockInfo} id="account-1" />);

      const titleInput = screen.getByPlaceholderText('마음 보내실 곳') as HTMLInputElement;
      const subTitleInput = screen.getByPlaceholderText('ACCOUNT') as HTMLInputElement;

      expect(titleInput.value).toBe('마음 보내실 곳');
      expect(subTitleInput.value).toBe('ACCOUNT');

      fireEvent.change(subTitleInput, { target: { value: 'ACCOUNT 1' } });
      expect(mockUpdateBlock).toHaveBeenCalledWith('account-1', {
        subTitle: 'ACCOUNT 1',
      });

      fireEvent.change(titleInput, { target: { value: '' } });
      expect(mockUpdateBlock).toHaveBeenCalledWith('account-1', {
        title: '',
      });
    });
  });

  describe('Place component', () => {
    it('장소 컴포넌트에서 힌트 "LOCATION" 및 기본 제목 입력 시 정상 처리된다', () => {
      const blockInfo: EditorBlock<'place'> = {
        id: 'place-1',
        type: 'wedding',
        component: 'place',
        props: {
          title: '예식 장소',
          checkedSubTitle: true,
          subTitle: 'LOCATION',
          placeName: '웨딩홀',
          placeDetail: '3층',
          placeAddress: '서울시',
          placeTel: '02-123-4567',
          mapLocked: false,
          hasTel: false,
        },
      };

      render(<Place blockInfo={blockInfo} id="place-1" />);

      const titleInput = screen.getByPlaceholderText('예식 장소') as HTMLInputElement;
      const subTitleInput = screen.getByPlaceholderText('LOCATION') as HTMLInputElement;

      expect(titleInput.value).toBe('예식 장소');
      expect(subTitleInput.value).toBe('LOCATION');

      fireEvent.change(subTitleInput, { target: { value: 'LOCATION 1' } });
      expect(mockUpdateBlock).toHaveBeenCalledWith('place-1', {
        subTitle: 'LOCATION 1',
      });
    });
  });

  describe('CoupleIntroduction component', () => {
    it('신랑・신부 소개 컴포넌트에서 제목과 영문제목이 힌트와 일치해도 유지된다', () => {
      const blockInfo: EditorBlock<'coupleIntroduction'> = {
        id: 'couple-1',
        type: 'wedding',
        component: 'coupleIntroduction',
        props: {
          groom: '',
          bride: '',
          groomImage: { id: 'g1', image: [] },
          brideImage: { id: 'b1', image: [] },
          title: '신랑・신부 소개',
          checkedSubTitle: true,
          subTitle: 'INTRODUCTION',
          messageJson: null,
          messageHtml: null,
          showContent: false,
          brideFirst: false,
          showProfileImage: true,
        },
      };

      render(<CoupleIntroduction blockInfo={blockInfo} id="couple-1" />);

      const titleInput = screen.getByPlaceholderText('신랑・신부 소개') as HTMLInputElement;
      const subTitleInput = screen.getByPlaceholderText('INTRODUCTION') as HTMLInputElement;

      expect(titleInput.value).toBe('신랑・신부 소개');
      expect(subTitleInput.value).toBe('INTRODUCTION');

      fireEvent.change(subTitleInput, { target: { value: 'INTRODUCTION 2' } });
      expect(mockUpdateBlock).toHaveBeenCalledWith('couple-1', {
        subTitle: 'INTRODUCTION 2',
      });
    });
  });

  describe('Greeting component', () => {
    it('인사말 컴포넌트에서 제목과 영문제목이 힌트와 일치해도 유지된다', () => {
      const blockInfo: EditorBlock<'greeting'> = {
        id: 'greeting-1',
        type: 'wedding',
        component: 'greeting',
        props: {
          title: '인사말',
          checkedSubTitle: true,
          subTitle: 'INVITATION',
          messageJson: null,
          messageHtml: null,
        },
      };

      render(<Greeting blockInfo={blockInfo} id="greeting-1" />);

      const titleInput = screen.getByPlaceholderText('인사말') as HTMLInputElement;
      const subTitleInput = screen.getByPlaceholderText('INVITATION') as HTMLInputElement;

      expect(titleInput.value).toBe('인사말');
      expect(subTitleInput.value).toBe('INVITATION');

      fireEvent.change(subTitleInput, { target: { value: 'INVITATION!' } });
      expect(mockUpdateBlock).toHaveBeenCalledWith('greeting-1', {
        subTitle: 'INVITATION!',
      });
    });
  });
});
