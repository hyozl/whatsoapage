# 수정 가이드 (누구나 고칠 수 있게)

이 페이지는 **HTML·CSS·JS 파일 3개**로 만든 정적 사이트예요. 빌드 도구나 설치 없이, 파일을 고치고 저장(커밋)하면 1~2분 뒤 사이트에 자동으로 반영돼요.

- 사이트 주소: https://hyozl.github.io/whatsoapage/
- 디자인 원본(피그마): 저장소 관리자에게 링크를 요청하세요
- **피그마 먼저, 코드는 그다음**: 디자인이 바뀌는 수정이면 피그마를 먼저 고치고 코드를 맞춰요

---

## 1. 수정 권한 받기

| 방법 | 언제 | 어떻게 |
|---|---|---|
| 협업자로 초대받기 (추천) | 팀원 | 저장소 관리자가 **Settings → Collaborators → Add people** 로 GitHub 아이디를 초대 → 메일로 온 초대 수락 |
| 포크 후 PR 보내기 | 외부 사람 | 오른쪽 위 **Fork** → 내 저장소에서 수정 → **Pull request** 로 변경 요청 → 관리자가 확인 후 합치기 |

> 협업자는 `main`에 바로 저장하면 곧장 사이트에 올라가요. 큰 수정은 새 브랜치를 만들어 PR로 올리고, 다른 사람이 한 번 보고 합치는 걸 권해요.

---

## 2. 가장 쉬운 방법: GitHub 웹에서 바로 고치기 (설치 없음)

글자 하나, 링크 하나 바꾸는 정도라면 이 방법이 제일 빨라요.

1. 저장소에서 고칠 파일을 열어요 (예: `src/index.html`)
2. 오른쪽 위 **연필 아이콘(Edit this file)** 을 눌러요
3. `Ctrl+F`(맥은 `Cmd+F`)로 바꿀 문구를 찾아 고쳐요
4. 오른쪽 위 **Commit changes…** → 무엇을 바꿨는지 한 줄로 적고 → **Commit changes**
5. 1~2분 뒤 사이트에서 새로고침 (안 바뀌어 보이면 주소 뒤에 `?v=아무숫자` 를 붙여 열기)

**이미지·영상 바꾸기**도 웹에서 돼요: 해당 폴더(예: `src/assets/img`)로 가서 **Add file → Upload files** → 같은 파일 이름으로 올리면 덮어써져요.

**배포 확인**: 저장소 위쪽 **Actions** 탭에서 초록 체크(✓)면 반영 완료, 빨간 X면 실패예요. 실패하면 그 작업을 열어 **Re-run jobs** 를 눌러보고, 그래도 안 되면 관리자에게 알려주세요.

---

## 3. 내 컴퓨터에서 고치기 (여러 곳을 고칠 때)

```bash
git clone https://github.com/hyozl/whatsoapage.git
cd whatsoapage/src
python3 -m http.server 8000      # 맥·리눅스 기본 내장 / 윈도우는 python 설치 필요
# 브라우저에서 http://localhost:8000 열기
```

- 파일을 더블클릭해서(`file://`) 열면 오아라이브 작품 목록·테마를 못 불러오거나 영상이 막힐 수 있어요. **꼭 위처럼 로컬 서버로 열어서** 확인하세요
- VS Code를 쓴다면 확장 프로그램 **Live Server** 로 열어도 돼요
- 다 고쳤으면:

```bash
git add -A
git commit -m "무엇을 바꿨는지 한 줄"
git push
```

---

## 4. 파일 구조

```
src/
├─ index.html          ← 모든 글·링크·섹션 순서 (대부분 여기만 고치면 돼요)
├─ css/style.css       ← 모양(색·크기·간격·모션). 맨 아래에 추가한 규칙일수록 우선 적용돼요
├─ js/main.js          ← 움직임(탭 전환, STEP 자동 넘김, WoW 바, 카드 회전, 데이터 불러오기)
└─ assets/
   ├─ img/             ← 관람 단계 캡처, 아티스트 카드 이미지
   ├─ video/           ← 맨 위 영상 (hero-jangdo.mp4 + 포스터 jpg)
   ├─ illust/          ← 손그림 (물음표, WoW, 분석 보드 원본)
   ├─ fonts/           ← Ordinary Artist 글씨체, OA 아이콘 폰트
   ├─ ui/              ← 손그림 버튼 테두리 (btn-purple / btn-white / btn-gray)
   └─ logo/            ← 로고
.github/workflows/pages.yml  ← 자동 배포 설정 (건드리지 않아도 돼요)
```

---

## 5. 자주 하는 수정, 어디를 고치면 되나요?

