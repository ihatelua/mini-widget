// js/core/points.js
window.SortPoints = (() => {
  let container = null;
  let n = 0;

  let hintEl = null;

  // last markers (for cheap cleanup)
  let lastPivot = -1;
  let lastBoundL = -1;
  let lastBoundR = -1;
  let lastRangeClass = ''; // only one active range at a time

  function bind(c){
    container = c || null;
    n = container ? container.children.length : 0;
    if (!hintEl) hintEl = document.getElementById('pointHint');
  }

  function setText(text){
    if (!hintEl) hintEl = document.getElementById('pointHint');
    if (!hintEl) return;
    hintEl.textContent = text || '';
  }

  function children(){
    return container ? container.children : null;
  }

  function clearClassAll(className){
    const ch = children();
    if (!ch) return;
    for (let i = 0; i < ch.length; i++){
      ch[i].classList.remove(className);
    }
  }

  function setPivot(idx){
    const ch = children();
    if (!ch) return;

    if (lastPivot >= 0 && lastPivot < ch.length) ch[lastPivot].classList.remove('pivot');
    lastPivot = idx;

    if (idx >= 0 && idx < ch.length) ch[idx].classList.add('pivot');
  }

  function setBounds(i, j){
    const ch = children();
    if (!ch) return;

    if (lastBoundL >= 0 && lastBoundL < ch.length) ch[lastBoundL].classList.remove('boundary-l');
    if (lastBoundR >= 0 && lastBoundR < ch.length) ch[lastBoundR].classList.remove('boundary-r');

    lastBoundL = i;
    lastBoundR = j;

    if (i >= 0 && i < ch.length) ch[i].classList.add('boundary-l');
    if (j >= 0 && j < ch.length) ch[j].classList.add('boundary-r');
  }

  function setRange(className, lo, hi){
    const ch = children();
    if (!ch) return;

    // clear old range (only one active range class for simplicity)
    if (lastRangeClass && lastRangeClass !== className){
      clearClassAll(lastRangeClass);
    } else if (lastRangeClass === className){
      clearClassAll(className);
    }

    lastRangeClass = className;

    const L = Math.max(0, lo | 0);
    const H = Math.min(ch.length - 1, hi | 0);
    for (let i = L; i <= H; i++){
      ch[i].classList.add(className);
    }
  }

  function clearQuick(){
    setPivot(-1);
    setBounds(-1, -1);
    clearClassAll('range-partition');
    lastRangeClass = '';
  }

  function clearMerge(){
    clearClassAll('range-merge');
    lastRangeClass = '';
  }

  function heapBoundary(heapSize){
    const ch = children();
    if (!ch) return;

    const hs = Math.max(0, Math.min(ch.length, heapSize | 0));
    for (let i = 0; i < ch.length; i++){
      if (i < hs){
        ch[i].classList.add('heap-zone');
        ch[i].classList.remove('sorted-zone');
      } else {
        ch[i].classList.add('sorted-zone');
        ch[i].classList.remove('heap-zone');
      }
    }

    if (ch.length === 0) return;
    const leftEnd = hs - 1;
    const rightStart = hs;

    if (hs === 0) setText('정렬 완료');
    else if (hs === ch.length) setText(`힙 영역: 0~${ch.length - 1} / 정렬 완료: 없음`);
    else setText(`힙 영역: 0~${leftEnd} / 정렬 완료: ${rightStart}~${ch.length - 1}`);
  }

  function clearHeap(){
    clearClassAll('heap-zone');
    clearClassAll('sorted-zone');
  }

  function radixDigit(d, base){
    setText(`현재 자리수(digit): ${d + 1}번째 / 기수(base): ${base}`);
  }

  function bucketIndex(b, total){
    setText(`현재 버킷: ${b + 1} / ${total}`);
  }

  function countingValue(v){
    setText(`현재 값 카운트: ${v}`);
  }

  function clearAll(){
    setText('');
    if (!container) return;

    // quick
    if (lastPivot >= 0) setPivot(-1);
    if (lastBoundL >= 0 || lastBoundR >= 0) setBounds(-1, -1);

    clearClassAll('range-partition');
    clearClassAll('range-merge');
    clearHeap();

    lastRangeClass = '';
  }

  function clearQuickZones(){
    clearClassAll('q-left');
    clearClassAll('q-mid');
    clearClassAll('q-right');
  }

  function clearMergeSplit(){
    clearClassAll('range-merge-l');
    clearClassAll('range-merge-r');
    clearClassAll('merge-mid');
  }

  // 공개 API (알고리즘에서 호출)
  return {
    bind,
    clearAll,

    // Quick
    quick: {
        // lo..i-1: 왼쪽 확정, i..j: 탐색(스캔), j+1..hi: 오른쪽 미확정
        state({ pivot, lo, i, j, hi }) {
            setPivot(pivot);
            setBounds(i, j);

            clearQuickZones();

            const ch = children();
            if (!ch) return;

            const L = Math.max(0, lo|0);
            const H = Math.min(ch.length-1, hi|0);

            const i0 = Math.max(L, Math.min(H+1, i|0));
            const j0 = Math.max(L-1, Math.min(H, j|0));

            // q-left: L..i0-1
            for (let x = L; x <= i0 - 1; x++) ch[x].classList.add('q-left');
            // q-mid: i0..j0
            for (let x = i0; x <= j0; x++) ch[x].classList.add('q-mid');
            // q-right: j0+1..H
            for (let x = j0 + 1; x <= H; x++) ch[x].classList.add('q-right');

            setText(`피벗: ${pivot} / 파티션: ${L}~${H} / i=${i} j=${j}`);
        },
        clear() {
            setPivot(-1);
            setBounds(-1, -1);
            clearQuickZones();
        }
    },

    // Merge/Tim
    merge: {
        split(lo, mid, hi) {
            clearMergeSplit();

            const ch = children();
            if (!ch) return;

            const L = Math.max(0, lo|0);
            const M = Math.max(L, Math.min(ch.length-1, mid|0));
            const H = Math.max(M, Math.min(ch.length-1, hi|0));

            for (let x = L; x <= M; x++) ch[x].classList.add('range-merge-l');
            for (let x = M + 1; x <= H; x++) ch[x].classList.add('range-merge-r');

            // mid 경계 강조
            if (M >= 0 && M < ch.length) ch[M].classList.add('merge-mid');

            setText(`병합: ${L}~${M} + ${M+1}~${H}`);
        },
        clear() {
            clearMergeSplit();
        }
    },

    // Heap
    heap: {
      boundary: heapBoundary,
      clear: clearHeap
    },

    // Counting/Radix/Bucket
    radixDigit,
    bucketIndex,
    countingValue,

    radix: {
        range(lo, hi){
            clearClassAll('range-radix');
            const ch = children();
            if (!ch) return;

            const L = Math.max(0, lo|0);
            const H = Math.min(ch.length-1, hi|0);
            for (let i = L; i <= H; i++) ch[i].classList.add('range-radix');
        },
        clear(){
            clearClassAll('range-radix');
        }
    },

    text: setText
  };
})();
