# Mini Widget

순수 HTML/CSS/Vanilla JS로 만든 미니 위젯 모음 프로젝트입니다.

## 구성

- `dday/`: 디데이 계산 위젯
- `lagyStr/`: 문자열 무작위 생성기
- `sorting/`: 정렬 애니메이션 시각화
- `index.html`: 3개 위젯을 소개하는 메인 인덱스 페이지

## 메인 인덱스 페이지 특징

- 2025 스타일의 미니멀 랜딩 UI
- `Three.js` 기반 배경 3D 오브젝트/파티클
- `GSAP` 기반 진입 애니메이션
- 라이트/다크 테마 전환 버튼
- 테마 상태 `localStorage` 저장
- 정적 페이지 환경에 맞춘 CDN 기반 구성 (빌드 도구/Node 불필요)

## 실행 방법

아래 중 아무 방식으로 실행할 수 있습니다.

1. `index.html`을 브라우저에서 직접 열기
2. 정적 서버로 실행하기 (권장)
   - 예: VS Code Live Server

## 폴더 구조

```text
mini-widget/
├─ index.html
├─ README.md
├─ favicon/
├─ dday/
├─ lagyStr/
└─ sorting/
```

## 비고

- 메인 페이지는 외부 CDN에서 `three.js`와 `gsap`을 로드합니다.
- 네트워크가 차단된 환경에서는 해당 라이브러리 로딩이 실패할 수 있습니다.
