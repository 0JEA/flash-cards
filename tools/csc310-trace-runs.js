// How Help steps through each CSC 310 code card (used by tools/record-traces.js).
//
// The card's own pseudocode runs in steptrace's textbook-pseudocode interpreter; `after`
// is appended below it: the question's input and the call (and any helper procedure the
// card's code uses but does not show, such as Merge). `before` goes above it.
//
//   base    first array index (1 unless the card's code says A[0..])
//   check   how the recorded run is checked against the card's answer:
//             'out'          what the run prints equals the answer
//             'held'         the answer is a value the run holds at some step (an array's
//                            contents, or a run of one variable's values, e.g. the mids)
//             { held: [...] } each of these is held (an answer listing several states)
//             { count, n }   the line containing `count` runs n times (default: the answer)
//             'none'         nothing to check (the answer is a bound or an argument)
//   syntax  'braces' for the Java card
'use strict';

const BS = 'a = [3, 8, 15, 22, 27, 31, 39, 44, 52, 60]';
const MERGE = `
Merge(A, left, mid, right)
    B = Array(left, right)
    i = left
    j = mid + 1
    for k = left to right
        if j > right or (i <= mid and A[i] <= A[j]) then
            B[k] = A[i]
            i = i + 1
        else
            B[k] = A[j]
            j = j + 1
    for k = left to right
        A[k] = B[k]`;
const BUILD = `
BuildMaxHeap(A)
    A.heap_size = length(A)
    for i = floor(length(A) / 2) downto 1
        Max-Heapify(A, i)`;
const ins = (a, check = 'held') => ({ after: `A = [${a}]\nInsertionSort(A, ${a.split(',').length})\nprint(A)`, check });
const findmax = (a, check) => ({ base: 0, after: `A = [${a}]\nprint(FindMaximum(A))`, check });
const part = (a, show = 'print(A)', call) => ({ after: `A = [${a}]\n${show === 'ret' ? `print(${call})` : `${call}\nprint(A)`}`, check: show === 'ret' ? 'out' : 'held' });
const partition = (a, show) => part(a, show, `PARTITION(A, 1, ${a.split(',').length})`);
const counting = (a, k, show) => ({ after: `A = [${a}]\nn = ${a.split(',').length}\nk = ${k}\nB = Array(1, n)\nC = Array(0, k)\nCountingSort(A, B, k)\nprint(${show})`, check: 'held' });
const heapify = { after: `${BUILD.replace(/^\n/, '\n')}\n\nA = [16, 4, 10, 14, 7, 9, 3, 2, 8, 1]\nA.heap_size = 10\nMax-Heapify(A, 2)\nprint(A)`, check: 'none' };
const java = (key, check) => ({
  syntax: 'braces', hashCodes: { [key]: 0 },
  before: 'int capacity = 5;\nString DEL = "DEL";\nString[] table = {"A", "DEL", "C", null, "DEL"};\n',
  after: `// The question starts the probe at slot 0, so ${JSON.stringify(key)}.hashCode() is taken as 0 here.\nSystem.out.println(insert(${JSON.stringify(key)}));`,
  check,
});

