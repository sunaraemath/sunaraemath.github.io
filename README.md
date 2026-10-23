# 수나래 수학학원 홈페이지

GitHub Pages로 올리는 정적 홈페이지입니다. 빌드 과정 없이 파일을 올리면 바로 보입니다.
주소: https://sunaraemath.github.io

## 파일 구성

| 파일 | 하는 일 |
|---|---|
| `content/site.yml` | **홈페이지 글과 링크 전부.** 내용은 이 파일만 고치면 됩니다 |
| `images/` | 마크(`mark.png`), 첫 화면 사진, 약도, 원장 사진 |
| `index.html` | 화면 틀 |
| `style.css` | 디자인 |
| `site.js` | 화면 전환, 메뉴, 상담 신청 창 |

## 화면 구성

- **PC**: 첫 화면은 위쪽에 대각선 사진, 아래 왼쪽에 마크와 학원 이름, 오른쪽에 소개 문구. 위 메뉴를 누르면 해당 페이지만 보입니다.
- **모바일** (화면 폭 900px 이하): 첫 화면에 소개와 오시는 길이 나오고, 오른쪽 아래에 상담 신청 버튼이 떠 있습니다. 원장 소개와 수업 안내는 오른쪽 위 메뉴에서 엽니다.
- **상담 신청**: 버튼을 누르면 안내 문구와 네이버 폼 버튼이 있는 창이 뜹니다. 버튼을 누르면 네이버 폼이 새 창으로 열립니다.
- 페이지 주소: `#director`(원장 소개), `#classes`(수업 안내), `#location`(오시는 길), `#apply`(상담 신청 창). 예: `https://sunaraemath.github.io/#apply`를 보내면 상담 신청 창이 바로 열립니다.

## 내용 고치기

`content/site.yml` 하나에 소개 문구, 원장 소개, 수업 안내, 주소·위치·운영 시간, 상담 신청 창 문구와 네이버 폼 링크가 모두 들어 있습니다.

1. GitHub에서 `content/site.yml`을 열고 연필 아이콘(Edit)을 누릅니다.
2. `항목 이름:` 뒤의 글만 바꿉니다. 줄 앞 띄어쓰기는 그대로 둡니다.
3. `[대괄호]`로 시작하거나 `:` `#`가 들어간 글은 `"큰따옴표"` 안에 씁니다.
4. "Commit changes"를 누르면 1~2분 뒤 홈페이지에 반영됩니다.
5. 사진은 `images/` 폴더에 올리고(Add file → Upload files) 경로를 적습니다. 예: `main_photo: images/main.jpg`

고친 뒤 홈페이지에 "site.yml 파일을 읽지 못했어요"가 보이면 방금 고친 줄의 따옴표나 띄어쓰기를 확인하세요.

## GitHub Pages 설정

저장소 `sunaraemath/sunaraemath.github.io`의 **Settings → Pages** 에서 Source는 **Deploy from a branch**, Branch는 **main / (root)** 입니다.
