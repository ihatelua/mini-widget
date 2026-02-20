function needSwap(a, b, DESC){
  return DESC ? (a < b) : (a > b);
}

SortRegistry.register({
  id: 'bubble',
  name: 'Bubble',
  type: 'swap',
  run: async (c, DESC) => {
    const n = c.children.length;
    for(let i=0;i<n-1;i++){
      for(let j=0;j<n-i-1;j++){
        markCompare(c, j, j+1);
        await sleep(getDelay());
        if(needSwap(valueAt(c,j), valueAt(c,j+1), DESC)){
          flipSwap(c, j, j+1);
          await sleep(getDelay());
        }
        unmarkCompare(c, j, j+1);
      }
      itemAt(c, n-1-i).classList.add('sorted');
    }
    if(n>0) itemAt(c,0).classList.add('sorted');
  }
});

SortRegistry.register({
  id: 'selection',
  name: 'Selection',
  type: 'swap',
  run: async (c, DESC) => {
    const n = c.children.length;
    for(let i=0;i<n-1;i++){
      let best = i;
      for(let j=i+1;j<n;j++){
        markCompare(c, best, j);
        await sleep(getDelay());
        const a = valueAt(c, best);
        const b = valueAt(c, j);
        const better = DESC ? (b > a) : (b < a);
        unmarkCompare(c, best, j);
        if(better) best = j;
      }
      if(best !== i){
        markCompare(c, i, best);
        await sleep(getDelay());
        flipSwap(c, i, best);
        await sleep(getDelay());
        unmarkCompare(c, i, best);
      }
      itemAt(c,i).classList.add('sorted');
    }
    if(n>0) itemAt(c,n-1).classList.add('sorted');
  }
});

SortRegistry.register({
  id: 'insertion',
  name: 'Insertion',
  type: 'swap',
  run: async (c, DESC) => {
    const n = c.children.length;
    for(let i=1;i<n;i++){
      let j=i;
      while(j>0){
        markCompare(c, j-1, j);
        await sleep(getDelay());
        if(needSwap(valueAt(c,j-1), valueAt(c,j), DESC)){
          flipSwap(c, j-1, j);
          await sleep(getDelay());
          unmarkCompare(c, j-1, j);
          j--;
        }else{
          unmarkCompare(c, j-1, j);
          break;
        }
      }
    }
    [...c.children].forEach(el=>el.classList.add('sorted'));
  }
});

SortRegistry.register({
  id: 'quick',
  name: 'Quick',
  type: 'swap',
  run: async (c, DESC) => {
    const n = c.children.length;

    const SP = window.SortPoints;
    SP?.bind?.(c);
    SP?.clearAll?.();

    async function partition(lo, hi){
        // pivot = hi
        const pivotVal = valueAt(c, hi);
        let i = lo;

        // 시작 상태 (j는 lo-1로 두면 "탐색중 구간"이 비어있는 상태로 시작)
        SP?.quick?.state?.({ pivot: hi, lo, i, j: lo - 1, hi });

        for(let j = lo; j < hi; j++){
            // 루프 상태 갱신: 3영역 + pivot + i/j
            SP?.quick?.state?.({ pivot: hi, lo, i, j, hi });

            markCompare(c, j, hi);
            await sleep(getDelay());
            unmarkCompare(c, j, hi);

            const goesLeft = DESC ? (valueAt(c,j) > pivotVal) : (valueAt(c,j) < pivotVal);
            if(goesLeft){
            if(i !== j){
                markCompare(c, i, j);
                await sleep(getDelay());
                flipSwap(c, i, j);
                await sleep(getDelay());
                unmarkCompare(c, i, j);
            }
            i++;
            SP?.quick?.state?.({ pivot: hi, lo, i, j, hi });
            }
        }

        // pivot swap 직전 상태
        SP?.quick?.state?.({ pivot: hi, lo, i, j: hi, hi });

        markCompare(c, i, hi);
        await sleep(getDelay());
        flipSwap(c, i, hi);
        await sleep(getDelay());
        unmarkCompare(c, i, hi);

        // pivot 최종 위치는 i
        SP?.quick?.state?.({ pivot: i, lo, i: -1, j: -1, hi });

        return i;
    }

    async function qs(lo, hi){
      if(lo >= hi) return;
      const p = await partition(lo, hi);
      await qs(lo, p-1);
      await qs(p+1, hi);
    }

    await qs(0, n-1);

    SP?.quick?.clear?.();
    SP?.text?.('정렬 완료');

    [...c.children].forEach(el=>el.classList.add('sorted'));
  }
});

