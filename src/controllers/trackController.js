export function getTrackMatrix(req, res) {
  const tracks = [
    {
      id: 'beginner',
      name: 'Track 1: Beginner',
      subtitle: 'Foundations to Core Mediums',
      targetAudience: 'Non-CS grads, new coders, switching languages (Target: L3)',
      prerequisites: 'Basic syntax in one OOP language (Python, Java, C++, JS)',
      targetMix: '50% Easy, 45% Medium, 5% Hard',
      volumeTarget: '150–180 problems',
      dailyCommitment: '3–4 hours/day',
      goal: 'Build algorithmic intuition, master time/space complexity analysis (O(1) to O(2^N)), and solve standard Mediums independently within 35 mins.',
      phases: [
        {
          phase: 'Phase 1 (Days 1–25)',
          title: 'Foundations & Linear Structures',
          topics: 'Core language idioms, memory model, Big-O, Two Pointers, Sliding Window, Prefix Sums, Binary Search (classic & rotated), Singly/Doubly Linked Lists, Fast & Slow pointers.'
        },
        {
          phase: 'Phase 2 (Days 26–55)',
          title: 'Non-Linear Structures & Recursion',
          topics: 'Stacks (Monotonic Stack), Queues, Priority Queues/Heaps (Top-K), Binary Trees (DFS/BFS traversals, Height, Balanced, LCA), Binary Search Trees (BST validation, searching, insertion).'
        },
        {
          phase: 'Phase 3 (Days 56–80)',
          title: 'Graphs, Backtracking & Basic DP',
          topics: 'Backtracking (Subsets, Permutations, Combination Sum), Graph Traversals (BFS, DFS, Flood Fill, Topo Sort / Kahn), 1D DP (Fibonacci variants, Climbing Stairs, House Robber, Coin Change).'
        },
        {
          phase: 'Phase 4 (Days 81–100)',
          title: 'Revision, Speed & Mock Interviews',
          topics: 'Blind 75 completion and review of previously failed problems. Timed 45-min mock sessions (1 Easy + 1 Medium). Behavioral alignment (Amazon LPs / Meta values).'
        }
      ]
    },
    {
      id: 'intermediate',
      name: 'Track 2: Intermediate',
      subtitle: 'Pattern Mastery & Interview Speed',
      targetAudience: '0–2 YOE, knows basics, stuck on LeetCode Mediums (Target: L4)',
      prerequisites: 'Arrays, Linked Lists, simple Recursion, basic Tree traversal',
      targetMix: '20% Easy, 65% Medium, 15% Hard',
      volumeTarget: '220–260 problems',
      dailyCommitment: '2.5–3 hours/day',
      goal: 'Eliminate pattern blindness, optimize O(N^2) naive code to optimal solutions, and reliably solve 2 LeetCode Mediums in 45 minutes.',
      phases: [
        {
          phase: 'Phase 1 (Days 1–25)',
          title: 'Advanced Linear & Non-Linear Patterns',
          topics: 'Binary Search on answer space (Koko Bananas, Ship Packages), Monotonic Stack/Queue variants (Next Greater, Trapping Rain Water, Largest Rectangle in Histogram), Custom Heaps, Two Heaps, Intervals.'
        },
        {
          phase: 'Phase 2 (Days 26–50)',
          title: 'Deep Dive on Graphs & Matrix Problems',
          topics: 'Connected Components, Island problems, Union-Find (DSU with path compression), Shortest Paths (Dijkstra, Bellman-Ford intuition), Trie implementation and prefix search.'
        },
        {
          phase: 'Phase 3 (Days 51–75)',
          title: 'Dynamic Programming & Advanced Trees',
          topics: '2D DP (Grid paths, Longest Common Subsequence, 0/1 Knapsack variations), String DP (Edit Distance, Palindromic Substrings), Tree DP (Diameter of Binary Tree, Max Path Sum).'
        },
        {
          phase: 'Phase 4 (Days 76–100)',
          title: 'Company-Specific Grinding & Timed Rounds',
          topics: 'NeetCode 150 + recent 6-month high frequency company tags. Weekly timed contests (Target: 3/4 solved consistently). Live peer mocks on Pramp / Interviewing.io.'
        }
      ]
    },
    {
      id: 'advanced',
      name: 'Track 3: Advanced',
      subtitle: 'Optimization, Hard Patterns & L4/L5 Bar',
      targetAudience: '3–6 YOE, targets L4/L5, needs speed & DP/Graph polish',
      prerequisites: 'All core DSA, ~150+ LeetCode solved',
      targetMix: '10% Easy, 60% Medium, 30% Hard',
      volumeTarget: '250–300 problems',
      dailyCommitment: '2 hours/day',
      goal: 'Master LeetCode Hard paradigms, optimize space down to O(1) where feasible, and handle multi-step interview rounds under ambiguity.',
      phases: [
        {
          phase: 'Phase 1 (Days 1–25)',
          title: 'Complex DP & Segmented Memoization',
          topics: 'Interval DP (Burst Balloons, Matrix Chain Multiplication), DP on Trees and DAGs, Bitmask Dynamic Programming basics, Advanced Backtracking (N-Queens, Sudoku Solver with pruning).'
        },
        {
          phase: 'Phase 2 (Days 26–50)',
          title: 'Advanced Graphs & Specialized Data Structures',
          topics: "Minimum Spanning Trees (Kruskal, Prim), Strongly Connected Components (Tarjan / Kosaraju), Advanced Trie usage (XOR Maximum, Autocomplete), LRU Cache, LFU Cache."
        },
        {
          phase: 'Phase 3 (Days 51–75)',
          title: 'Hybrid Problems & System-Level Constraints',
          topics: 'Combining multiple structures (Min-Stack with Max-Queue, Hash + Doubly Linked List), Bit manipulation tricks, fast exponentiation, reservoir sampling, math & probability algorithms.'
        },
        {
          phase: 'Phase 4 (Days 76–100)',
          title: 'Meta/Google Fast-Paced Drilling',
          topics: '30-minute solves for Mediums; 40-minute solves for standard Hards. Edge-case hardening, cycle detection in implicit graphs, 2 Coding + 1 System Design per weekend.'
        }
      ]
    },
    {
      id: 'elite',
      name: 'Track 4: Elite / Competitive',
      subtitle: 'Staff+ & Competitive Edge (L5+/L6)',
      targetAudience: 'L6+, CP background, targets Google L5+/Meta E5+, Databricks, Citadel',
      prerequisites: '~400+ solved, Codeforces 1600+ or LC 2100+',
      targetMix: '20% Medium, 80% Hard / Advanced Hard',
      volumeTarget: '180–220 curated Hards',
      dailyCommitment: '1.5–2 hours/day',
      goal: 'Target upper-band roles with heavy algorithmic variance. Speed-solve Hard problems in 20–25 minutes and prove asymptotic correctness mathematically.',
      phases: [
        {
          phase: 'Phase 1 (Days 1–30)',
          title: 'High-End Dynamic Programming & String Automata',
          topics: 'Digit DP, Profile/State Compression DP, SOS (Sum Over Subsets) DP, Suffix Automaton, KMP Algorithm, Z-Algorithm, Aho-Corasick, offline query processing.'
        },
        {
          phase: 'Phase 2 (Days 31–60)',
          title: 'Range Queries, Flow & Spatial Indexing',
          topics: "Segment Trees with Lazy Propagation, Fenwick Trees, Dinic's Max-Flow algorithm for matching/min-cut, QuadTrees, KD-Trees, Convex Hull algorithms."
        },
        {
          phase: 'Phase 3 (Days 61–85)',
          title: 'Extreme Speed & Complex State Problems',
          topics: 'Codeforces Div. 1/2 rounds (aiming for 1800-2100+ rating), solving contest Q4 under 18 mins, Skip Lists, B-Tree concepts, Lock-free concurrent queues.'
        },
        {
          phase: 'Phase 4 (Days 86–100)',
          title: 'Whiteboard Execution & Trade-off Articulation',
          topics: 'Explaining non-standard optimizations (O(N log N) vs O(N) expected), proving loop invariants mathematically, cache locality, SIMD opportunities, branch prediction impacts.'
        }
      ]
    }
  ];

  // Curated 28-day Intermediate Checklist requested in prompt
  const track2CuratedChecklist = [
    { day: 1, focus: 'Two Pointers (Inward Squeeze)', primary: '11. Container With Most Water', secondary: '15. 3Sum', lcPrimary: 'https://leetcode.com/problems/container-with-most-water/', lcSecondary: 'https://leetcode.com/problems/3sum/' },
    { day: 2, focus: 'Two Pointers (Two-Pass / In-Place)', primary: '75. Sort Colors', secondary: '167. Two Sum II - Input Array Is Sorted', lcPrimary: 'https://leetcode.com/problems/sort-colors/', lcSecondary: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
    { day: 3, focus: 'Sliding Window (Dynamic Size)', primary: '3. Longest Substring Without Repeating Characters', secondary: '209. Minimum Size Subarray Sum', lcPrimary: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', lcSecondary: 'https://leetcode.com/problems/minimum-size-subarray-sum/' },
    { day: 4, focus: 'Sliding Window (Frequency Maps)', primary: '424. Longest Repeating Character Replacement', secondary: '567. Permutation in String', lcPrimary: 'https://leetcode.com/problems/longest-repeating-character-replacement/', lcSecondary: 'https://leetcode.com/problems/permutation-in-string/' },
    { day: 5, focus: 'Prefix Sum & Frequency Maps', primary: '560. Subarray Sum Equals K', secondary: '525. Contiguous Array', lcPrimary: 'https://leetcode.com/problems/subarray-sum-equals-k/', lcSecondary: 'https://leetcode.com/problems/contiguous-array/' },
    { day: 6, focus: 'Matrix / 2D Arrays', primary: '48. Rotate Image', secondary: '54. Spiral Matrix', lcPrimary: 'https://leetcode.com/problems/rotate-image/', lcSecondary: 'https://leetcode.com/problems/spiral-matrix/' },
    { day: 7, focus: 'String Manipulation & Hashing', primary: '49. Group Anagrams', secondary: '128. Longest Consecutive Sequence', lcPrimary: 'https://leetcode.com/problems/group-anagrams/', lcSecondary: 'https://leetcode.com/problems/longest-consecutive-sequence/' },
    { day: 8, focus: 'Fast & Slow Pointers / Inversion', primary: '143. Reorder List', secondary: '19. Remove Nth Node From End of List', lcPrimary: 'https://leetcode.com/problems/reorder-list/', lcSecondary: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
    { day: 9, focus: 'Linked List Manipulations', primary: '2. Add Two Numbers', secondary: '148. Sort List', lcPrimary: 'https://leetcode.com/problems/add-two-numbers/', lcSecondary: 'https://leetcode.com/problems/sort-list/' },
    { day: 10, focus: 'Monotonic Stack', primary: '739. Daily Temperatures', secondary: '901. Online Stock Span', lcPrimary: 'https://leetcode.com/problems/daily-temperatures/', lcSecondary: 'https://leetcode.com/problems/online-stock-span/' },
    { day: 11, focus: 'Binary Search (Rotated / Conditionals)', primary: '33. Search in Rotated Sorted Array', secondary: '153. Find Minimum in Rotated Sorted Array', lcPrimary: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', lcSecondary: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
    { day: 12, focus: 'Binary Search on Answer Space', primary: '875. Koko Eating Bananas', secondary: '1011. Capacity To Ship Packages Within D Days', lcPrimary: 'https://leetcode.com/problems/koko-eating-bananas/', lcSecondary: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/' },
    { day: 13, focus: 'Binary Trees (DFS & Depth)', primary: '236. Lowest Common Ancestor of a Binary Tree', secondary: '105. Construct Binary Tree from Preorder and Inorder Traversal', lcPrimary: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', lcSecondary: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/' },
    { day: 14, focus: 'Binary Trees (BFS / Level Order)', primary: '102. Binary Tree Level Order Traversal', secondary: '199. Binary Tree Right Side View', lcPrimary: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', lcSecondary: 'https://leetcode.com/problems/binary-tree-right-side-view/' },
    { day: 15, focus: 'Binary Search Trees', primary: '98. Validate Binary Search Tree', secondary: '230. Kth Smallest Element in a BST', lcPrimary: 'https://leetcode.com/problems/validate-binary-search-tree/', lcSecondary: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/' },
    { day: 16, focus: 'Priority Queue / Top K Elements', primary: '215. Kth Largest Element in an Array', secondary: '347. Top K Frequent Elements', lcPrimary: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', lcSecondary: 'https://leetcode.com/problems/top-k-frequent-elements/' },
    { day: 17, focus: 'Backtracking (Permutations & Subsets)', primary: '78. Subsets', secondary: '46. Permutations', lcPrimary: 'https://leetcode.com/problems/subsets/', lcSecondary: 'https://leetcode.com/problems/permutations/' },
    { day: 18, focus: 'Backtracking (Pruning & Combinations)', primary: '39. Combination Sum', secondary: '79. Word Search', lcPrimary: 'https://leetcode.com/problems/combination-sum/', lcSecondary: 'https://leetcode.com/problems/word-search/' },
    { day: 19, focus: 'Graph BFS/DFS (Grid Traversal)', primary: '200. Number of Islands', secondary: '695. Max Area of Island', lcPrimary: 'https://leetcode.com/problems/number-of-islands/', lcSecondary: 'https://leetcode.com/problems/max-area-of-island/' },
    { day: 20, focus: 'Graph Cycle Detection & State', primary: '133. Clone Graph', secondary: '417. Pacific Atlantic Water Flow', lcPrimary: 'https://leetcode.com/problems/clone-graph/', lcSecondary: 'https://leetcode.com/problems/pacific-atlantic-water-flow/' },
    { day: 21, focus: 'Topological Sort (Kahn’s / DFS)', primary: '207. Course Schedule', secondary: '210. Course Schedule II', lcPrimary: 'https://leetcode.com/problems/course-schedule/', lcSecondary: 'https://leetcode.com/problems/course-schedule-ii/' },
    { day: 22, focus: '1D Dynamic Programming (Decision Tree)', primary: '198. House Robber', secondary: '213. House Robber II', lcPrimary: 'https://leetcode.com/problems/house-robber/', lcSecondary: 'https://leetcode.com/problems/house-robber-ii/' },
    { day: 23, focus: '1D Dynamic Programming (Unbounded/Knapsack)', primary: '322. Coin Change', secondary: '139. Word Break', lcPrimary: 'https://leetcode.com/problems/coin-change/', lcSecondary: 'https://leetcode.com/problems/word-break/' },
    { day: 24, focus: '2D Dynamic Programming (Grids)', primary: '62. Unique Paths', secondary: '64. Minimum Path Sum', lcPrimary: 'https://leetcode.com/problems/unique-paths/', lcSecondary: 'https://leetcode.com/problems/minimum-path-sum/' },
    { day: 25, focus: '2D Dynamic Programming (Subsequences)', primary: '1143. Longest Common Subsequence', secondary: '300. Longest Increasing Subsequence', lcPrimary: 'https://leetcode.com/problems/longest-common-subsequence/', lcSecondary: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
    { day: 26, focus: 'Greedy Intervals', primary: '56. Merge Intervals', secondary: '435. Non-overlapping Intervals', lcPrimary: 'https://leetcode.com/problems/merge-intervals/', lcSecondary: 'https://leetcode.com/problems/non-overlapping-intervals/' },
    { day: 27, focus: 'Disjoint Set / Union-Find', primary: '684. Redundant Connection', secondary: '547. Number of Provinces', lcPrimary: 'https://leetcode.com/problems/redundant-connection/', lcSecondary: 'https://leetcode.com/problems/number-of-provinces/' },
    { day: 28, focus: 'Review & Mixed Assessment', primary: '994. Rotting Oranges', secondary: '416. Partition Equal Subset Sum', lcPrimary: 'https://leetcode.com/problems/rotting-oranges/', lcSecondary: 'https://leetcode.com/problems/partition-equal-subset-sum/' }
  ];

  return res.status(200).json({
    success: true,
    data: {
      tracks,
      track2CuratedChecklist
    }
  });
}
