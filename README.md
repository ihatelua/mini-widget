# Mini Widget

순수 HTML/CSS/Vanilla JS로 만든 업무형 미니 위젯 모음 프로젝트입니다.

## Widgets

- `dday/`: 디데이 계산 위젯
- `lagyStr/`: 랜덤 문자열 생성기
- `sorting/`: 정렬 알고리즘 시각화
- `markdown-preview/`: Markdown Previewer
- `json-formatter/`: JSON Formatter & Validator
- `password-strength/`: Password Strength Checker
- `index.html`: 전체 위젯 소개 메인 페이지

## 메인 인덱스 특징

- 2025 스타일 미니멀 랜딩 UI
- `Three.js` 배경 3D 오브젝트/파티클
- `GSAP` 진입 애니메이션
- 라이트/다크 테마 전환 + `localStorage` 저장
- 정적 페이지 환경(CDN) 기반, 빌드 도구/Node 불필요

## 신규 위젯 특징

### Markdown Previewer

- 실시간 렌더링
- 샘플 문서 로드
- Markdown 복사
- `marked + DOMPurify` 사용

### JSON Formatter & Validator

- JSON 포맷/압축
- 유효성 검사
- 에러 라인/컬럼 표시
- 결과 복사

### Password Strength Checker

- 강도 점수(0~100) 및 단계 표시
- 문자 조합 체크리스트
- 예상 조합 수/대입공격 시간 추정

## 실행 방법

1. `index.html`을 브라우저에서 직접 열기
2. 정적 서버 실행(권장)
   - 예: VS Code Live Server

## 폴더 구조

```text
mini-widget/
├─ index.html
├─ README.md
├─ favicon/
├─ dday/
├─ lagyStr/
├─ sorting/
├─ markdown-preview/
├─ json-formatter/
└─ password-strength/
```

## 참고

- 각 위젯은 모두 정적 HTML 기반입니다.
- 일부 위젯은 외부 CDN(예: `three.js`, `gsap`, `marked`, `dompurify`)을 사용합니다.
