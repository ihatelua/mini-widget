SortRegistry.register({
  id: 'merge',
  name: 'Merge',
  type: 'write',
  run: async (c, DESC) => {
    const SP = window.SortPoints;
    SP?.bind?.(c);
    SP?.clearAll?.();

    const arr = [...c.children].map(el => Number(el.dataset.value));

    async function merge(l,m,r){
      SP?.merge?.split?.(l, m, r);

      const L = arr.slice(l,m+1);
      const R = arr.slice(m+1,r+1);
      let i=0,j=0,k=l;

      while(i<L.length && j<R.length){
        arr[k] = DESC ? (L[i] > R[j] ? L[i++] : R[j++])
                      : (L[i] < R[j] ? L[i++] : R[j++]);
        setValueAt(c, k, arr[k]);
        await writeMark(c, k);
        k++;
      }
      while(i<L.length){
        arr[k]=L[i++];
        setValueAt(c, k, arr[k]);
        await writeMark(c, k);
        k++;
      }
      while(j<R.length){
        arr[k]=R[j++];
        setValueAt(c, k, arr[k]);
        await writeMark(c, k);
        k++;
      }
    }

    async function sort(l,r){
      if(l>=r) return;
      const m=(l+r)>>1;
      await sort(l,m);
      await sort(m+1,r);
      await merge(l,m,r);
    }

    await sort(0, arr.length-1);

    SP?.merge?.clear?.();
    SP?.text?.('정렬 완료');

    [...c.children].forEach(el=>el.classList.add('sorted'));
  }
});

SortRegistry.register({
  id: 'counting',
  name: 'Counting',
  type: 'write',
  run: async (c, DESC) => {
    const SP = window.SortPoints;
    SP?.bind?.(c);
    SP?.clearAll?.();

    const arr = [...c.children].map(el => Number(el.dataset.value));
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min + 1;
    const count = new Array(range).fill(0);
    for(const v of arr) count[v - min]++;

    if(!DESC){
      let idx = 0;
      for(let v=min; v<=max; v++){
        SP?.countingValue?.(v);

        while(count[v-min] > 0){
          setValueAt(c, idx, v);
          await writeMark(c, idx);
          idx++;
          count[v-min]--;
        }
      }
    }else{
      let idx = 0;
      for(let v=max; v>=min; v--){
        SP?.countingValue?.(v);

        while(count[v-min] > 0){
          setValueAt(c, idx, v);
          await writeMark(c, idx);
          idx++;
          count[v-min]--;
        }
      }
    }

    SP?.text?.('정렬 완료');

    [...c.children].forEach(el=>el.classList.add('sorted'));
  }
});

SortRegistry.register({
  id: 'radix',
  name: 'Radix (LSD)',
  type: 'write',
  run: async (c, DESC) => {
    const SP = window.SortPoints;
    SP?.bind?.(c);
    SP?.clearAll?.();

    let arr = [...c.children].map(el => Number(el.dataset.value));
    const max = Math.max(...arr);

    let digitPass = 0;
    for(let exp=1; Math.floor(max/exp) > 0; exp*=10){
      SP?.radixDigit?.(digitPass, 10);
      digitPass++;

      const output = new Array(arr.length).fill(0);
      const freq = new Array(10).fill(0);

      // 1) 빈도
      for(const v of arr){
            const d = Math.floor(v/exp) % 10;
            freq[d]++;
        }

        // 2) prefix(누적)
        const prefix = new Array(10).fill(0);
        let sum = 0;
        for(let d=0; d<10; d++){
            sum += freq[d];
            prefix[d] = sum; // digit d의 끝+1 위치
        }

        // 3) stable placement (pos는 움직이는 포인터)
        const pos = prefix.slice();
        for(let i=arr.length-1; i>=0; i--){
            const v = arr[i];
            const d = Math.floor(v/exp) % 10;
            output[--pos[d]] = v;
        }

        // 4) "digit별 결과 구간"을 잠깐 강조 (버킷 인덱스+range)
        SP?.radixDigit?.(digitPass - 1, 10);
        for(let d=0; d<10; d++){
            const start = (d === 0) ? 0 : prefix[d-1];
            const end = prefix[d] - 1;
            if(start <= end){
                SP?.bucketIndex?.(d, 10);
                SP?.radix?.range?.(start, end);
                await sleep(Math.round(getDelay() * 0.35));
            }
        }

        // 5) 실제 write
        SP?.radix?.clear?.();
        arr = output;
        for(let i=0; i<arr.length; i++){
            setValueAt(c, i, arr[i]);
            await writeMark(c, i);
        }

    }

    if(DESC){
      SP?.text?.('내림차순 반전');
      arr.reverse();
      for(let i=0;i<arr.length;i++){
        setValueAt(c, i, arr[i]);
        await writeMark(c, i);
      }
    }

    SP?.text?.('정렬 완료');

    [...c.children].forEach(el=>el.classList.add('sorted'));
  }
});

SortRegistry.register({
  id: 'bucket',
  name: 'Bucket',
  type: 'write',
  run: async (c, DESC) => {
    const SP = window.SortPoints;
    SP?.bind?.(c);
    SP?.clearAll?.();

    const arr = [...c.children].map(el => Number(el.dataset.value));
    const min = Math.min(...arr);
    const max = Math.max(...arr);

    const bucketCount = 10;
    const buckets = Array.from({length: bucketCount}, () => []);
    const span = (max - min + 1) / bucketCount;

    for(const v of arr){
      let idx = Math.floor((v - min) / span);
      if(idx >= bucketCount) idx = bucketCount - 1;
      buckets[idx].push(v);
    }

    // 각 버킷 정렬(오름)
    for(const b of buckets) b.sort((a,b)=>a-b);

    // 병합 + write (버킷 인덱스 표시가 잘 보이도록 flat() 대신 직접 합침)
    let k = 0;

    if(!DESC){
      for(let bi=0; bi<bucketCount; bi++){
        SP?.bucketIndex?.(bi, bucketCount);

        for(const v of buckets[bi]){
          setValueAt(c, k, v);
          await writeMark(c, k);
          k++;
        }
      }
    }else{
      for(let bi=bucketCount-1; bi>=0; bi--){
        SP?.bucketIndex?.(bi, bucketCount);

        const b = buckets[bi];
        for(let t=b.length-1; t>=0; t--){
          setValueAt(c, k, b[t]);
          await writeMark(c, k);
          k++;
        }
      }
    }

    SP?.text?.('정렬 완료');

    [...c.children].forEach(el=>el.classList.add('sorted'));
  }
});
