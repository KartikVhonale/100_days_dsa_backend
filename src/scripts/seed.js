import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from '../models/Problem.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Pattern from '../models/Pattern.js';
import SpacedRepetition from '../models/SpacedRepetition.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const rawDataPath = path.resolve(__dirname, '../data/striver_raw.json');
const dbJsonPath = path.resolve(__dirname, '../data/db.json');

export async function runSeeder() {
  console.log('[Seeder] Reading striver_raw.json from:', rawDataPath);
  if (!fs.existsSync(rawDataPath)) {
    throw new Error('striver_raw.json not found! Run the download script first.');
  }

  const rawSteps = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));
  const transformedProblems = [];
  let seq = 1;

  // Pattern categories mapping from step title
  function normalizeTopic(stepTitle, subTitle) {
    const s = (stepTitle + ' ' + subTitle).toLowerCase();
    if (s.includes('array')) return 'Arrays';
    if (s.includes('sorting')) return 'Sorting';
    if (s.includes('binary search')) return 'Binary Search';
    if (s.includes('linkedlist') || s.includes('linked list')) return 'Linked List';
    if (s.includes('recursion')) return 'Recursion & Backtracking';
    if (s.includes('bit')) return 'Bit Manipulation';
    if (s.includes('stack') || s.includes('queue')) return 'Stack & Queue';
    if (s.includes('sliding window') || s.includes('two pointer')) return 'Sliding Window & Two Pointer';
    if (s.includes('heap') || s.includes('priority queue')) return 'Heaps';
    if (s.includes('greedy')) return 'Greedy Algorithms';
    if (s.includes('binary search tree') || s.includes('bst')) return 'Binary Search Trees';
    if (s.includes('binary tree') || s.includes('tree')) return 'Binary Trees';
    if (s.includes('graph')) return 'Graphs';
    if (s.includes('dynamic programming') || s.includes('dp')) return 'Dynamic Programming';
    if (s.includes('trie')) return 'Trie';
    if (s.includes('string')) return 'Strings';
    return 'Basics & Maths';
  }

  for (const step of rawSteps) {
    for (const sub of step.sub_steps || []) {
      for (const q of sub.topics || []) {
        const diffNum = Number(q.difficulty);
        const difficulty = diffNum === 0 ? 'Easy' : diffNum === 1 ? 'Medium' : 'Hard';
        const topic = normalizeTopic(step.step_title, sub.sub_step_title);

        // Track eligibility assignment:
        // Track 1: Beginner -> All Easy (132) + early Mediums in Arrays, Binary Search, Linked List, Recursion, Stack, Trees
        // Track 2: Intermediate -> High yield Easy (35) + almost all Mediums (165) + 40 core Hards
        // Track 3: Advanced -> 15 Easy warmups + 175 Mediums + 90 Hards
        // Track 4: Elite -> 40 Mediums + all 136 Hards
        const tracks = ['all'];

        if (difficulty === 'Easy') {
          tracks.push('beginner');
          if (['Arrays', 'Binary Search', 'Linked List', 'Stack & Queue', 'Binary Trees', 'Sliding Window & Two Pointer'].includes(topic)) {
            tracks.push('intermediate');
          }
          if (['Binary Search', 'Sliding Window & Two Pointer', 'Dynamic Programming'].includes(topic)) {
            tracks.push('advanced');
          }
        } else if (difficulty === 'Medium') {
          tracks.push('intermediate');
          tracks.push('advanced');
          // Select fundamental mediums for beginner
          if (['Arrays', 'Binary Search', 'Linked List', 'Recursion & Backtracking', 'Stack & Queue', 'Binary Trees', 'Sliding Window & Two Pointer'].includes(topic)) {
            tracks.push('beginner');
          }
          // High-level mediums for elite
          if (['Dynamic Programming', 'Graphs', 'Trie', 'Heaps', 'Stack & Queue'].includes(topic)) {
            tracks.push('elite');
          }
        } else if (difficulty === 'Hard') {
          tracks.push('elite');
          tracks.push('advanced');
          if (['Arrays', 'Binary Search', 'Dynamic Programming', 'Graphs', 'Binary Trees'].includes(topic)) {
            tracks.push('intermediate');
          }
        }

        let parsedCompanyTags = [];
        if (q.company_tags) {
          try {
            parsedCompanyTags = Array.isArray(q.company_tags) ? q.company_tags : JSON.parse(q.company_tags);
          } catch {
            parsedCompanyTags = [String(q.company_tags)];
          }
        }

        const cleanTitle = q.question_title.trim();
        const lcLink = q.lc_link && q.lc_link.trim() !== ''
          ? q.lc_link.trim()
          : `https://leetcode.com/problemset/all/?search=${encodeURIComponent(cleanTitle)}`;

        const gfgLink = `https://www.geeksforgeeks.org/?s=${encodeURIComponent(cleanTitle)}`;
        const tfLink = q.post_link || q.plus_link || q.editorial_link || 'https://takeuforward.org/';
        const ytLink = q.yt_link || '';

        transformedProblems.push({
          sequenceOrder: seq++,
          striverId: q.id || `striver_${seq}`,
          stepNo: step.step_no,
          stepTitle: step.step_title,
          subStepNo: sub.sub_step_no || 1,
          subStepTitle: sub.sub_step_title,
          topic,
          title: cleanTitle,
          difficulty,
          links: {
            leetcode: lcLink,
            gfg: gfgLink,
            takeuforward: tfLink,
            youtube: ytLink
          },
          companyTags: parsedCompanyTags.length > 0 ? parsedCompanyTags : ['FAANG', 'Top Tech'],
          tracks,
          notes: ''
        });
      }
    }
  }

  // Pre-curated FAANG Algorithmic Patterns
  const initialPatterns = [
    {
      id: 'pat_two_pointers',
      name: 'Two Pointers (Inward Squeeze & Fast/Slow)',
      category: 'Arrays & Pointers',
      signature: 'Sorted array or linked list, searching for pair sums, boundaries, or cycle detection with O(1) space.',
      dataStructure: 'Two index pointers (left/right or slow/fast)',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      keyInsights: [
        'Inward squeeze: left=0, right=n-1; move left if sum < target, right if sum > target.',
        'Floyd cycle finding: slow moves 1 step, fast moves 2 steps; collision implies cycle.'
      ],
      codeTemplate: `function twoSumSorted(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return [-1, -1];
}`,
      exampleProblems: ['11. Container With Most Water', '15. 3Sum', '141. Linked List Cycle']
    },
    {
      id: 'pat_sliding_window',
      name: 'Sliding Window (Dynamic & Fixed)',
      category: 'Arrays & Strings',
      signature: 'Continuous subarray or substring satisfying constraint (longest, shortest, exact sum, unique characters).',
      dataStructure: 'Two pointers (left, right) + Frequency Map / Set',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(K) where K = alphabet size',
      keyInsights: [
        'Expand right pointer to include elements until constraint violated.',
        'Shrink left pointer to restore invariant while updating optimal answer.',
        'Each element entered and exited at most once -> O(2N) = O(N).'
      ],
      codeTemplate: `function longestSubstringWithoutRepeating(s) {
  const map = new Map();
  let maxLen = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (map.has(ch) && map.get(ch) >= left) {
      left = map.get(ch) + 1;
    }
    map.set(ch, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
      exampleProblems: ['3. Longest Substring Without Repeating Characters', '424. Longest Repeating Character Replacement', '76. Minimum Window Substring']
    },
    {
      id: 'pat_monotonic_stack',
      name: 'Monotonic Stack (Next Greater / Smaller)',
      category: 'Stack & Queue',
      signature: 'Need nearest larger or smaller element to left/right, histogram area, stock span.',
      dataStructure: 'Stack maintaining strictly increasing or decreasing order',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      keyInsights: [
        'Next Greater Element: maintain monotonic decreasing stack of indices.',
        'Pop elements from stack whenever current element is strictly larger.',
        'Each index pushed and popped at most once.'
      ],
      codeTemplate: `function dailyTemperatures(temps) {
  const n = temps.length;
  const res = new Array(n).fill(0);
  const stack = []; // indices
  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && temps[i] > temps[stack[stack.length - 1]]) {
      const prevIdx = stack.pop();
      res[prevIdx] = i - prevIdx;
    }
    stack.push(i);
  }
  return res;
}`,
      exampleProblems: ['739. Daily Temperatures', '84. Largest Rectangle in Histogram', '42. Trapping Rain Water']
    },
    {
      id: 'pat_bs_answer',
      name: 'Binary Search on Answer Space',
      category: 'Searching',
      signature: 'Monotonic feasibility function: if answer X works, all Y >= X also work (or vice versa). "Minimize maximum" or "Maximize minimum".',
      dataStructure: 'Integer range [low, high] + isFeasible(mid) predicate',
      timeComplexity: 'O(N * log(Range))',
      spaceComplexity: 'O(1)',
      keyInsights: [
        'Define valid range [low, high] for the target capacity, speed, or distance.',
        'Evaluate mid = Math.floor((low + high) / 2) with helper function.',
        'Narrow search space based on monotonic check.'
      ],
      codeTemplate: `function minEatingSpeed(piles, h) {
  let low = 1, high = Math.max(...piles);
  let ans = high;
  function canFinish(k) {
    let hours = 0;
    for (const p of piles) hours += Math.ceil(p / k);
    return hours <= h;
  }
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (canFinish(mid)) {
      ans = mid;
      high = mid - 1; // seek smaller speed
    } else {
      low = mid + 1;
    }
  }
  return ans;
}`,
      exampleProblems: ['875. Koko Eating Bananas', '1011. Capacity To Ship Packages', '410. Split Array Largest Sum']
    },
    {
      id: 'pat_topological_sort',
      name: "Topological Sort (Kahn's Algorithm & Cycle Detection)",
      category: 'Graphs',
      signature: 'Directed Acyclic Graph (DAG) with prerequisites, dependency resolution, course scheduling.',
      dataStructure: 'Adjacency list + In-degree array + Queue (BFS)',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V + E)',
      keyInsights: [
        'Compute in-degree for every vertex; enqueue vertices with in-degree 0.',
        'While queue not empty, pop u, add to order, decrement in-degree of all neighbors.',
        'If neighbor in-degree reaches 0, enqueue it. If processed count < V, cycle detected!'
      ],
      codeTemplate: `function canFinish(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);
  for (const [dest, src] of prerequisites) {
    adj[src].push(dest);
    inDegree[dest]++;
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }
  let visitedCount = 0;
  while (queue.length > 0) {
    const u = queue.shift();
    visitedCount++;
    for (const v of adj[u]) {
      inDegree[v]--;
      if (inDegree[v] === 0) queue.push(v);
    }
  }
  return visitedCount === numCourses;
}`,
      exampleProblems: ['207. Course Schedule', '210. Course Schedule II', '269. Alien Dictionary']
    },
    {
      id: 'pat_dp_01_knapsack',
      name: '0/1 Knapsack & Subset Sum Space Optimization',
      category: 'Dynamic Programming',
      signature: 'Choosing subset of items with given weights/values to maximize value under capacity W (each item used at most once).',
      dataStructure: '1D DP array traversed in reverse direction',
      timeComplexity: 'O(N * W)',
      spaceComplexity: 'O(W)',
      keyInsights: [
        'State: dp[w] = maximum value achievable with capacity w.',
        'Reverse loop: for w = W down to itemWeight, so previous state represents i-1.',
        'Base case: dp[0] = 0; all other dp[w] = 0 (or -infinity if exact sum required).'
      ],
      codeTemplate: `function canPartition(nums) {
  const sum = nums.reduce((a, b) => a + b, 0);
  if (sum % 2 !== 0) return false;
  const target = sum / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;
  for (const num of nums) {
    for (let w = target; w >= num; w--) {
      dp[w] = dp[w] || dp[w - num];
    }
  }
  return dp[target];
}`,
      exampleProblems: ['416. Partition Equal Subset Sum', '494. Target Sum', '1049. Last Stone Weight II']
    },
    {
      id: 'pat_dp_lcs',
      name: 'Longest Common Subsequence (LCS) & String DP',
      category: 'Dynamic Programming',
      signature: 'Comparison, alignment, edit distance, or commonality between two sequences A and B.',
      dataStructure: '2D DP grid dp[i][j] (or two 1D rows for space optimization)',
      timeComplexity: 'O(N * M)',
      spaceComplexity: 'O(N * M) or O(M)',
      keyInsights: [
        'State: dp[i][j] = LCS of prefix A[0..i-1] and B[0..j-1].',
        'Transition: If A[i-1] == B[j-1]: dp[i][j] = 1 + dp[i-1][j-1].',
        'Else: dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]).',
        'Base cases: dp[i][0] = 0 and dp[0][j] = 0.'
      ],
      codeTemplate: `function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = 1 + dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}`,
      exampleProblems: ['1143. Longest Common Subsequence', '72. Edit Distance', '583. Delete Operation for Two Strings']
    }
  ];

  // Default Candidate User anchoring 100 days
  const defaultUser = {
    userId: 'default_candidate',
    name: 'FAANG Candidate',
    currentTrack: 'intermediate',
    startDate: new Date().toISOString(),
    targetDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString(),
    totalDays: 100,
    dailyHoursTarget: 2.5,
    timezone: 'Asia/Kolkata'
  };

  // Sample initial completed problems for demonstration
  const initialProgress = [
    {
      userId: 'default_candidate',
      problemId: 1, // First problem
      status: 'completed',
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      timeSpentMinutes: 18,
      timeComplexity: 'O(log N)',
      spaceComplexity: 'O(1)',
      patternUsed: 'Math & Digit Extraction',
      notes: 'Handled integer overflow boundaries with INT_MAX / 10 checks.',
      difficultyPerceived: 'Easy'
    },
    {
      userId: 'default_candidate',
      problemId: 2,
      status: 'completed',
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      timeSpentMinutes: 22,
      timeComplexity: 'O(log N)',
      spaceComplexity: 'O(1)',
      patternUsed: 'Math & Digit Extraction',
      notes: 'Clean reverse integer using modulo 10 arithmetic.',
      difficultyPerceived: 'Easy'
    }
  ];

  // Initial Spaced Repetition queue (7-day memory review due today)
  const initialSpacedReviews = [
    {
      id: 'sr_1',
      userId: 'default_candidate',
      problemId: 1,
      problemTitle: transformedProblems[0]?.title || 'Reverse a Number',
      solvedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      reviewDueDate: new Date().toISOString(),
      intervalDays: 7,
      status: 'pending',
      retentionScore: 5
    }
  ];

  const fullDbPayload = {
    users: [defaultUser],
    problems: transformedProblems,
    progress: initialProgress,
    patterns: initialPatterns,
    spacedRepetition: initialSpacedReviews,
    lastSeeded: new Date().toISOString()
  };

  // Write to local JSON storage for instant zero-dependency execution
  fs.writeFileSync(dbJsonPath, JSON.stringify(fullDbPayload, null, 2), 'utf8');
  console.log(`[Seeder] Successfully wrote ${transformedProblems.length} problems to ${dbJsonPath}`);

  // Also seed MongoDB if MONGO_URI is active
  if (process.env.MONGO_URI) {
    try {
      console.log('[Seeder] Attempting to connect to MongoDB at:', process.env.MONGO_URI);
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2000 });
      console.log('[Seeder] Connected to MongoDB. Seeding collections...');

      await Problem.deleteMany({});
      await Problem.insertMany(transformedProblems);

      await User.deleteMany({});
      await User.create(defaultUser);

      await Progress.deleteMany({});
      await Progress.insertMany(initialProgress);

      await Pattern.deleteMany({});
      await Pattern.insertMany(initialPatterns);

      await SpacedRepetition.deleteMany({});
      await SpacedRepetition.insertMany(initialSpacedReviews);

      console.log('[Seeder] MongoDB collections seeded successfully!');
      await mongoose.disconnect();
    } catch (err) {
      console.log('[Seeder] Note: MongoDB connection skipped (' + err.message + '). File store is fully active and ready!');
    }
  }

  return {
    totalProblems: transformedProblems.length,
    usersCount: 1,
    patternsCount: initialPatterns.length
  };
}

// If invoked directly from terminal
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeeder()
    .then(res => {
      console.log('[Seeder] Completed successfully with', res.totalProblems, 'problems!');
      process.exit(0);
    })
    .catch(err => {
      console.error('[Seeder] Failed:', err);
      process.exit(1);
    });
}
