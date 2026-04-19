import Link from 'next/link';
import React from 'react';

import Arrow from '@/shared/assets/icons/arrow.svg';

function Policy() {
  return (
    <div className="w-full flex-center flex-col gap-10">
      <div className="flex-center flex-col gap-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 relative overflow-hidden mt-12 cursor-pointer border border-black/30 rounded-md px-4 py-2"
        >
          <Arrow className="w-2 h-[10px] text-black rotate-90 font-light" />
          <span>메인으로 돌아가기</span>
        </Link>
        <div className="flex-center flex-col gap-2">
          <p className="text-2xl tracking-wider">Invia</p>
          <h1 className="font-semibold text-4xl tracking-widest">
            개인정보처리방침
          </h1>
          <p>
            본 서비스(이하 “Invia”)는 이용자의 개인정보를 중요하게 생각하며 관련
            법령을 준수합니다.
          </p>
          <p>
            본 방침은 서비스가 이용자의 개인정보를 어떻게 처리하는지 설명합니다.
          </p>
        </div>
        <div className="flex items-center gap-4 my-7 anim-fade-5">
          <div
            className="h-px w-[60px]"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(0,0,0,0.5), transparent)',
            }}
          />
          <div className="w-1.5 h-1.5 rotate-45 bg-black" />
          <div
            className="h-px w-[60px]"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(0,0,0,0.5), transparent)',
            }}
          />
        </div>
        <div>
          <p className="text-xl">
            시행일 : 2026년 4월 17일 &nbsp;|&nbsp; 최종 수정: 2026년 4월 17일
          </p>
        </div>
      </div>
      <div className="flex-center flex-col w-[80%] gap-6 mb-20">
        <div
          className="
          flex w-full flex-col gap-6 rounded-4xl p-8
          bg-white/6 backdrop-blur-xs
          border-x border-white/30
          shadow-2xl
          supports-backdrop-filter:bg-white/6
        "
          style={{
            boxShadow: 'inset 8px 8px 16px 5px rgba(0, 0, 0, 0.06)',
          }}
        >
          <h2 className="text-xl font-semibold">1. 개인정보 처리 방식</h2>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">
              서비스는 별도의 데이터베이스를 운영하지 않으며, 이용자의
              개인정보를 자체 서버에 저장하지 않습니다.
            </h3>

            <h3 className="text-lg font-medium">
              서비스는 Google 계정을 통한 인증 및 Google Drive 연동 기능을
              제공하며, 모든 사용자 데이터는{' '}
              <span className="font-semibold underline">
                이용자의 Google Drive 계정
              </span>
              에 저장됩니다.
            </h3>
          </div>
        </div>
        <div
          className="
          flex w-full flex-col gap-6 rounded-4xl p-8
          bg-white/6 backdrop-blur-xs
          border-x border-white/30
          shadow-2xl
          supports-backdrop-filter:bg-white/6
        "
          style={{
            boxShadow: 'inset 8px 8px 16px 5px rgba(0, 0, 0, 0.06)',
          }}
        >
          <h2 className="text-xl font-semibold">
            2. 개인정보의 수집 및 이용 목적
          </h2>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">
              서비스는 다음과 같은 정보를 처리할 수 있습니다.
            </h3>
            <h3 className="text-lg font-medium">Google 로그인 시</h3>
            <ul className="list-disc ml-4">
              <li className="text-base deco">이메일 주소</li>
              <li className="text-base">
                기본 프로필 정보 (이름, 프로필 이미지)
              </li>
            </ul>
            <h3 className="text-lg font-medium">
              서비스 이용 과정에서 생성되는 정보
            </h3>
            <ul className="list-disc ml-4">
              <li className="text-base">
                Google Drive 내 파일 생성 및 수정 정보
              </li>
              <li className="text-base">접속 로그, 쿠키 정보</li>
            </ul>
          </div>
        </div>
        <div
          className="
          flex w-full flex-col gap-6 rounded-4xl p-8
          bg-white/6 backdrop-blur-xs
          border-x border-white/30
          shadow-2xl
          supports-backdrop-filter:bg-white/6
        "
          style={{
            boxShadow: 'inset 8px 8px 16px 5px rgba(0, 0, 0, 0.06)',
          }}
        >
          <h2 className="text-xl font-semibold">3. 개인정보의 이용 목적</h2>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">
              서비스는 다음의 목적을 위해 개인정보를 처리합니다.
            </h3>
            <ul className="list-disc ml-4">
              <li className="text-base">Google 계정을 통한 사용자 인증</li>
              <li className="text-base">
                이용자의 Google Drive 파일 생성, 조회, 수정, 삭제 기능 제공
              </li>
              <li className="text-base">서비스 기능 제공 및 유지</li>
            </ul>
          </div>
        </div>
        <div
          className="
          flex w-full flex-col gap-6 rounded-4xl p-8
          bg-white/6 backdrop-blur-xs
          border-x border-white/30
          shadow-2xl
          supports-backdrop-filter:bg-white/6
        "
          style={{
            boxShadow: 'inset 8px 8px 16px 5px rgba(0, 0, 0, 0.06)',
          }}
        >
          <h2 className="text-xl font-semibold">4. 데이터 저장 위치 및 방식</h2>
          <div className="flex flex-col gap-2">
            <ul className="list-disc ml-4">
              <li className="text-base">
                서비스는 이용자의 개인정보를 별도로 저장하지 않습니다.
              </li>
              <li className="text-base">
                모든 콘텐츠(예: 초대장 데이터)는 이용자의 Google Drive에
                저장되며, 서비스는 해당 데이터에 대해 저장 권한을 가지지
                않습니다.
              </li>
            </ul>
          </div>
        </div>
        <div
          className="
          flex w-full flex-col gap-6 rounded-4xl p-8
          bg-white/6 backdrop-blur-xs
          border-x border-white/30
          shadow-2xl
          supports-backdrop-filter:bg-white/6
        "
          style={{
            boxShadow: 'inset 8px 8px 16px 5px rgba(0, 0, 0, 0.06)',
          }}
        >
          <h2 className="text-xl font-semibold">
            5. Google 사용자 데이터 처리
          </h2>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">
              서비스는 Google OAuth를 통해 이용자의 동의를 받아 Google 계정에
              접근합니다.
            </h3>
            <ul className="list-disc ml-4">
              <li className="text-base">
                Google Drive 파일 생성, 조회, 수정, 삭제 기능 수행
              </li>
              <li className="text-base">
                사용자 요청에 의한 범위 내에서만 데이터 접근
              </li>
            </ul>
            <h3 className="text-lg font-medium">
              또한 서비스는 다음을 보장합니다.
            </h3>
            <ul className="list-disc ml-4">
              <li className="text-base">
                사용자 데이터를 제3자에게 판매하거나 공유하지 않습니다.
              </li>
              <li className="text-base">
                사용자 데이터를 광고 목적으로 사용하지 않습니다.
              </li>
              <li className="text-base">
                사용자 데이터는 서비스 기능 제공 외의 목적으로 사용되지
                않습니다.
              </li>
            </ul>
          </div>
        </div>
        <div
          className="
          flex w-full flex-col gap-6 rounded-4xl p-8
          bg-white/6 backdrop-blur-xs
          border-x border-white/30
          shadow-2xl
          supports-backdrop-filter:bg-white/6
        "
          style={{
            boxShadow: 'inset 8px 8px 16px 5px rgba(0, 0, 0, 0.06)',
          }}
        >
          <h2 className="text-xl font-semibold">6. 개인정보의 제3자 제공</h2>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">
              서비스는 이용자의 개인정보를 외부에 제공하지 않습니다. 단, 법령에
              의거한 경우에 한해 제공될 수 있습니다.
            </h3>
          </div>
        </div>
        <div
          className="
          flex w-full flex-col gap-6 rounded-4xl p-8
          bg-white/6 backdrop-blur-xs
          border-x border-white/30
          shadow-2xl
          supports-backdrop-filter:bg-white/6
        "
          style={{
            boxShadow: 'inset 8px 8px 16px 5px rgba(0, 0, 0, 0.06)',
          }}
        >
          <h2 className="text-xl font-semibold">7. 쿠키 및 인증 정보</h2>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">
              서비스는 로그인 상태 유지를 위해 쿠키를 사용할 수 있습니다.
            </h3>
            <ul className="list-disc ml-4">
              <li className="text-base">
                인증 토큰은 쿠키를 통해 관리되며, 서버에 별도로 저장되지
                않습니다.
              </li>
              <li className="text-base">
                이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.
              </li>
            </ul>
          </div>
        </div>
        <div
          className="
          flex w-full flex-col gap-6 rounded-4xl p-8
          bg-white/6 backdrop-blur-xs
          border-x border-white/30
          shadow-2xl
          supports-backdrop-filter:bg-white/6
        "
          style={{
            boxShadow: 'inset 8px 8px 16px 5px rgba(0, 0, 0, 0.06)',
          }}
        >
          <h2 className="text-xl font-semibold">8. 이용자의 권리</h2>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">
              이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다.
            </h3>
            <ul className="list-disc ml-4">
              <li className="text-base">Google 계정 연동 해제</li>
              <li className="text-base">서비스 이용 중단</li>
              <li className="text-base">Google 계정 권한 철회</li>
            </ul>
          </div>
        </div>
        <div
          className="
          flex w-full flex-col gap-6 rounded-4xl p-8
          bg-white/6 backdrop-blur-xs
          border-x border-white/30
          shadow-2xl
          supports-backdrop-filter:bg-white/6
        "
          style={{
            boxShadow: 'inset 8px 8px 16px 5px rgba(0, 0, 0, 0.06)',
          }}
        >
          <h2 className="text-xl font-semibold">
            9. 개인정보 보호를 위한 조치
          </h2>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">
              서비스는 개인정보 보호를 위해 다음과 같은 조치를 취합니다.
            </h3>
            <ul className="list-disc ml-4">
              <li className="text-base">OAuth 기반 인증 사용</li>
              <li className="text-base">최소 권한 범위 내에서 데이터 접근</li>
              <li className="text-base">보안 통신(HTTPS) 적용</li>
            </ul>
          </div>
        </div>
        <div
          className="
          flex w-full flex-col gap-6 rounded-4xl p-8
          bg-white/6 backdrop-blur-xs
          border-x border-white/30
          shadow-2xl
          supports-backdrop-filter:bg-white/6
        "
          style={{
            boxShadow: 'inset 8px 8px 16px 5px rgba(0, 0, 0, 0.06)',
          }}
        >
          <h2 className="text-xl font-semibold">10. 개인정보 보호책임자</h2>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">
              서비스는 개인정보 보호 관련 문의를 위해 아래 연락처를 제공합니다.
            </h3>
            <ul className="list-disc ml-4">
              <li className="text-base">
                이메일:{' '}
                <a href="mailto:teambread.official@gmail.com">
                  teambread.official@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div
          className="
          flex w-full flex-col gap-6 rounded-4xl p-8
          bg-white/6 backdrop-blur-xs
          border-x border-white/30
          shadow-2xl
          supports-backdrop-filter:bg-white/6
        "
          style={{
            boxShadow: 'inset 8px 8px 16px 5px rgba(0, 0, 0, 0.06)',
          }}
        >
          <h2 className="text-xl font-semibold">11. 개인정보 처리방침 변경</h2>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">
              본 개인정보처리방침은 변경될 수 있으며, 변경 시 서비스 내 공지를
              통해 안내됩니다.
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Policy;
