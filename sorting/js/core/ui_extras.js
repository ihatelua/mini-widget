// js/core/ui_extras.js
window.UIExtras = (() => {
  let bars = null;

  const hud = {
    root: null,
    status: null,
    algo: null,
    speed: null,
    state: 'IDLE',
  };

  const tt = {
    root: null,
    title: null,
    meta: null,
    tags: null,
    shown: false,
    pad: 14,
  };

  function bindDom(){
    if (!hud.root) hud.root = document.getElementById('miniHud');
    if (!hud.status) hud.status = document.getElementById('hudStatus');
    if (!hud.algo) hud.algo = document.getElementById('hudAlgo');
    if (!hud.speed) hud.speed = document.getElementById('hudSpeed');

    if (!tt.root) tt.root = document.getElementById('barTooltip');
    if (!tt.title) tt.title = document.getElementById('ttTitle');
    if (!tt.meta) tt.meta = document.getElementById('ttMeta');
    if (!tt.tags) tt.tags = document.getElementById('ttTags');
  }

  function setHudState(state){
    bindDom();
    hud.state = state || 'IDLE';
    if (hud.status) hud.status.textContent = hud.state;
    if (hud.root) hud.root.dataset.state = hud.state;
  }

  function setHudAlgo(text){
    bindDom();
    if (hud.algo) hud.algo.textContent = text || '-';
  }

  function setHudSpeed(ms){
    bindDom();
    if (!hud.speed) return;
    if (ms === 0) hud.speed.textContent = '0ms (FAST)';
    else if (typeof ms === 'number') hud.speed.textContent = `${ms}ms`;
    else hud.speed.textContent = '-';
  }

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

  function showTooltip(x, y){
    bindDom();
    if (!tt.root) return;

    // 화면 밖으로 나가지 않게
    const rect = tt.root.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = x + tt.pad;
    let top = y + tt.pad;

    // 오른쪽/아래쪽 넘치면 반대 방향
    if (left + rect.width + tt.pad > vw) left = x - rect.width - tt.pad;
    if (top + rect.height + tt.pad > vh) top = y - rect.height - tt.pad;

    tt.root.style.left = `${clamp(left, 8, vw - rect.width - 8)}px`;
    tt.root.style.top  = `${clamp(top,  8, vh - rect.height - 8)}px`;

    if (!tt.shown){
      tt.shown = true;
      tt.root.classList.add('show');
      tt.root.setAttribute('aria-hidden', 'false');
    }
  }

  function hideTooltip(){
    if (!tt.root) return;
    tt.shown = false;
    tt.root.classList.remove('show');
    tt.root.setAttribute('aria-hidden', 'true');
  }

  function makeTag(text){
    const el = document.createElement('span');
    el.className = 'tt-tag';
    el.textContent = text;
    return el;
  }

  function collectTags(item){
    const tags = [];

    // 프로젝트에서 쓰는 클래스들을 최대한 넓게 커버
    const has = (c) => item.classList.contains(c);

    if (has('sorted')) tags.push('sorted');
    if (has('pivot')) tags.push('pivot');
    if (has('boundary-l')) tags.push('i');
    if (has('boundary-r')) tags.push('j');

    if (has('q-left')) tags.push('left');
    if (has('q-mid')) tags.push('scan');
    if (has('q-right')) tags.push('right');

    if (has('range-partition')) tags.push('partition');
    if (has('range-merge') || has('range-merge-l') || has('range-merge-r')) tags.push('merge');
    if (has('merge-mid')) tags.push('mid');

    if (has('heap-zone')) tags.push('heap');
    if (has('sorted-zone')) tags.push('done-zone');

    if (has('write')) tags.push('write');

    // compare 마킹 클래스 이름이 프로젝트마다 달라서 후보를 여러 개 체크
    if (has('compare') || has('comparing') || has('cmp')) tags.push('compare');

    return tags;
  }

  function onMove(e){
    if (!bars) return;
    const item = e.target.closest('.item');
    if (!item || !bars.contains(item)){
      hideTooltip();
      return;
    }

    bindDom();

    const idx = Array.prototype.indexOf.call(bars.children, item);
    const v = item.dataset.value ?? '-';
    const tags = collectTags(item);

    if (tt.title) tt.title.textContent = `index ${idx}`;
    if (tt.meta) tt.meta.textContent = `value ${v}`;

    if (tt.tags){
      tt.tags.innerHTML = '';
      tags.forEach(t => tt.tags.appendChild(makeTag(t)));
    }

    showTooltip(e.clientX, e.clientY);
  }

  function attachTooltip(container){
    if (!container) return;
    bars = container;
    bars.addEventListener('mousemove', onMove);
    bars.addEventListener('mouseleave', hideTooltip);
    bars.addEventListener('scroll', hideTooltip, true);
  }

  function init({ barsEl, algoText, speedMs, state }){
    bindDom();
    if (barsEl) attachTooltip(barsEl);
    setHudAlgo(algoText || '-');
    setHudSpeed(typeof speedMs === 'number' ? speedMs : (typeof window.getDelay === 'function' ? window.getDelay() : null));
    setHudState(state || 'IDLE');
  }

  return {
    init,
    setHudState,
    setHudAlgo,
    setHudSpeed,
  };
})();
