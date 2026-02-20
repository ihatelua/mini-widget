function itemAt(c, i){
  return c.children[i];
}

function valueAt(c, i){
  return Number(itemAt(c, i).dataset.value);
}

function setValueAt(c, i, v){
  const it = itemAt(c, i);
  it.dataset.value = String(v);
  it.querySelector(".bar").style.height = `${v * 3}px`;
  it.querySelector(".label").textContent = String(v);
  
  // 추가: write 카운트
  window.SortStats?.incWrite?.(1);
}

function clearMarks(c){
  [...c.children].forEach(el => el.classList.remove("compare","sorted","write"));
}

function markCompare(c, i, j){
  itemAt(c, i).classList.add("compare");
  itemAt(c, j).classList.add("compare");

  // 추가: compare 카운트
  window.SortStats?.incCompare?.(1);
}

function unmarkCompare(c, i, j){
  itemAt(c, i).classList.remove("compare");
  itemAt(c, j).classList.remove("compare");
}

async function writeMark(c, i){
  itemAt(c, i).classList.add('write');

  const d = getDelay();
  // ✅ 최고속이면 대기 거의 없이, 가끔만 이벤트루프 양보
  if (d === 0) {
    await sleep(0); // (우리가 수정한 sleep) => 가끔 yield
  } else {
    await sleep(Math.round(d * 0.6));
  }

  itemAt(c, i).classList.remove('write');
}
