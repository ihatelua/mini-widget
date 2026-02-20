// js/app.js
const bars = document.getElementById("bars");
const randomBtn = document.getElementById("random");
const goBtn = document.getElementById("go");
const pauseBtn = document.getElementById("pause");
const resumeBtn = document.getElementById("resume");
const stopBtn = document.getElementById("stop");

const countSlider = document.getElementById("count");
const algoSelect = document.getElementById("algo");
const dirToggle = document.getElementById("direction");
const speed = document.getElementById("speed");

// 카드 UI
const algoCard = document.getElementById("algoCard");
const algoTitle = document.getElementById("algoTitle");
const algoStatus = document.getElementById("algoStatus");
const algoMeta = document.getElementById("algoMeta");
const algoDesc = document.getElementById("algoDesc");

let DESC = false;
let running = false;

// ✅ 한글 설명/메타
const ALGO_INFO = {
  bubble:   { title:"버블 정렬", meta:"복잡도: O(n²) / 안정적: O", desc:"인접한 두 값을 비교해 교환하면서 큰(또는 작은) 값이 끝으로 ‘거품처럼’ 이동합니다. 단순하지만 데이터가 많으면 느립니다." },
  selection:{ title:"선택 정렬", meta:"복잡도: O(n²) / 안정적: X", desc:"남은 구간에서 최댓값(또는 최솟값)을 찾아 현재 위치와 교환합니다. 교환 횟수는 적지만 비교가 많습니다." },
  insertion:{ title:"삽입 정렬", meta:"복잡도: O(n²) / 안정적: O", desc:"앞쪽 구간을 정렬된 상태로 유지하며, 새 원소를 알맞은 위치에 ‘삽입’합니다. 거의 정렬된 데이터에 강합니다." },
  quick:    { title:"퀵 정렬", meta:"평균: O(n log n), 최악: O(n²) / 안정적: X", desc:"피벗을 기준으로 작은 쪽/큰 쪽으로 분할(파티션) 후 재귀 정렬합니다. 평균적으로 매우 빠릅니다." },
  shell:    { title:"셸 정렬", meta:"대략: O(n^1.3~n^2) / 안정적: X", desc:"간격(gap)을 두고 삽입 정렬을 반복하며 gap을 줄여갑니다. 멀리 있는 값들이 ‘점프’하며 정렬됩니다." },
  cocktail: { title:"칵테일 셰이커 정렬", meta:"복잡도: O(n²) / 안정적: O", desc:"버블 정렬을 좌→우, 우→좌 번갈아 수행합니다. 양쪽으로 거품이 이동해 버블보다 직관적으로 보입니다." },
  comb:     { title:"콤 정렬", meta:"평균: O(n log n) 근처 / 안정적: X", desc:"버블 정렬의 단점을 줄이기 위해 큰 gap으로 비교를 시작해 gap을 줄입니다. 초반에 빠르게 ‘대충’ 정렬됩니다." },
  gnome:    { title:"놈 정렬", meta:"복잡도: O(n²) / 안정적: O", desc:"앞으로 가다가 순서가 틀리면 한 칸 뒤로 물러나 교환합니다. 구현은 단순, 움직임이 재미있습니다." },
  heap:     { title:"힙 정렬", meta:"복잡도: O(n log n) / 안정적: X", desc:"힙(완전이진트리 기반)을 만들고 루트 값을 끝으로 보내며 힙을 재구성합니다. 최악 케이스에도 안정적인 성능입니다." },
  merge:    { title:"병합 정렬", meta:"복잡도: O(n log n) / 안정적: O", desc:"배열을 분할한 뒤 정렬하며 병합합니다. ‘덮어쓰기’로 값이 재배치되는 흐름을 보기 좋습니다." },
  counting: { title:"계수 정렬", meta:"복잡도: O(n + k) / 안정적: O(구현에 따라)", desc:"값의 범위(k)가 작을 때 카운트 배열로 정렬합니다. 비교 정렬이 아니어서 매우 빠를 수 있습니다." },
  radix:    { title:"기수 정렬(LSD)", meta:"복잡도: O(d(n + k)) / 안정적: O", desc:"1의 자리부터 자리수(d)별로 안정 정렬을 반복합니다. 정수 데이터에 강하고 버킷 개념을 이해하기 좋습니다." },
  bucket:   { title:"버킷 정렬", meta:"평균: O(n + k) 근처 / 안정적: 구현에 따라", desc:"값을 구간별 버킷에 분배한 뒤 각 버킷을 정렬하고 합칩니다. 분포가 고르면 매우 빠릅니다." },
  intro:    { title:"인트로 정렬(IntroSort)", meta:"복잡도: O(n log n) / 안정적: X", desc:"퀵 정렬을 기본으로 하되, 재귀 깊이가 깊어지면 힙 정렬로 전환하고 작은 구간은 삽입 정렬을 사용합니다. 실전 철학이 담긴 하이브리드입니다." },
  tim:      { title:"팀 정렬(TimSort, 교육용)", meta:"실전: O(n log n) / 안정적: O", desc:"이미 정렬된 ‘런(run)’을 활용해 효율을 높이는 실전 정렬입니다. 여기서는 런 탐지/확장 + 병합 흐름을 교육용으로 단순화해 보여줍니다." },
};

