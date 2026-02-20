// js/core/stats.js
window.SortStats = (() => {
  const el = {
    panel: null,
    compare: null,
    swap: null,
    write: null,
    pass: null,
    elapsed: null,
    progressText: null,
    progressBar: null,
  };

  let active = false;
  let paused = false;
  let finished = false;
  let stopped = false;

  let algoId = '';
  let n = 0;
  let targetUnits = 0;

  let compareCount = 0;
  let swapCount = 0;
  let writeCount = 0;

  let startTs = 0;
  let pauseAt = 0;
  let pauseTotal = 0;

  let rafId = 0;
  let tickId = 0;

  function bindDom() {
    el.panel = document.getElementById('stats');
    el.compare = document.getElementById('statCompare');
    el.swap = document.getElementById('statSwap');
    el.write = document.getElementById('statWrite');
    el.pass = document.getElementById('statPass');
    el.elapsed = document.getElementById('statElapsed');
    el.progressText = document.getElementById('statProgressText');
    el.progressBar = document.getElementById('statProgressBar');
  }

  function fmtNum(x) {
    return Number(x).toLocaleString();
  }

  function fmtElapsed(ms) {
    const s10 = Math.floor(ms / 100); // 0.1초 단위
    const s = Math.floor(s10 / 10);
    const d = s10 % 10;
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}.${d}`;
  }

  function nowMs() {
    const t = performance.now();
    const end = paused ? pauseAt : t;
    return Math.max(0, end - startTs - pauseTotal);
  }

  function estimateTarget({ id, n, min, max, digits, desc }) {
    const n2 = (n * (n - 1)) / 2;
    const nlog = Math.max(1, Math.round(n * Math.log2(Math.max(2, n))));
    switch (id) {
      case 'bubble':
      case 'selection':
      case 'insertion':
      case 'cocktail':
      case 'gnome':
        return Math.max(1, Math.round(n2));
      case 'shell':
      case 'comb':
        return Math.max(1, Math.round(n2 * 0.6));
      case 'quick':
      case 'intro':
      case 'heap':
        return Math.max(1, Math.round(nlog * 2));
      case 'merge':
        return Math.max(1, Math.round(nlog * 2));
      case 'tim':
        return Math.max(1, Math.round(nlog * 3)); // 교육용 구현이 write가 더 많음
      case 'counting':
        return Math.max(1, n); // 실제 애니메이션은 write n번이 핵심
      case 'bucket':
        return Math.max(1, n);
      case 'radix': {
        const base = n * Math.max(1, digits);
        return Math.max(1, base + (desc ? n : 0)); // DESC면 reverse 후 write 1회 추가
      }
      default:
        return Math.max(1, Math.round(n2));
    }
  }

  function scheduleRender() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      render();
    });
  }

  function derivedPass() {
    if (!n) return 0;
    // write 기반이면 "배열 한 바퀴 write"를 1패스로 보고,
    // swap 기반이면 "비교 n번"을 1패스로 보는 추정치
    if (writeCount > 0) return Math.floor(writeCount / n);
    return Math.floor(compareCount / n);
  }

  function doneUnits() {
    // 가벼운 공용 지표: 비교 + 스왑 + write
    return compareCount + swapCount + writeCount;
  }

  function progress01() {
    if (!targetUnits) return 0;
    if (finished && !stopped) return 1;
    return Math.min(1, doneUnits() / targetUnits);
  }

  function setState(state) {
    if (el.panel) el.panel.dataset.state = state;
  }

  function render() {
    if (!el.compare) bindDom();
    if (!el.compare) return;

    const pass = derivedPass();
    const elapsed = fmtElapsed(nowMs());
    const p = progress01();
    const pct = Math.round(p * 100);

    el.compare.textContent = fmtNum(compareCount);
    el.swap.textContent = fmtNum(swapCount);
    el.write.textContent = fmtNum(writeCount);
    el.pass.textContent = fmtNum(pass);
    el.elapsed.textContent = elapsed;

    el.progressText.textContent = `${pct}%`;
    if (el.progressBar) el.progressBar.style.width = `${pct}%`;
  }

  function resetCounters() {
    compareCount = 0;
    swapCount = 0;
    writeCount = 0;
    pauseTotal = 0;
    pauseAt = 0;
    startTs = performance.now();
    scheduleRender();
  }

  function start({ id, values, desc }) {
    if (!el.compare) bindDom();

    algoId = id || '';
    n = Array.isArray(values) ? values.length : 0;

    const min = n ? Math.min(...values) : 0;
    const max = n ? Math.max(...values) : 0;
    const digits = max > 0 ? (Math.floor(Math.log10(max)) + 1) : 1;

    targetUnits = estimateTarget({ id: algoId, n, min, max, digits, desc: !!desc });

    active = true;
    paused = false;
    finished = false;
    stopped = false;

    resetCounters();
    setState('running');

    clearInterval(tickId);
    tickId = setInterval(() => scheduleRender(), 100);
  }

  function idle(size) {
    if (!el.compare) bindDom();
    n = Number(size) || 0;
    targetUnits = 0;
    active = false;
    paused = false;
    finished = false;
    stopped = false;
    compareCount = 0;
    swapCount = 0;
    writeCount = 0;
    pauseTotal = 0;
    pauseAt = 0;
    startTs = performance.now();
    setState('idle');
    scheduleRender();
  }

  function stop({ isStopped = false, isFinished = false } = {}) {
    stopped = !!isStopped;
    finished = !!isFinished;

    active = false;
    paused = false;

    clearInterval(tickId);
    tickId = 0;

    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;

    setState(stopped ? 'stopped' : (finished ? 'done' : 'idle'));
    scheduleRender();
  }

  function pause() {
    if (!active || paused) return;
    paused = true;
    pauseAt = performance.now();
    setState('paused');
    scheduleRender();
  }

  function resume() {
    if (!paused) return;
    const t = performance.now();
    pauseTotal += (t - pauseAt);
    pauseAt = 0;
    paused = false;
    setState(active ? 'running' : 'idle');
    scheduleRender();
  }

  function incCompare(delta = 1) {
    compareCount += delta;
    scheduleRender();
  }

  function incSwap(delta = 1) {
    swapCount += delta;
    scheduleRender();
  }

  function incWrite(delta = 1) {
    writeCount += delta;
    scheduleRender();
  }

  return {
    start,
    idle,
    stop,
    pause,
    resume,
    setState,
    incCompare,
    incSwap,
    incWrite,
  };
})();
