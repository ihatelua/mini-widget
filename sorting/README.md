# Sorting Visualizer
정렬 알고리즘을 **막대(bar) 애니메이션**으로 시각화해 학습·시연·테스트에 활용할 수 있는 웹 기반 정렬 시각화 도구입니다.  

## 개요
- 다양한 정렬 알고리즘을 동일한 데이터에 대해 실행하며 동작 과정을 시각적으로 확인할 수 있습니다.
- 실행 중 **일시정지/재개/정지**, 속도 조절, 오름/내림차순 전환을 지원합니다.
- 비교/스왑/쓰기(write) 등 핵심 동작을 하이라이트로 표시해 흐름을 이해하기 쉽습니다.

## 구현된 정렬 종류
- Bubble Sort
- Selection Sort
- Insertion Sort
- Quick Sort
- Shell Sort
- Cocktail Sort
- Comb Sort
- Gnome Sort
- Heap Sort
- Merge Sort
- Counting Sort
- Radix Sort (LSD)
- Bucket Sort
- Intro Sort
- TimSort (educational)

## 주요 기능
- **정렬 애니메이션**
  - 비교(Compare), 스왑(Swap), 쓰기(Write) 상태를 시각적으로 강조
  - 정렬 완료 영역 표시
- **실시간 통계 패널**
  - 비교 횟수, 스왑 횟수, write 횟수, 패스 수, 경과 시간, 진행률(%) 표시
- **알고리즘 포인트 하이라이트**
  - Quick: pivot/partition 및 경계 표시
  - Merge/Tim: merge 구간(lo~hi) 표시
  - Heap: heap 영역(미정렬) vs 정렬 완료 영역 구분
  - Counting/Radix/Bucket: digit/버킷 인덱스 정보 표시
- **실행 제어**
  - GO(실행), PAUSE/RESUME(일시정지/재개), STOP(정지)
  - 오름/내림차순 전환
- **속도 세밀 조절 + 최고속(0ms)**
  - 0ms에서는 애니메이션 비용을 최소화해 빠르게 결과 확인 가능
- **마우스 오버 툴팁**
  - 막대에 마우스를 올리면 index/value 및 상태 태그(정렬됨/포인트/비교 등)를 표시
- **미니 HUD**
  - 현재 상태(IDLE/RUNNING/PAUSED/STOPPED/DONE), 선택 알고리즘, 속도(ms)를 간단 배지로 표시
- **마이크로 인터랙션**
  - 버튼/카드에 hover/active 트랜지션을 적용해 화면 반응성을 강화
- **실행 상태 인디케이터**
  - RUNNING 시 로딩(회전) 느낌, PAUSED/STOPPED/DONE 상태를 점/색으로 직관 표시
- **Empty State 안내 카드**
  - 알고리즘 미선택 상태에서 안내 문구/일러스트(막대)로 시작 흐름을 자연스럽게 유도
- **도움말(팝오버)**
  - `?` 버튼으로 조작법/용어/단축키 안내
  - 기본 단축키: `R`(랜덤), `G/Enter`(시작), `Space`(일시정지/재개), `S`(정지), `D`(DESC), `?`(도움말)