const helpBtn = document.getElementById("helpBtn");
const helpDialog = document.getElementById("helpDialog");
const helpBackdrop = document.getElementById("helpBackdrop");
const helpClose = document.getElementById("helpClose");

function openHelp(){
  if(!helpDialog || !helpBackdrop || !helpBtn) return;
  helpDialog.hidden = false;
  helpBackdrop.hidden = false;
  helpBtn.setAttribute("aria-expanded", "true");
}
function closeHelp(){
  if(!helpDialog || !helpBackdrop || !helpBtn) return;
  helpDialog.hidden = true;
  helpBackdrop.hidden = true;
  helpBtn.setAttribute("aria-expanded", "false");
}

helpBtn?.addEventListener("click", () => {
  if(helpDialog?.hidden) openHelp();
  else closeHelp();
});
helpClose?.addEventListener("click", closeHelp);
helpBackdrop?.addEventListener("click", closeHelp);

document.addEventListener("keydown", (e) => {
  if(e.key === "Escape") closeHelp();
});


function setCardState(state, statusText){
  algoCard.dataset.state = state;
  algoStatus.textContent = statusText;

  // 추가: stats도 상태 반영(선택)
  window.SortStats?.setState?.(state);
}

function updateAlgoCard(){
  const id = algoSelect.value;

  if(!id){
    algoTitle.textContent = "알고리즘";
    algoMeta.textContent = "복잡도: - / 안정성: -";
    algoDesc.textContent = "알고리즘을 선택하면 여기 설명이 표시됩니다.";
    return;
  }

  const info = ALGO_INFO[id] || { title:"알고리즘", meta:"복잡도: - / 안정성: -", desc:"설명이 없습니다." };
  algoTitle.textContent = info.title;
  algoMeta.textContent = info.meta;
  algoDesc.textContent = info.desc;
}



function fillAlgoOptions(){
  const list = SortRegistry.list();
  algoSelect.innerHTML = "";

  // ✅ 맨 위 '선택'
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "선택";
  placeholder.selected = true;
  placeholder.disabled = true;
  algoSelect.appendChild(placeholder);

  for(const a of list){
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.name;
    algoSelect.appendChild(opt);
  }

  updateAlgoCard();
  setCardState("idle", "대기 중");
  window.UIExtras?.setHudAlgo?.("선택");
  updateEmptyState();
}

const emptyState = document.getElementById("emptyState");

function updateEmptyState(){
  if(!emptyState) return;

  // algo 미선택이면 show, 선택/실행 중이면 hide
  const show = (!algoSelect.value) && !running;
  emptyState.classList.toggle("show", show);
}