module.exports = {
  'c310-1-findmax-count': Object.assign(findmax('3, 7, 2, 9, 5'), { check: { count: 'if A[i] > max', n: 4 } }),
  'c310-1-findmax-updates': Object.assign(findmax('3, 7, 2, 9, 5'), { check: { count: 'max <- A[i]' } }),
  'c310-1-findmax-invariant': findmax('3, 7, 2, 9, 5', 'none'),
  'c310-2-findmax-sorted': Object.assign(findmax('1, 2, 3, 4, 5'), { check: { count: 'if A[i] > max', n: 4 } }),
  'c310-2-findmax-sorted-q2': Object.assign(findmax('1, 2, 3, 4, 5'), { check: { count: 'max <- A[i]', n: 4 } }),

  'c310-2-ins-while-role': ins('5, 2, 4, 6, 1, 3', 'none'),
  'c310-2-ins-trace-j5': ins('5, 2, 4, 6, 1, 3'),
  'c310-2-ins-shifts': Object.assign(ins('5, 2, 4, 6, 1, 3'), { check: { count: 'A[i+1] = A[i]' } }),
  'c310-2-ins-trace-practice': ins('4, 3, 1, 2', { held: ['3 4 1 2', '1 3 4 2', '1 2 3 4'] }),
  'c310-2-ins-trace-clrs': ins('31, 41, 59, 26, 41, 58'),
  'c310-2-ins-invariant': ins('5, 2, 4, 6, 1, 3', 'none'),
  'c310-2-ins-inv-init': ins('5, 2, 4, 6, 1, 3', 'none'),
  'c310-2-ins-inv-maint': ins('5, 2, 4, 6, 1, 3', 'none'),
  'c310-2-ins-inv-term': ins('5, 2, 4, 6, 1, 3', 'none'),
  'c310-2-ins-tj': ins('5, 2, 4, 6, 1, 3', 'none'),
  'c310-2-ins-tj-q2': ins('5, 2, 4, 6, 1, 3', 'none'),
  'c310-2-ins-header-n': Object.assign(ins('5, 2, 4, 6, 1, 3'), { check: { count: 'for j = 2 to n', n: 6 } }),
  'c310-2-ins-T-formula': ins('5, 2, 4, 6, 1, 3', 'none'),
  'c310-2-ins-best': Object.assign(ins('1, 2, 3, 4, 5'), { check: { count: 'A[i+1] = A[i]', n: 0 } }),
  'c310-2-ins-worst': Object.assign(ins('5, 4, 3, 2, 1'), { check: { count: 'A[i+1] = A[i]', n: 10 } }),
  'c310-2-ins-reverse-count': Object.assign(ins('5, 4, 3, 2, 1'), { check: { count: 'A[i+1] = A[i]' } }),
  'c310-2-ins-avg': ins('3, 6, 1, 5, 2, 4', 'none'),

  'c310-3-code-triangle': { before: 'n = 10\nx = 0\n', check: { count: 'x = x + 1' } },
  'c310-3-code-strict': { before: 'n = 8\nA = [1, 2, 3, 4, 5, 6, 7, 8]\ncount = 0\n', check: { count: 'if A[i] == A[j]' } },
  'c310-3-code-doubling': { before: 'n = 16\n', check: { count: 'i = 2 * i', n: 4 } },
  'c310-3-code-nlogn': { before: 'n = 8\n', check: { count: 'j = 2 * j', n: 24 } },
  'c310-3-code-halving-sum': { before: 'n = 16\nx = 0\n', check: { count: 'x = x + 1', n: 31 } },
  'c310-3-code-cubic': { before: 'n = 4\nsum = 0\n', check: { count: 'sum = sum + 1', n: 160 } },

  'c310-4-findmax-recurrence': { after: 'A = [3, 9, 2, 7, 5, 1, 8, 4]\nprint(FindMax(A, 1, 8))', check: 'none' },
  'c310-4-findmax-recurrence-q2': { after: 'A = [3, 9, 2, 7, 5, 1, 8, 4]\nprint(FindMax(A, 1, 8))', check: 'none' },
  'c310-4-ms-example': { after: `${MERGE}\n\nA = [8, 7, 5, 1, 6, 2, 4, 3]\nMergeSort(A, 1, 8)\nprint(A)`, check: 'held' },
  'c310-4-ms-example-q2': { after: `${MERGE}\n\nA = [8, 7, 5, 1, 6, 2, 4, 3]\nMergeSort(A, 1, 8)\nprint(A)`, check: 'none' },
  'c310-4-ms-9': { after: `${MERGE}\n\nA = [10, 5, 7, 6, 1, 4, 8, 3, 2]\nMergeSort(A, 1, 9)\nprint(A)`, check: 'held' },
  'c310-4-ms-9-q2': { after: `${MERGE}\n\nA = [10, 5, 7, 6, 1, 4, 8, 3, 2]\nMergeSort(A, 1, 9)\nprint(A)`, check: 'none' },
  'c310-4-ms-recurrence': { after: `${MERGE}\n\nA = [8, 7, 5, 1, 6, 2, 4, 3]\nMergeSort(A, 1, 8)\nprint(A)`, check: 'none' },

  'c310-ws-update-mc': { after: `${BS}\nprint(BinarySearch(a, 10, 27))`, check: 'none' },
  'c310-ws-dry-27': { after: `${BS}\nprint(BinarySearch(a, 10, 27))`, check: 'out' },
  'c310-ws-dry-25': { after: `${BS}\nprint(BinarySearch(a, 10, 25))`, check: 'none' },
  'c310-ws-dry-25-iters': { after: `${BS}\nprint(BinarySearch(a, 10, 25))`, check: { count: 'mid = floor' } },
  'c310-ws-dry-60': { after: `${BS}\nprint(BinarySearch(a, 10, 60))`, check: 'held' },
  'c310-ws-dry-3': { after: `${BS}\nprint(BinarySearch(a, 10, 3))`, check: 'held' },
  'c310-ws-exact-100': { after: 'a = Range(1, 100)\nprint(BinarySearch(a, 100, 100))', check: { count: 'mid = floor' } },
  'c310-ws-rec-why-log': { base: 0, after: 'A = [3, 8, 15, 22, 27, 31, 39, 44, 52, 60]\nprint(RecursiveBinarySearch(A, 0, 9, 25))', check: 'none' },
  'c310-ws-rec-time': { base: 0, after: 'A = [3, 8, 15, 22, 27, 31, 39, 44, 52, 60]\nprint(RecursiveBinarySearch(A, 0, 9, 25))', check: 'none' },
  'c310-ws-rec-space': { base: 0, after: 'A = [3, 8, 15, 22, 27, 31, 39, 44, 52, 60]\nprint(RecursiveBinarySearch(A, 0, 9, 25))', check: 'none' },

  'c310-7-trace-slide': partition('2, 8, 7, 1, 3, 5, 6, 4'),
  'c310-7-trace-slide-q': partition('2, 8, 7, 1, 3, 5, 6, 4', 'ret'),
  'c310-7-trace-mid': partition('2, 8, 7, 1, 3, 5, 6, 4'),
  'c310-7-prac-1': partition('5, 9, 1, 7, 3, 6'),
  'c310-7-prac-2': partition('7, 2, 9, 4, 8, 1, 5'),
  'c310-7-prac-3': partition('3, 8, 2, 5, 1, 4, 7, 6'),
  'c310-7-prac-q': partition('9, 6, 3, 8, 1, 7, 4', 'ret'),
  'c310-7-example-first': partition('10, 80, 35, 85, 40, 55, 70'),

  'c310-heap-heapify-process': heapify,
  'c310-heap-heapify-process-q2': heapify,
  'c310-heap-heapify-process-q3': heapify,
  'c310-heap-build-prac1': { after: `${BUILD}\n\nA = [5, 12, 3, 9, 20, 7, 15]\nBuildMaxHeap(A)\nprint(A)`, check: 'out' },
  'c310-heap-build-prac2': { after: `${BUILD}\n\nA = [3, 9, 2, 1, 4, 5]\nBuildMaxHeap(A)\nprint(A)`, check: 'out' },
  'c310-heap-heapsort-iter2': { after: '\nA = [7, 5, 6, 4, 3, 2, 1, 8]\nA.heap_size = 7\nSwap(A, 1, 7)\nA.heap_size = 6\nMax-Heapify(A, 1)\nprint(A)', check: 'out' },
  'c310-buildheap-asc15': { after: `${BUILD}\n\nA = Range(1, 15)\nBuildMaxHeap(A)\nprint(A)`, check: { count: 'Swap(A, i, largest)' } },

  'c310-linsort-counting-slide-c': counting('2, 5, 3, 0, 2, 3, 0, 3', 5, 'B'),
  'c310-linsort-counting-slide-prefix': counting('2, 5, 3, 0, 2, 3, 0, 3', 5, 'B'),
  'c310-linsort-counting-slide-first': counting('2, 5, 3, 0, 2, 3, 0, 3', 5, 'B'),
  'c310-linsort-counting-slide-out': Object.assign(counting('2, 5, 3, 0, 2, 3, 0, 3', 5, 'B'), { check: 'out' }),
  'c310-linsort-counting-prac-prefix': counting('1, 4, 1, 2, 0, 4, 2, 1', 4, 'B'),
  'c310-linsort-counting-prac-last': counting('1, 4, 1, 2, 0, 4, 2, 1', 4, 'B'),
  'c310-linsort-counting-prac-out': counting('3, 0, 1, 3, 2, 0, 3', 3, 'B'),

  'c310-ws-openaddr-java-E': java('E', 'out'),
  'c310-ws-openaddr-java-why': java('E', 'none'),
  'c310-ws-openaddr-java-why-q2': java('E', 'none'),
  'c310-ws-openaddr-java-C': java('C', 'out'),
};
