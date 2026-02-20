function lt(a, b, DESC) {
  return DESC ? (a > b) : (a < b);
}

function needSwapByOrder(a, b, DESC) {
  return DESC ? (a < b) : (a > b);
}

SortRegistry.register({
  id: 'intro',
  name: 'IntroSort',
  type: 'advanced',
  run: async (c, DESC) => {
    const n = c.children.length;
    if (n <= 1) {
      [...c.children].forEach(el => el.classList.add('sorted'));
      return;
    }

    const INSERTION_THRESHOLD = 16;
    const value = (i) => valueAt(c, i);

    async function compareMark(i, j) {
      markCompare(c, i, j);
      await sleep(getDelay());
      unmarkCompare(c, i, j);
    }

    async function insertionRange(lo, hi) {
      for (let i = lo + 1; i <= hi; i++) {
        let j = i;
        while (j > lo) {
          await compareMark(j - 1, j);
          if (needSwapByOrder(value(j - 1), value(j), DESC)) {
            flipSwap(c, j - 1, j);
            await sleep(getDelay());
            j--;
          } else {
            break;
          }
        }
      }
    }

    async function heapifyRange(base, size, i) {
      let t = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      const idx = (k) => base + k;
      const isMaxHeap = !DESC;

      if (l < size) {
        const a = value(idx(l));
        const b = value(idx(t));
        const better = isMaxHeap ? (a > b) : (a < b);
        if (better) t = l;
      }

      if (r < size) {
        const a = value(idx(r));
        const b = value(idx(t));
        const better = isMaxHeap ? (a > b) : (a < b);
        if (better) t = r;
      }

      if (t !== i) {
        await compareMark(idx(i), idx(t));
        flipSwap(c, idx(i), idx(t));
        await sleep(getDelay());
        await heapifyRange(base, size, t);
      }
    }

    async function heapSortRange(lo, hi) {
      const size = hi - lo + 1;
      if (size <= 1) return;

      for (let i = Math.floor(size / 2) - 1; i >= 0; i--) {
        await heapifyRange(lo, size, i);
      }

      for (let end = size - 1; end > 0; end--) {
        await compareMark(lo, lo + end);
        flipSwap(c, lo, lo + end);
        await sleep(getDelay());
        await heapifyRange(lo, end, 0);
      }
    }

    async function partition(lo, hi) {
      const pivot = value(hi);
      let i = lo;

      for (let j = lo; j < hi; j++) {
        await compareMark(j, hi);
        const goesLeft = lt(value(j), pivot, DESC);
        if (goesLeft) {
          if (i !== j) {
            await compareMark(i, j);
            flipSwap(c, i, j);
            await sleep(getDelay());
          }
          i++;
        }
      }

      await compareMark(i, hi);
      flipSwap(c, i, hi);
      await sleep(getDelay());
      return i;
    }

    async function intro(lo, hi, depthLimit) {
      const len = hi - lo + 1;
      if (len <= 1) return;

      if (len <= INSERTION_THRESHOLD) {
        await insertionRange(lo, hi);
        return;
      }

      if (depthLimit === 0) {
        await heapSortRange(lo, hi);
        return;
      }

      const p = await partition(lo, hi);
      await intro(lo, p - 1, depthLimit - 1);
      await intro(p + 1, hi, depthLimit - 1);
    }

    const depthLimit = 2 * Math.floor(Math.log2(n));
    await intro(0, n - 1, depthLimit);
    [...c.children].forEach(el => el.classList.add('sorted'));
  }
});

SortRegistry.register({
  id: 'tim',
  name: 'TimSort (educational)',
  type: 'advanced',
  run: async (c, DESC) => {
    const SP = window.SortPoints;
    SP?.bind?.(c);
    SP?.clearAll?.();

    const n = c.children.length;
    if (n <= 1) {
      [...c.children].forEach(el => el.classList.add('sorted'));
      return;
    }

    let arr = [...c.children].map(el => Number(el.dataset.value));

    function calcMinRun(x) {
      let r = 0;
      while (x >= 32) {
        r |= (x & 1);
        x >>= 1;
      }
      return x + r;
    }

    const minRun = calcMinRun(n);

    async function writeAll(from, to) {
      for (let i = from; i <= to; i++) {
        setValueAt(c, i, arr[i]);
        await writeMark(c, i);
      }
    }

    async function insertionOnArray(lo, hi) {
      for (let i = lo + 1; i <= hi; i++) {
        const x = arr[i];
        let j = i - 1;
        while (j >= lo && (DESC ? (arr[j] < x) : (arr[j] > x))) {
          arr[j + 1] = arr[j];
          j--;
        }
        arr[j + 1] = x;
        await writeAll(lo, i);
      }
    }

    function reverseRun(lo, hi) {
      while (lo < hi) {
        const t = arr[lo];
        arr[lo] = arr[hi];
        arr[hi] = t;
        lo++;
        hi--;
      }
    }

    const runs = [];
    let i = 0;
    while (i < n) {
      let runStart = i;
      let runEnd = i;

      if (i === n - 1) {
        runs.push({ lo: runStart, hi: runEnd });
        break;
      }

      const ascending = arr[i] <= arr[i + 1];
      while (runEnd + 1 < n) {
        const a = arr[runEnd];
        const b = arr[runEnd + 1];
        if (ascending ? (a <= b) : (a >= b)) runEnd++;
        else break;
      }

      if (!ascending) reverseRun(runStart, runEnd);

      const need = Math.min(n - 1, runStart + minRun - 1);
      if (runEnd < need) {
        runEnd = need;
        await insertionOnArray(runStart, runEnd);
      } else {
        await writeAll(runStart, runEnd);
      }

      runs.push({ lo: runStart, hi: runEnd });
      i = runEnd + 1;
    }

    async function merge(lo, mid, hi) {
      // ✅ merge 구간 표시
      SP?.merge?.split?.(lo, mid, hi);

      const left = arr.slice(lo, mid + 1);
      const right = arr.slice(mid + 1, hi + 1);
      let p = 0, q = 0, k = lo;

      while (p < left.length && q < right.length) {
        if (left[p] <= right[q]) arr[k++] = left[p++];
        else arr[k++] = right[q++];
      }
      while (p < left.length) arr[k++] = left[p++];
      while (q < right.length) arr[k++] = right[q++];

      await writeAll(lo, hi);
    }

    let size = 1;
    while (size < runs.length) {
      for (let r = 0; r + size < runs.length; r += 2 * size) {
        const left = runs[r];
        const right = runs[r + size];
        const lo = left.lo;
        const mid = left.hi;
        const hi = right.hi;
        await merge(lo, mid, hi);
        left.hi = hi;
        runs.splice(r + 1, size);
      }
      size *= 2;
    }

    if (DESC) {
      arr.reverse();
      for (let k = 0; k < n; k++) {
        setValueAt(c, k, arr[k]);
        await writeMark(c, k);
      }
    }

    SP?.merge?.clear?.();
    SP?.text?.('정렬 완료');

    [...c.children].forEach(el => el.classList.add('sorted'));
  }
});