function generateRandom(){
  if(running) return;

  clearMarks(bars);
  bars.innerHTML = "";
  const count = Number(countSlider.value);

  for(let i=0;i<count;i++){
    const v = Math.floor(Math.random()*100)+1;

    const item = document.createElement("div");
    item.className = "item";
    item.dataset.value = String(v);

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${v * 3}px`;

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = String(v);

    item.appendChild(bar);
    item.appendChild(label);
    bars.appendChild(item);
  }

  // 추가: 대기 상태 stats 초기화
  window.SortStats?.idle?.(count);
  window.SortPoints?.bind?.(bars);
  window.SortPoints?.clearAll?.();

  updateEmptyState();
}

// 버튼 상태 관리
function setControlsEnabled(enabled){
  randomBtn.disabled = !enabled;
  goBtn.disabled = !enabled;
  algoSelect.disabled = !enabled;
  countSlider.disabled = !enabled;
  dirToggle.disabled = !enabled;
}

function setRunButtons(){
  // running 중일 때만 pause/resume/stop 활성
  pauseBtn.disabled = !running;
  resumeBtn.disabled = !running;
  stopBtn.disabled = !running;
}

dirToggle.onchange = e => DESC = e.target.checked;
algoSelect.onchange = () => {
  updateAlgoCard();
  window.UIExtras?.setHudAlgo?.(algoSelect.selectedOptions?.[0]?.textContent || algoSelect.value);
  if(!running) setCardState("idle", "대기 중");
  updateEmptyState();
};

randomBtn.onclick = generateRandom;

// Pause/Resume/Stop
pauseBtn.onclick = () => {
  if(!running) return;
  SortController.pause();
  window.SortStats?.pause?.();
  window.UIExtras?.setHudState?.(SortController.isPaused() ? 'PAUSED' : 'RUNNING');
  setCardState("paused", "일시정지");
};

resumeBtn.onclick = () => {
  if(!running) return;
  SortController.resume();
  window.SortStats?.pause?.();
  setCardState("running", "정렬 중");
};

stopBtn.onclick = () => {
  if(!running) return;
  SortController.stop();
  window.UIExtras?.setHudState?.('STOPPED');
  setCardState("stopped", "중지됨");
};

goBtn.onclick = async () => {
  if(running) return;

  // ✅ 선택 안 했으면 실행 금지
  if(!algoSelect.value){
    alert("정렬 알고리즘을 선택해 주세요.");
    return;
  }

  running = true;
  SortController.reset();
  clearMarks(bars);
  updateEmptyState();

  setControlsEnabled(false);
  setRunButtons();
  setCardState("running", "정렬 중");

  // 추가: stats 시작(현재 값 스냅샷 기반)
  const values = [...bars.children].map(el => Number(el.dataset.value));
  window.SortStats?.start?.({
    id: algoSelect.value,
    values,
    desc: DESC
  });
  
  window.SortPoints?.bind?.(bars);
  window.SortPoints?.clearAll?.();
  window.UIExtras?.setHudState?.('RUNNING');


  try{
    const algo = SortRegistry.get(algoSelect.value);
    await algo.run(bars, DESC);

    // stop 없이 정상 완료
    if(!SortController.isStopped()){
      setCardState("done", "정렬 완료");
      window.SortStats?.stop?.({ isStopped: false, isFinished: true });
      window.SortPoints?.text?.('정렬 완료');
      window.SortPoints?.heap?.clear?.(); // 힙 존만 쓰는 경우 남는거 방지
      window.UIExtras?.setHudState?.('DONE');
    }
  } catch (e) {
    // STOP으로 인해 끊긴 경우
    if (String(e?.message) === "SORT_STOPPED") {
      // STOP으로 중지됨
      window.SortStats?.stop?.({ isStopped: true, isFinished: false });
      window.SortPoints?.text?.('중지됨');
    } else {
      // 다른 에러면 콘솔로 확인 가능
      console.error(e);
      setCardState("stopped", "오류로 중단");
      window.SortStats?.stop?.({ isStopped: true, isFinished: false });
    }
  } finally {
    running = false;
    SortController.reset();
    setControlsEnabled(true);
    setRunButtons();
  }
};

speed.addEventListener('input', () => {
  window.UIExtras?.setHudSpeed?.(getDelay());
});

function isTypingTarget(el){
  if(!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

document.addEventListener("keydown", (e) => {
  if(isTypingTarget(document.activeElement)) return;

  const key = e.key;

  // 도움말
  if(key === "?" ){
    e.preventDefault();
    if(helpDialog?.hidden) openHelp(); else closeHelp();
    return;
  }

  // RANDOM
  if(key === "r" || key === "R"){
    e.preventDefault();
    randomBtn.click();
    return;
  }

  // GO
  if(key === "g" || key === "G" || key === "Enter"){
    e.preventDefault();
    goBtn.click();
    return;
  }

  // STOP
  if(key === "s" || key === "S"){
    e.preventDefault();
    stopBtn.click();
    return;
  }

  // DESC
  if(key === "d" || key === "D"){
    e.preventDefault();
    dirToggle.checked = !dirToggle.checked;
    dirToggle.dispatchEvent(new Event("change"));
    return;
  }

  // Space: pause/resume 토글
  if(key === " "){
    e.preventDefault();
    if(!running) return;
    if(SortController.isPaused()) resumeBtn.click();
    else pauseBtn.click();
  }
});


// 초기 UI
fillAlgoOptions();

window.UIExtras?.init?.({
  barsEl: bars,
  algoText: (algoSelect?.selectedOptions?.[0]?.textContent || algoSelect?.value || '-'),
  speedMs: (typeof getDelay === 'function' ? getDelay() : null),
  state: 'IDLE'
});

generateRandom();
setRunButtons();
updateEmptyState();
