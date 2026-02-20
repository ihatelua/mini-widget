function sleep(ms){
  return new Promise(r => setTimeout(r, ms));
}

function getDelay(){
  const v = Number(document.getElementById('speed').value); // 0~100
  if (v <= 0) return 0;
  const t = v / 100;
  const min = 8, max = 420;
  return Math.round(min + (max - min) * Math.pow(t, 1.8));
}

function getSwapDuration(){
  const d = getDelay();
  if (d === 0) return 0;                 // 최고속
  return Math.max(120, Math.round(d * 2.2)); // flipSwap에서 쓰는 값과 "동일"하게
}

// 다른 파일(heap.js 등)에서도 쓰게 전역으로 노출(선택이지만 편함)
window.getSwapDuration = getSwapDuration;

/**
 * FLIP 스왑 (인접/비인접 모두 안전)
 */
function flipSwap(container, i, j){
  if (i === j) return;

  window.SortStats?.incSwap?.(1);

  // 최고속이면: 애니메이션 없이 즉시 교체
  if (getDelay() === 0) {
    const a = container.children[i];
    const b = container.children[j];
    const placeholder = document.createElement('div');
    container.insertBefore(placeholder, a);
    container.replaceChild(a, b);
    container.replaceChild(b, placeholder);
    return;
  }

  const dur = (typeof window.getSwapDuration === 'function')
    ? window.getSwapDuration()
    : Math.max(120, Math.round(getDelay() * 2.2));

  // ✅ swap의 영향 범위(사이에 끼어있는 애들도 이동하니까 구간만 FLIP)
  const L = Math.min(i, j);
  const H = Math.max(i, j);

  const items = [...container.children];

  // before rect (구간만)
  const before = new Map();
  for (let k = L; k <= H; k++){
    before.set(items[k], items[k].getBoundingClientRect());
  }

  // DOM swap
  const a = items[i];
  const b = items[j];
  const placeholder = document.createElement('div');
  placeholder.style.display = 'none';

  container.insertBefore(placeholder, a);
  container.replaceChild(a, b);
  container.replaceChild(b, placeholder);

  // after rect + invert (구간만)
  const afterItems = [...container.children];
  for (let k = L; k <= H; k++){
    const el = afterItems[k];
    const bRect = before.get(el);
    if (!bRect) continue;

    const aRect = el.getBoundingClientRect();
    const dx = bRect.left - aRect.left;
    const dy = bRect.top - aRect.top;

    el.style.transition = 'none';
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  // reflow
  container.getBoundingClientRect();

  requestAnimationFrame(() => {
    for (let k = L; k <= H; k++){
      const el = afterItems[k];
      el.style.transition = `transform ${dur}ms ease`;
      el.style.transform = '';
    }
  });
}




// js/core/animation.js

// ✅ 실행 제어기 (Pause/Stop)
window.SortController = (() => {
  let paused = false;
  let stopped = false;

  function pause(){ paused = true; }
  function resume(){ paused = false; }
  function stop(){ stopped = true; paused = false; }
  function reset(){ stopped = false; paused = false; }

  function isPaused(){ return paused; }
  function isStopped(){ return stopped; }

  return { pause, resume, stop, reset, isPaused, isStopped };
})();

function getDelay(){
  const v = Number(document.getElementById('speed').value); // 0~100

  // 0 => 0ms (최고속)
  if (v <= 0) return 0;

  // 1~100 => 8ms ~ 420ms (지수형 곡선: 낮은 값에서 더 세밀하게 조절됨)
  const t = v / 100;               // 0~1
  const min = 8;                   // 너무 작으면 눈에 안 보여서 8ms 정도
  const max = 420;

  const eased = Math.pow(t, 1.8);  // 곡선(원하면 1.5~2.2 조절)
  return Math.round(min + (max - min) * eased);
}


/**
 * ✅ Pause/Stop을 존중하는 sleep
 * - paused: 풀릴 때까지 대기
 * - stopped: 즉시 중단(throw)
 */
// 파일 상단(한 번만) 추가
let __sleepYieldCounter = 0;

async function sleep(ms){
  const tick = 25;

  // 1) STOP 체크
  if (SortController.isStopped()) {
    throw new Error("SORT_STOPPED");
  }

  // 2) PAUSE면 ms가 0이어도 여기서 멈춰야 함
  while (SortController.isPaused()) {
    if (SortController.isStopped()) {
      throw new Error("SORT_STOPPED");
    }
    await new Promise(r => setTimeout(r, tick));
  }

  // 3) ✅ 최고속(ms<=0): 시간 대기 없이 "가끔" 이벤트루프에 양보만
  if (!ms || ms <= 0) {
    __sleepYieldCounter++;

    // 너무 자주 양보하면 최고속이 느려지니, N번에 1번만 양보
    // (40은 적당한 값. 더 빠르게 하고 싶으면 80~120으로 올려도 됨)
    if (__sleepYieldCounter % 40 === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
    return;
  }

  // 4) ms>0: 기존 방식 유지
  let left = ms;
  while (left > 0) {
    if (SortController.isStopped()) {
      throw new Error("SORT_STOPPED");
    }

    while (SortController.isPaused()) {
      if (SortController.isStopped()) {
        throw new Error("SORT_STOPPED");
      }
      await new Promise(r => setTimeout(r, tick));
    }

    const step = Math.min(tick, left);
    await new Promise(r => setTimeout(r, step));
    left -= step;
  }
}


