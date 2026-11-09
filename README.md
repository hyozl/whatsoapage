# 오아라이브 서비스 소개 페이지 리뉴얼 (whatsoa)

오아라이브(https://oalive.kr/whatsoa) **서비스 소개 페이지**를 새 디자인으로 다시 만드는 저장소예요.

## 소개

- **목적**: 관객과 아티스트에게 오아라이브 서비스를 한 페이지에서 소개하고, 관람·등록으로 이어지게 해요.
- **사용자**: 공연을 보러 오는 관객, 작품을 올리려는 아티스트
- **상태**: 디자인 완료 → 퍼블리싱(정적 HTML) 1차
- **디자인 방향**: 밝은 보라(#9450E7), 캐릭터 없이 깔끔하게, "화면/영상 플레이어" 모티브를 절제해서 사용, 영문은 Ordinary Artist 서체

## 시작하기

빌드 도구 없이 바로 열 수 있는 정적 페이지예요.

```bash
git clone https://github.com/hyozl/whatsoapage.git
cd whatsoapage/src
python3 -m http.server 8000   # 브라우저에서 http://localhost:8000
```

## 폴더 구조

```
.
├── docs/                       # 기획안(PDF)
├── src/
│   ├── index.html              # 서비스 소개 페이지 (섹션 01~11)
│   ├── css/style.css           # 스타일 (데스크톱 + 모바일 ≤767px)
│   ├── js/main.js              # 스텝 플레이어, 가격 슬라이더, 펼침 목록, FAQ 탭
│   └── assets/
│       ├── fonts/              # Ordinary Artist(영문), 아이콘 폰트
│       ├── logo/               # 오아라이브 로고, A.N.D 어워드
│       └── img/                # 화면 캡처 (아래 "넣어야 할 이미지" 참고)
└── README.md
```

## 페이지 구성

| # | 섹션 | 내용 |
|---|---|---|
| 01 | 히어로 | NOW PLAYING · 무대가 내 화면으로 찾아와요 · 관객/아티스트 버튼 · 숫자 |
| 02 | HOW TO WATCH | 3단계 스텝 플레이어 (2.5초마다 화면 전환) |
| 03 | PAY AS YOU LIKE | 내돈내보 · 가격 슬라이더(예시) · FREE/PAY/WOW |
| 04 | CURATED BY OA | 오뗌 극장 화면 + 재생목록 |
| 05 | 행동 유도 띠 | 엔딩 카드 (관객 / 아티스트) |
| 06 | ORDINARY ARTIST | 벤토 타일 (LIVE/VOD · MY PRICE · TICKET+WOW) |
| 07 | FEATURES | 트랙리스트형 펼침 목록 |
| 08 | SUPPORT | YOU / OALIVE 역할 나누기 |
| 09 | 6 WEEKS TO OPEN | 세로 타임라인 |
| 10 | FAQ | 관객/아티스트 탭 + 펼침 목록 |
| 11 | 엔딩 | 다음 무대는 당신의 화면에서 |

## 넣어야 할 이미지 (`src/assets/img/`)

Figma `자료 · 캡처` 페이지의 캡처를 PNG로 내보내 아래 이름으로 넣어 주세요. 없으면 어두운 빈 화면으로 보여요.

| 파일 | Figma 레이어 |
|---|---|
| `watch-pc.png` / `watch-mobile.png` | 관람하기 화면 (PC 1440×900 / 모바일 375×812) |
| `detail-pc.png` / `detail-mobile.png` | 작품 상세 화면 |
| `oatheme-pc.png` / `oatheme-mobile.png` | 오뗌 극장 화면 |

## 확인이 필요한 내용 (TODO)

- 히어로 숫자(등록 작품·참여 아티스트·누적 관람) — 지금은 `000`
- 히어로 공연 영상(15초 루프), 오뗌 극장 테마명·작품 수
- FAQ 답변 — 첫 질문 외에는 "고객센터에서 확인" 문구로 대체
- 07 FEATURES 설명 중 4개는 초안 (실제 기능과 맞는지 확인)
- 링크 주소(고객센터, 아티스트센터, 등록 문의, SNS) — 지금은 임시로 oalive.kr

## 관련 링크

- 기획 문서: `docs/오아라이브_서비스소개_리뉴얼_기획안.pdf`
- 디자인: Figma `서비스 소개` 페이지 (Desktop 1920 / Mobile 375)
- 현재 페이지: https://oalive.kr/whatsoa
