// AUCSC 310 Algorithm Design & Analysis (M. Qasem). Cards are written per group of course
// files into decks/csc310-{a,b}.js (FC.csc310Cards); this file assembles the class.
// Assignment tags mark the concept cards each graded assignment needs. The assignments'
// own questions and answers are deliberately NOT on any card (graded work).
(function (FC) {
  'use strict';
  (FC.decks = FC.decks || {}).csc310 = {
    id: 'csc310', title: 'CSC 310 · Algorithm Design & Analysis', short: 'CSC 310',
    math: true, // reader-facing text uses inline $...$ LaTeX (rendered by KaTeX)
    lectures: [
      { n: '1', title: 'Intro: algorithms and analysis' }, { n: '2', title: 'Asymptotic analysis' },
      { n: '3', title: 'Growth of functions' }, { n: 'ws-binsearch', title: 'Worksheet: binary search' },
      { n: '4', title: 'Divide and conquer' }, { n: '5', title: 'Recurrences' },
      { n: 'master', title: 'The master theorem' }, { n: '6', title: 'Solving recurrences' },
      { n: '7', title: 'Quicksort' }, { n: 'heap', title: 'Heaps, heapsort, priority queues' },
      { n: 'buildheap', title: 'BuildHeap analysis' }, { n: 'lowerbound', title: 'Sorting lower bound' },
      { n: 'linsort', title: 'Sorting in linear time' }, { n: 'hash', title: 'Hash tables' },
      { n: 'ws-openaddr', title: 'Worksheet: open addressing' },
    ],
    assignments: [
      { id: 'a1', title: 'Assignment 1' },
      { id: 'a2', title: 'Assignment 2: recursion trees' },
      { id: 'a3', title: 'Assignment 3: QuickSort vs MergeSort lab' },
      { id: 'a-pq', title: 'Priority queue assignment' },
      { id: 'a-hash', title: 'Hash table (separate chaining) in Java' },
    ],
    catOrder: ['Foundations', 'Asymptotics', 'Divide & conquer', 'Recurrences', 'Sorting', 'Heaps & priority queues', 'Hashing'],
    cards: FC.csc310Cards || [],
    blanks: [],
  };
})(globalThis.FC = globalThis.FC || {});