| 바꾸고 싶은 것 | 파일 | 찾을 단어 / 방법 |
|---|---|---|
| 섹션 제목·설명 문구 | `index.html` | 바꿀 문구를 그대로 검색. 제목은 `class="sec-title"`, 설명은 `class="sec-desc"` |
| 모바일에서만 줄바꿈 | `index.html` | `<br class="mo" />` (PC에서만은 `<br class="pc" />`) |
| FAQ 질문·답변 | `index.html` | 관객은 `id="faq"`, 아티스트는 `id="faq-artist"`. 질문은 `<b>…</b>`, 답변은 `<div class="faq-a"><p>…</p>`, 굵게는 `<strong>…</strong>`, 줄바꿈은 `<br />` |
| FAQ "자세히 보기" 링크 | `index.html` | `class="faq-link"` 의 `href` |
| 아티스트 소개서 링크 | `index.html` | `data-deck` 이 붙은 링크 **2곳** 모두 |
| 등록 문의하기 (카카오톡) | `index.html` | `pf.kakao.com` |
| 맨 위 영상 | `assets/video/` | `hero-jangdo.mp4`(영상), `hero-jangdo.jpg`(첫 화면) 같은 이름으로 덮어쓰기. 다른 이름이면 `index.html`의 `class="stage-video"` 주소 수정. **소리 없는 mp4, 10~20초, 5MB 이하** 권장 |
| 영상 아래 제목 (연극 · 장도) | `index.html` | `class="stage-title"` |
| 영상 위 관객 채팅 | `index.html` | `O열 관객` 검색 |
| 관람 단계 캡처 | `assets/img/` | `watch-` `detail-` `play-` + `pc.jpg` / `mobile.jpg` 이름으로 덮어쓰기. PC는 가로:세로 약 1.74:1, 모바일은 폭 640px 정도 |
| 아티스트 카드 이미지 | `assets/img/` | `artist-live-top.png`, `artist-live.png`, `artist-oaplus.png`, `artist-wow-top.png`, `artist-wow.png` 로 올리면 자동 표시 |
| 분석 보드 글자 (연극/뮤지컬, 러닝타임, 조합, 해시태그) | `index.html` | `class="ai-t` 검색. `x`, `y` 숫자가 위치예요 |
| WoW 바 문구 (원하는만큼, 응원하기) | `index.html` | `data-price-tip`, `wow-max` |
| 색·글씨 크기·간격 | `css/style.css` | **맨 아래에 새 규칙을 추가**하는 방식이 안전해요 |

### 자동으로 바뀌는 곳 (직접 안 고쳐도 돼요)
- **오뗌극장 재생목록 4개**: `api.oalive.kr/oatheme`에서 열린 테마를 무작위로 불러와요
- **카테고리 카드 6개**(무료·뮤지컬·연극·무용·음악·인터뷰): 오아라이브 추천 작품 중 하나씩 무작위로 불러와요
- 둘 다 불러오기에 실패하면 `main.js` 안의 `SNAPSHOT`, `CAT_SNAPSHOT` 목록에서 골라요. 오래되면 이 목록만 새로 바꿔 주세요

---

## 6. 지켜주세요 (디자인 규칙)

- **문구 끝에 마침표를 찍지 않아요.** 단, FAQ 답변은 문장이라 마침표·느낌표를 써요
- **가운데 정렬**: 섹션 제목·설명·버튼은 PC·모바일 모두 가운데
- **모바일은 PC와 같은 내용**으로, 크기만 줄여요
- 글자 굵기는 **400(보통)·600(굵게)** 두 가지만 (오아라이브 디자인 가이드)
- 보라색은 `#9450E7` (CSS에서는 `var(--brand-color)`)
- 버튼은 손그림 버튼(`btn btn-white`, `btn btn-primary`)을 그대로 써요
- 개인정보가 보이는 캡처(이름, 프로필 사진, 결제 정보)는 **가리고** 올려요
- 이미지는 너무 크지 않게: 캡처 1장 300KB 이하, 영상 5MB 이하 권장

---

## 7. 문제가 생겼을 때

| 증상 | 해결 |
|---|---|
| 고쳤는데 사이트에 안 보여요 | 1~2분 기다린 뒤 새로고침, 또는 주소 뒤에 `?v=2` 붙이기. **Actions** 탭에서 초록 체크인지 확인 |
| 404 페이지가 떠요 | 주소 끝 `/whatsoapage/` 까지 있는지 확인. 방금 배포했다면 10분쯤 뒤 다시 |
| 화면이 깨졌어요 | 저장소 **Commits** 에서 직전 저장을 열고, 문제가 된 부분을 되돌려 다시 저장. 모르겠으면 관리자에게 커밋 링크와 함께 알려주세요 |
| 작품·테마가 안 바뀌어요 | 오아라이브 API 응답 문제일 수 있어요. 잠시 후 다시 보거나, 내장 목록(`SNAPSHOT`)이 대신 보이는 중이에요 |

문의: 저장소 관리자
