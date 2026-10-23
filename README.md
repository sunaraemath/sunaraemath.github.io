# 수나래 수학학원 홈페이지

GitHub Pages로 올리는 정적 홈페이지입니다. 빌드 과정 없이 파일을 올리면 바로 보입니다.
주소: https://sunaraemath.github.io

## 파일 구성

| 파일 | 하는 일 |
|---|---|
| `content.js` | **홈페이지 글과 링크 전부.** 내용은 이 파일만 고치면 됩니다 |
| `images/` | 마크(`mark.png`), 첫 화면 사진, 약도, 원장 사진 |
| `index.html` | 화면 틀 |
| `style.css` | 디자인 |
| `site.js` | 화면 전환, 메뉴, 상담 신청 창 |

## 화면 구성

- **PC**: 첫 화면은 위쪽에 대각선 사진, 아래 왼쪽에 마크와 학원 이름, 오른쪽에 소개 문구. 위 메뉴를 누르면 해당 페이지만 보입니다.
- **모바일** (화면 폭 900px 이하): 첫 화면에 소개와 오시는 길이 나오고, 오른쪽 아래에 상담 신청 버튼이 떠 있습니다. 원장 소개와 수업 안내는 오른쪽 위 메뉴에서 엽니다.
- **상담 신청**: 버튼을 누르면 중등부/고등부를 고르는 창이 뜨고, 고른 반의 네이버 폼이 새 창으로 열립니다.
- 페이지 주소: `#director`(원장 소개), `#classes`(수업 안내), `#location`(오시는 길), `#apply`(상담 신청 창). 예: `https://sunaraemath.github.io/#apply`를 보내면 상담 신청 창이 바로 열립니다.

## 내용 고치기

1. `content.js`를 엽니다.
2. `[대괄호]` 문구를 실제 내용으로 바꿉니다. 따옴표 안의 글만 바꾸고 쉼표·괄호는 그대로 둡니다.
3. 사진을 넣을 때는 `images/` 폴더에 파일을 올리고 경로를 적습니다. 예: `heroPhoto: "images/main.jpg"`, `map: "images/map.png"`
4. 네이버 폼 주소는 `apply` → `forms`의 각 `url`에 붙여넣습니다. 반을 추가하려면 `{ label: "초등부", url: "..." }` 줄을 하나 더 씁니다.

GitHub 웹사이트에서 파일을 열고 연필 아이콘(Edit)으로 고친 뒤 "Commit changes"를 누르면 1~2분 뒤 홈페이지에 반영됩니다.

## GitHub Pages 설정

저장소 `sunaraemath/sunaraemath.github.io`의 **Settings → Pages** 에서 Source는 **Deploy from a branch**, Branch는 **main / (root)** 입니다.
