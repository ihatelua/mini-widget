SortRegistry.register({
  id: 'heap',
  name: 'Heap',
  type: 'swap',
  run: async (c, DESC) => {
    const n = c.children.length;
    const isMaxHeap = !DESC; // ASC면 MaxHeap, DESC면 MinHeap

    const SP = window.SortPoints;
    SP?.bind?.(c);
    SP?.clearAll?.();
    SP?.heap?.boundary?.(n);

    async function heapify(size, i){
      let t=i;
      const l=2*i+1, r=2*i+2;

      if(l<size && (isMaxHeap ? valueAt(c,l) > valueAt(c,t) : valueAt(c,l) < valueAt(c,t))) t=l;
      if(r<size && (isMaxHeap ? valueAt(c,r) > valueAt(c,t) : valueAt(c,r) < valueAt(c,t))) t=r;

      if(t!==i){
        flipSwap(c, i, t);
        await sleep(window.getSwapDuration ? window.getSwapDuration() : getDelay());
        await heapify(size, t);
      }

    }

    for(let i=Math.floor(n/2)-1;i>=0;i--) await heapify(n,i);

    for(let end=n-1; end>0; end--){
        flipSwap(c, 0, end);

        // ✅ swap 애니메이션 duration 만큼 기다림
        await sleep(window.getSwapDuration ? window.getSwapDuration() : getDelay());

        // ✅ 기다린 다음에 sorted/경계 업데이트(여기가 끊김 체감에 영향 큼)
        itemAt(c,end).classList.add('sorted');
        SP?.heap?.boundary?.(end);

        await heapify(end,0);
    }

    if(n>0) itemAt(c,0).classList.add('sorted');

    SP?.heap?.boundary?.(0);
  }
});
