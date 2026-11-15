# 초대장을 받아 펼쳐 보는 화면

기존 23종의 카드 표지와 게스트 블록을 유지하면서, 초대장의 도착부터 읽고 접어 두는 흐름까지 구성했습니다.

- 편지, 에디토리얼, 가든, 스카이, 파티, 컨퍼런스, 스크랩북의 7개 편집 구성을 카드별로 적용합니다.
- 봉투 열기는 키보드로 사용할 수 있으며, 모션 감소 설정에서는 즉시 본문을 표시합니다.
- 본문은 실제 인사말·소개·사진·갤러리·인터뷰·달력·일정·장소·교통·복장·맺음말 블록을 조합합니다. 이 장식은 쇼케이스 페이지에서만 적용됩니다.

## 생성한 이미지

내장 `image_gen` 도구로 생성했습니다. 원본은 보존하며, 아래 WebP 파일을 서비스에 사용합니다.

### 흑백 서약 사진

- 파일: `public/images/showcase/vow-rings.webp`
- 최종 프롬프트:

> Use case: photorealistic-natural. Asset type: supporting wedding invitation photo for monochrome and editorial invitations. Primary request: a quiet black-and-white fine-art photograph of two simple wedding bands resting beside a loosely tied silk ribbon and a single white calla lily on textured cotton rag paper. A blank open vow booklet at one edge, no printed text. Close-up editorial still life, diagonal afternoon window shadows, tactile paper fibers, subtle analog grain, elegant restrained luxury, real imperfect natural materials. Portrait 4:5 composition, rings near lower third and generous light breathing space. No people, no faces, no letters, no numbers, no logos, no watermark, no UI mockup.

### 편지와 종이 사진

- 파일: `public/images/showcase/love-letter.webp`
- 최종 프롬프트:

> Use case: photorealistic-natural. Asset type: photograph for a carefully crafted Korean wedding invitation story section. Primary request: overhead editorial photograph of a handwritten-letter setting, three blank ivory deckle-edge cotton paper sheets slightly overlapping on warm linen, one olive branch, a small blush garden rose and two closed antique brass scissors with a loose pale blush silk ribbon. Objects appear thoughtfully arranged with subtle natural asymmetry. Warm morning sunlight and delicate soft shadows, rich visible paper fibers and real linen, quiet romantic tactile fine-art wedding stationery photography. Landscape 3:2 composition. All paper is completely blank: no words, no letters, no numbers, no typography, no logos, no people, no watermark, no UI. Include only these stationery and botanical materials.

### 저녁 생일 파티 사진

- 파일: `public/images/showcase/birthday-evening.webp`
- 최종 프롬프트:

> Use case: photorealistic-natural. Asset type: supporting photograph for a stylish twenty-seventh birthday dinner invitation, real asset not a mockup. Primary request: intimate celebratory still life on a blush linen tablecloth with two vintage coupe glasses filled with pale pink sparkling drinks, a small bowl of dark red cherries, a tiny silver disco ball, a lit ivory taper candle in a simple silver holder, and a loosely curled red satin ribbon. No cake. Warm evening direct flash mixed with candlelight, tasteful analog film photography, visible grain, imperfect tactile textiles and real reflections. Nostalgic yet contemporary party mood, terracotta, cream and cherry-red accents. Landscape 3:2 composition. No people, no hands, no faces, no text, no numbers, no typography, no logos, no watermark.

## 재사용한 프로젝트 에셋

- `paper-grain.webp`, `party-bunting.webp`, `first-cake.webp`: `public/templates/json/firstBirthday_01.v1.json`에 포함된 기존 이미지에서 추출했습니다.
- `conference-speaker.webp`, `conference-hall.webp`: `public/samples/seminar_01/images/`의 기존 연사 사진과 행사장 사진을 WebP로 최적화했습니다.
- 이 에셋들의 서비스 경로는 모두 `public/images/showcase/`입니다.