SortRegistry.register({
  id: 'shell',
  name: 'Shell',
  type: 'swap',
  run: async (c, DESC) => {
    const n = c.children.length;
    for(let gap=Math.floor(n/2); gap>0; gap=Math.floor(gap/2)){
      for(let i=gap;i<n;i++){
        let j=i;
        while(j-gap>=0){
          markCompare(c, j-gap, j);
          await sleep(getDelay());
          const need = DESC ? (valueAt(c,j-gap) < valueAt(c,j)) : (valueAt(c,j-gap) > valueAt(c,j));
          if(need){
            flipSwap(c, j-gap, j);
            await sleep(getDelay());
            unmarkCompare(c, j-gap, j);
            j -= gap;
          }else{
            unmarkCompare(c, j-gap, j);
            break;
          }
        }
      }
    }
    [...c.children].forEach(el=>el.classList.add('sorted'));
  }
});

SortRegistry.register({
  id: 'cocktail',
  name: 'Cocktail',
  type: 'swap',
  run: async (c, DESC) => {
    const n = c.children.length;
    let start=0, end=n-1, swapped=true;

    while(swapped){
      swapped=false;
      for(let i=start;i<end;i++){
        markCompare(c, i, i+1);
        await sleep(getDelay());
        if(needSwap(valueAt(c,i), valueAt(c,i+1), DESC)){
          flipSwap(c, i, i+1);
          await sleep(getDelay());
          swapped=true;
        }
        unmarkCompare(c, i, i+1);
      }
      if(n>0) itemAt(c,end).classList.add('sorted');
      if(!swapped) break;
      swapped=false;
      end--;

      for(let i=end;i>start;i--){
        markCompare(c, i-1, i);
        await sleep(getDelay());
        if(needSwap(valueAt(c,i-1), valueAt(c,i), DESC)){
          flipSwap(c, i-1, i);
          await sleep(getDelay());
          swapped=true;
        }
        unmarkCompare(c, i-1, i);
      }
      if(n>0) itemAt(c,start).classList.add('sorted');
      start++;
    }
    [...c.children].forEach(el=>el.classList.add('sorted'));
  }
});

SortRegistry.register({
  id: 'comb',
  name: 'Comb',
  type: 'swap',
  run: async (c, DESC) => {
    const n = c.children.length;
    let gap=n, swapped=true;
    const shrink=1.3;

    while(gap !== 1 || swapped){
      gap = Math.floor(gap / shrink);
      if(gap < 1) gap=1;
      swapped=false;

      for(let i=0;i+gap<n;i++){
        const j=i+gap;
        markCompare(c, i, j);
        await sleep(getDelay());
        if(needSwap(valueAt(c,i), valueAt(c,j), DESC)){
          flipSwap(c, i, j);
          await sleep(getDelay());
          swapped=true;
        }
        unmarkCompare(c, i, j);
      }
    }
    [...c.children].forEach(el=>el.classList.add('sorted'));
  }
});

SortRegistry.register({
  id: 'gnome',
  name: 'Gnome',
  type: 'swap',
  run: async (c, DESC) => {
    const n = c.children.length;
    let i=1;

    while(i<n){
      if(i===0){ i=1; continue; }
      markCompare(c, i-1, i);
      await sleep(getDelay());
      const inOrder = DESC ? (valueAt(c,i-1) >= valueAt(c,i)) : (valueAt(c,i-1) <= valueAt(c,i));
      if(inOrder){
        unmarkCompare(c, i-1, i);
        i++;
      }else{
        flipSwap(c, i-1, i);
        await sleep(getDelay());
        unmarkCompare(c, i-1, i);
        i--;
      }
    }
    [...c.children].forEach(el=>el.classList.add('sorted'));
  }
});
